import { Static, TSchema } from '@sinclair/typebox';

type FilterOptions<TInputSchema extends TSchema, TOutputSchema extends TSchema> = {
  input: Static<TInputSchema>;
  event: Static<TOutputSchema>;
};

type InitOptions<TInputSchema extends TSchema> = {
  input: Static<TInputSchema>;
};

type Event<TInputSchema extends TSchema = TSchema, TOutputSchema extends TSchema = TSchema> = {
  kind: string;
  name: string;
  description: string;
  input: TInputSchema;
  output: TOutputSchema;
  filter?: (options: FilterOptions<TInputSchema, TOutputSchema>) => Promise<boolean>;
  init?: (options: InitOptions<TInputSchema>) => Promise<Static<TOutputSchema>[]>;
};

const createEvent = <TInputSchema extends TSchema, TOutputSchema extends TSchema>(
  event: Event<TInputSchema, TOutputSchema>,
) => event;

export { type Event, createEvent };
