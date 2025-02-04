import { TSchema } from '@sinclair/typebox';

type ContinuationItem<TItemSchema extends TSchema = TSchema> = {
  kind: string;
  name: string;
  description: string;
  schema: TItemSchema;
};

const createContinuationItem = <TItemSchema extends TSchema>(item: ContinuationItem<TItemSchema>) => item;

class ContinuationItemsService {
  #items: Map<string, ContinuationItem>;

  constructor() {
    this.#items = new Map();
  }

  public register = (items: ContinuationItem[]) => {
    items.forEach((item) => {
      this.#items.set(item.kind, item);
    });
  };
}

export { type ContinuationItem, createContinuationItem, ContinuationItemsService };
