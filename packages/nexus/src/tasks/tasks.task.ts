import { Static, TAnySchema, TSchema } from '@sinclair/typebox';

import { RequestContext } from '../request-context/request-context.js';
import { Sources } from '../sources/sources.js';
import { Container } from '../container/container.js';
import { Continuation } from '../continuation/continuation.js';
import { BootstrapItem } from '../bootstrap/bootstrap.item.js';

type TaskHandlerOptions<TInptSchema extends TSchema> = {
  input: Static<TInptSchema>;
  requestContext: RequestContext;
  continuation: Continuation;
  sources: Sources;
  container: Container;
};

type Task<TInputSchema extends TAnySchema = TAnySchema, TOutputSchema extends TAnySchema = TAnySchema> = {
  kind: string;
  name: string;
  group?: string;
  description: string;
  bootstrap?: BootstrapItem<any>[];
  input: TInputSchema;
  output: TOutputSchema;
  handler: (options: TaskHandlerOptions<TInputSchema>) => Promise<Static<TOutputSchema>>;
};

const createTask = <TInputSchema extends TSchema, TOutputSchema extends TSchema>(
  task: Task<TInputSchema, TOutputSchema>,
) => task as Task<TInputSchema, TOutputSchema>;

export { createTask, type Task };
