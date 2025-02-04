import { JSONSchema4Type } from 'json-schema';

import { Container } from '../container/container.js';
import { EntityProvider, EntityProvidersService } from '../entities/entities.js';
import { Task, TasksService } from '../tasks/tasks.js';
import { SourceProvider, SourceProvidersService } from '../sources/sources.js';
import { Event, EventsService } from '../events/events.js';

type Specs = {
  tasks: Record<
    string,
    {
      name: string;
      description: string;
      schema: {
        output: JSONSchema4Type;
        input: JSONSchema4Type;
      };
    }
  >;
  entities: Record<
    string,
    {
      name: string;
      description: string;
      schema: JSONSchema4Type;
    }
  >;
  sources: Record<
    string,
    {
      name: string;
      description: string;
      schema: JSONSchema4Type;
    }
  >;
  events: Record<
    string,
    {
      name: string;
      description: string;
      schema: {
        input: JSONSchema4Type;
        output: JSONSchema4Type;
      };
    }
  >;
};

type GenerateSpecsOptions = {
  tasks: Task<any, any>[];
  entities: EntityProvider<any>[];
  sources: SourceProvider<any>[];
  events: Event<any, any>[];
};
const generateSpecs = (options: GenerateSpecsOptions): Specs => ({
  tasks: Object.fromEntries(
    options.tasks.map((task) => [
      task.kind,
      {
        name: task.name,
        description: task.description,
        schema: {
          output: task.output,
          input: task.input,
        },
      },
    ]),
  ),
  entities: Object.fromEntries(
    options.entities.map((entityProvider) => [
      entityProvider.kind,
      {
        name: entityProvider.name,
        description: entityProvider.description,
        schema: entityProvider.schema,
      },
    ]),
  ),
  sources: Object.fromEntries(
    options.sources.map((sourceProvider) => [
      sourceProvider.kind,
      {
        name: sourceProvider.name,
        description: sourceProvider.description,
        schema: sourceProvider.schema,
      },
    ]),
  ),
  events: Object.fromEntries(
    options.events.map((event) => [
      event.kind,
      {
        name: event.name,
        description: event.description,
        schema: {
          input: event.input,
          output: event.output,
        },
      },
    ]),
  ),
});

class SpecsService {
  #container: Container;

  constructor(container: Container) {
    this.#container = container;
  }

  public generate = () => {
    const tasksService = this.#container.get(TasksService);
    const entitityProviderService = this.#container.get(EntityProvidersService);
    const sourcesProviderSerice = this.#container.get(SourceProvidersService);
    const eventsService = this.#container.get(EventsService);

    const specs = generateSpecs({
      tasks: tasksService.list(),
      entities: entitityProviderService.list(),
      sources: sourcesProviderSerice.list(),
      events: eventsService.list(),
    });

    return specs;
  };
}

export { SpecsService, generateSpecs, type Specs };
