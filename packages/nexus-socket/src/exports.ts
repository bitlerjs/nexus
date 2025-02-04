import { Static, TSchema, Type } from '@sinclair/typebox';
import { nanoid } from 'nanoid';

const createResolvable = <T>() => {
  let resolve: (value: T) => void;
  let reject: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { promise, resolve: resolve!, reject: reject! };
};

const requests = {
  'task.run': {
    input: Type.Object({
      kind: Type.String(),
      input: Type.Any(),
      continuation: Type.Optional(Type.Record(Type.String(), Type.Record(Type.String(), Type.Unknown()))),
    }),
    output: Type.Object({
      result: Type.Any(),
      continuation: Type.Record(Type.String(), Type.Record(Type.String(), Type.Unknown())),
    }),
  },
  'task.list': {
    input: Type.Object({}),
    output: Type.Array(
      Type.Object({
        kind: Type.String(),
        name: Type.String(),
        description: Type.String(),
      }),
    ),
  },
  'task.describe': {
    input: Type.Object({
      kind: Type.String(),
    }),
    output: Type.Object({
      kind: Type.String(),
      name: Type.String(),
      description: Type.String(),
      input: Type.Any(),
      output: Type.Any(),
    }),
  },
  'event.list': {
    input: Type.Object({}),
    output: Type.Array(
      Type.Object({
        kind: Type.String(),
        name: Type.String(),
        description: Type.String(),
      }),
    ),
  },
  'event.describe': {
    input: Type.Object({
      kind: Type.String(),
    }),
    output: Type.Object({
      kind: Type.String(),
      name: Type.String(),
      description: Type.String(),
      input: Type.Any(),
      output: Type.Any(),
    }),
  },
  'event.subscribe': {
    input: Type.Object({
      kind: Type.String(),
      id: Type.String(),
      input: Type.Any(),
    }),
    output: Type.Object({}),
  },
  'event.unsubscribe': {
    input: Type.Object({
      id: Type.String(),
    }),
    output: Type.Object({}),
  },
} satisfies Record<string, { input: TSchema; output: TSchema }>;

type RequestType = keyof typeof requests;

type RequestHandler<TType extends RequestType> = (
  payload: Static<(typeof requests)[TType]['input']>,
) => Promise<Static<(typeof requests)[TType]['output']>>;

type RequestPayload<TType extends RequestType> = Static<(typeof requests)[TType]['input']>;
type RequestResponse<TType extends RequestType> = Static<(typeof requests)[TType]['output']>;

const createRequest = <TType extends keyof typeof requests>(
  type: TType,
  payload: Static<(typeof requests)[TType]['input']>,
) => {
  const id = nanoid();
  const schema = requests[type];
  const { promise, resolve, reject } = createResolvable<Static<(typeof requests)[TType]['output']>>();

  const body = {
    type,
    id,
    payload,
  };

  const process = (data: unknown) => {
    if (!data || typeof data !== 'object') {
      return;
    }
    if (!('id' in data) || data.id !== id) {
      return;
    }
    if (!('type' in data) || data.type !== 'reply') {
      return;
    }
    if (!('payload' in data) || typeof data.payload !== 'object' || !data.payload) {
      return;
    }
    if ('status' in data.payload && data.payload.status === 'success' && 'data' in data.payload) {
      resolve(data.payload.data as Static<(typeof requests)[TType]['output']>);
    } else if ('status' in data.payload && data.payload.status === 'error' && 'message' in data.payload) {
      reject(new Error(String(data.payload.message)));
    }
  };

  return {
    schema,
    body,
    promise,
    process,
  };
};

type CreateResponserOptions = {
  [TKey in keyof typeof requests]: (
    payload: Static<(typeof requests)[TKey]['input']>,
  ) => Promise<Static<(typeof requests)[TKey]['output']>>;
};
const createResponder = (options: CreateResponserOptions) => {
  const getResponse = async (data: unknown) => {
    try {
      if (!data || typeof data !== 'object') {
        return;
      }
      if (!('type' in data) || typeof data.type !== 'string') {
        return;
      }
      if (!('id' in data) || typeof data.id !== 'string') {
        return;
      }
      if (!('payload' in data) || typeof data.payload !== 'object' || !data.payload) {
        return;
      }
      const responder = options[data.type as keyof typeof options];
      if (!responder) {
        throw new Error('Unknown request type');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await responder(data.payload as any);

      return {
        type: 'reply',
        id: data.id,
        payload: {
          status: 'success',
          data: response,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        type: 'reply',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (data as any)?.id,
        payload: {
          status: 'error',
          message: String(error),
        },
      };
    }
  };

  return { getResponse };
};

export {
  createRequest,
  createResponder,
  type RequestType,
  type RequestHandler,
  type RequestPayload,
  type RequestResponse,
};
