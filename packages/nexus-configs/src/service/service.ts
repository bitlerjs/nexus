import { Container, Static, TasksService, TSchema } from '@bitlerjs/nexus';
import { Databases } from '@bitlerjs/nexus-data';
import { EventsService } from '@bitlerjs/nexus/dist/events/events.js';

import { Config } from '../types/types.js';
import { ConfigRow, dbConfig } from '../database/database.js';
import { configUpdatedEvent } from '../events/events.updated.js';
import { configTypesUpdated } from '../events/events.types-updated.js';
import { setConfigValueTask } from '../tasks/tasks.set-value.js';
import { getConfigValueTask } from '../tasks/tasks.get-value.js';
import { listConfigTypes } from '../tasks/tasks.list.js';
import { describeConfigType } from '../tasks/tasks.describe.js';

type UseOptions<T extends TSchema> = {
  config: Config<T>;
  handler: (value: Static<T> | undefined) => void | Promise<void>;
  signal?: AbortSignal;
};

class ConfigService {
  #container: Container;
  #configs = new Set<Config<any>>();
  #data = new Map<string, any>();
  #db?: ReturnType<Databases['get']>;

  public constructor(container: Container) {
    this.#container = container;
    const eventsService = this.#container.get(EventsService);
    eventsService.register([configUpdatedEvent, configTypesUpdated]);
    const tasksService = this.#container.get(TasksService);
    tasksService.register([setConfigValueTask, getConfigValueTask, listConfigTypes, describeConfigType]);
  }

  #setupDb = async () => {
    const dbs = this.#container.get(Databases);
    const db = await dbs.get(dbConfig);
    return db;
  };

  #getDb = async () => {
    if (!this.#db) {
      this.#db = this.#setupDb();
    }
    return await this.#db;
  };

  public list = async () => {
    return await Promise.all(
      Array.from(this.#configs).map(async (config) => ({
        kind: config.kind,
        name: config.name,
        description: config.description,
        hasValue: (await this.getValue(config)) !== undefined,
      })),
    );
  };

  public register = (configs: Config<any>[]) => {
    configs.forEach((config) => this.#configs.add(config));

    const eventsService = this.#container.get(EventsService);
    eventsService.emit(configTypesUpdated, {
      kinds: configs.map((config) => config.kind),
    });
  };

  public get = (kind: string) => {
    return Array.from(this.#configs).find((config) => config.kind === kind);
  };

  public removeValue = async (kind: string) => {
    const db = await this.#getDb();
    await db<ConfigRow>('configs').where('kind', kind).delete();
    this.#data.delete(kind);
  };

  public setValue = async <T extends TSchema>(config: Config<T>, value: Static<T>) => {
    const db = await this.#getDb();
    await db<ConfigRow>('configs')
      .insert({
        kind: config.kind,
        data: value,
      })
      .onConflict('kind')
      .merge({
        data: value,
      });
    this.#data.set(config.kind, value);
    const eventsService = this.#container.get(EventsService);
    eventsService.emit(configUpdatedEvent, {
      kind: config.kind,
      value,
    });
  };

  public getValue = async <T extends TSchema>(config: Config<T>) => {
    if (!this.#data.has(config.kind)) {
      const db = await this.#getDb();
      const [row] = await db<ConfigRow>('configs').where('kind', config.kind).limit(1);
      if (row) {
        this.#data.set(config.kind, row.data);
      }
    }
    return this.#data.get(config.kind) as Static<T> | undefined;
  };

  public use = async <T extends TSchema>(options: UseOptions<T>) => {
    const eventsService = this.#container.get(EventsService);
    eventsService.subscribe({
      event: configUpdatedEvent,
      input: {
        kinds: [options.config.kind],
      },
      handler: async ({ value }) => {
        await options.handler(value as T);
      },
      abortSignal: options.signal,
    });
    const value = await this.getValue(options.config);
    await options.handler(value);
  };
}

export { ConfigService };
