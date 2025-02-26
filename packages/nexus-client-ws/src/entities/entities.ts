import { ServerDefinition } from '@bitlerjs/nexus-client';

import { Socket } from '../socket/socket.js';

type EntitiesOptions = {
  socket: Socket;
};

class Entities<TSchema extends ServerDefinition = ServerDefinition> {
  #options: EntitiesOptions;

  constructor(options: EntitiesOptions) {
    this.#options = options;
  }

  public list = async () => {
    const { socket } = this.#options;
    return socket.request('entity.list', {});
  };

  public describe = async (kind: string) => {
    const { socket } = this.#options;
    return socket.request('entity.describe', {
      kind,
    });
  };

  public get = async <TKind extends keyof TSchema['entities']>(
    kind: TKind,
    ids: string[],
  ): Promise<TSchema['entities'][TKind]['item'][]> => {
    const { socket } = this.#options;
    const response = await socket.request('entity.get', { kind: String(kind), ids });
    return response as TSchema['entities'][TKind]['item'][];
  };

  public find = async <TKind extends keyof TSchema['entities']>(
    kind: TKind,
    input: TSchema['entities'][TKind]['find'],
  ): Promise<TSchema['entities'][TKind]['item'][]> => {
    const { socket } = this.#options;
    const response = await socket.request('entity.find', { kind: String(kind), input });
    return response as TSchema['entities'][TKind]['item'][];
  };

  public create = async <TKind extends keyof TSchema['entities']>(
    kind: TKind,
    input: TSchema['entities'][TKind]['create'],
  ): Promise<{ id: string }> => {
    const { socket } = this.#options;
    const response = await socket.request('entity.create', { kind: String(kind), input });
    return response;
  };

  public update = async <TKind extends keyof TSchema['entities']>(
    kind: TKind,
    input: TSchema['entities'][TKind]['update'],
  ): Promise<void> => {
    const { socket } = this.#options;
    await socket.request('entity.update', { kind: String(kind), input });
  };
}

export { Entities };
