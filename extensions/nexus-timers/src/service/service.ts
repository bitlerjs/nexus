import { EventEmitter } from 'eventemitter3';
import { nanoid } from 'nanoid';
import { Container, Static } from '@bitlerjs/nexus';
import { Databases } from '@bitlerjs/nexus-data';
import { EventsService } from '@bitlerjs/nexus/dist/events/events.js';

import { dbConfig } from '../database/database.js';
import { timerTriggeredEvent } from '../events/events.triggered.js';
import { timerUpdatedEvent } from '../events/events.updated.js';
import { timerCreatedEvent } from '../events/events.created.js';
import { addTimerSchema } from '../schemas/schemas.js';

type TimerEvents = {
  trigger: (id: string) => void;
};

type Timer = {
  description?: string;
  duration: number;
  start: Date;
  timeout: NodeJS.Timeout;
};

class TimerService extends EventEmitter<TimerEvents> {
  #container: Container;
  #timers = new Map<string, Timer>();

  constructor(container: Container) {
    super();
    this.#container = container;
    this.on('trigger', async (id) => {
      const dbs = this.#container.get(Databases);
      const db = await dbs.get(dbConfig);
      const timer = this.#timers.get(id);
      this.#timers.delete(id);
      await db('timers').where('id', id).delete();
      if (timer) {
        clearTimeout(timer.timeout);
        const eventsService = this.#container.get(EventsService);
        eventsService.emit(timerTriggeredEvent, {
          id,
          description: timer.description,
          duration: timer.duration,
        });
        eventsService.emit(timerUpdatedEvent, {
          id,
          description: timer.description,
          duration: timer.duration,
          action: 'removed',
        });
      }
    });
  }

  #setup = async () => {
    const dbs = this.#container.get(Databases);
    const db = await dbs.get(dbConfig);

    const timers = await db('timers').select();
    for (const timer of timers) {
      const duration = timer.duration;
      const description = timer.description;
      const start = new Date(timer.start);
      const id = timer.id;
      const triggerTime = start.getTime() + duration;
      const triggerDelay = triggerTime - Date.now();

      const timeout = setTimeout(
        () => {
          this.emit('trigger', id);
        },
        Math.max(triggerDelay, 0),
      );

      this.#timers.set(id, { duration, description, start, timeout });
    }
  };

  public get = (id: string) => {
    return this.#timers.get(id);
  };

  public start = async () => {
    await this.#setup();
  };

  public listTimers = async () => {
    return Array.from(this.#timers.entries()).map(([id, timer]) => ({
      id,
      description: timer.description,
      duration: timer.duration,
      start: timer.start.toISOString(),
    }));
  };

  public addTimer = async (options: Static<typeof addTimerSchema>) => {
    const id = nanoid();
    const dbs = this.#container.get(Databases);
    const db = await dbs.get(dbConfig);

    this.#timers.set(id, {
      duration: options.duration,
      description: options.description,
      start: new Date(),
      timeout: setTimeout(() => {
        this.emit('trigger', id);
      }, options.duration * 1000),
    });

    await db('timers').insert({
      id,
      duration: options.duration,
      description: options.description,
      start: new Date(),
    });

    const eventsService = this.#container.get(EventsService);
    eventsService.emit(timerUpdatedEvent, {
      id,
      description: options.description,
      duration: options.duration,
      action: 'created',
    });
    eventsService.emit(timerCreatedEvent, {
      id,
      description: options.description,
      duration: options.duration,
    });

    return { id };
  };

  public removeTimer = async (id: string) => {
    const timer = this.#timers.get(id);
    if (timer) {
      clearTimeout(timer.timeout);
      const eventsService = this.#container.get(EventsService);
      eventsService.emit(timerUpdatedEvent, {
        id,
        description: timer.description,
        duration: timer.duration,
        action: 'removed',
      });
    }
    this.#timers.delete(id);

    const dbs = this.#container.get(Databases);
    const db = await dbs.get(dbConfig);
    await db('timers').where('id', id).delete();

    return this.listTimers();
  };
}

export { TimerService };
