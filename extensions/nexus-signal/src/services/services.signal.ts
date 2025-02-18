import { Container } from '@bitlerjs/nexus';

import { Client, createClient } from '../client/client.js';
import { paths } from '../generated/api.js';

import { SignalSocket } from './services.socket.js';

type ApiReponse<TPath extends keyof paths, TMethod extends string> = TMethod extends keyof paths[TPath]
  ? paths[TPath][TMethod] extends { responses: { 200: { schema: infer U } } }
    ? U
    : never
  : never;

type ApiBody<TPath extends keyof paths, TMethod extends string> = TMethod extends keyof paths[TPath]
  ? paths[TPath][TMethod] extends { parameters: { body: { data: infer U } } }
    ? U
    : never
  : never;

type ApiPathParamters<TPath extends keyof paths, TMethod extends string> = TMethod extends keyof paths[TPath]
  ? paths[TPath][TMethod] extends { parameters: { path: infer U } }
    ? U
    : never
  : never;

type ApiQueryParameters<TPath extends keyof paths, TMethod extends string> = TMethod extends keyof paths[TPath]
  ? paths[TPath][TMethod] extends { parameters: { query: infer U } }
    ? U
    : never
  : never;

class SignalService {
  #container: Container;
  #config?: {
    host: string;
    secure: boolean;
  };
  #setupPromise?: Promise<{
    client: Client;
    sockets: SignalSocket[];
  }>;

  constructor(container: Container) {
    this.#container = container;
  }

  public set config(config: { host: string; secure: boolean }) {
    this.#config = config;
    this.destroy();
  }

  #setup = async () => {
    if (!this.#config) {
      throw new Error('No config');
    }
    const { host, secure } = this.#config;
    const client = createClient({
      host,
      secure,
    });
    const response = await client.GET('/v1/accounts');
    if (response.error) {
      throw new Error(response.error instanceof Error ? response.error.message : 'API error');
    }
    const accounts = response.data as string[];
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }
    const sockets = accounts.map(
      (account) =>
        new SignalSocket({
          id: account,
          host,
          secure,
          container: this.#container,
        }),
    );

    return { client, sockets };
  };

  public setup = async () => {
    if (!this.#setupPromise) {
      this.#setupPromise = this.#setup();
    }
    return this.#setupPromise;
  };

  public destroy = async () => {
    if (!this.#setupPromise) {
      return;
    }
    const promise = this.#setupPromise;
    this.#setupPromise = undefined;
    const { sockets } = await promise;
    sockets.forEach((socket) => socket.destroy());
  };

  public getAccounts = async () => {
    const { sockets } = await this.setup();
    return sockets.map((account) => account.id);
  };

  public get = async <TPath extends keyof paths>(
    path: TPath,
    params: {
      query?: ApiQueryParameters<TPath, 'get'>;
      path?: ApiPathParamters<TPath, 'get'>;
    } = {},
  ): Promise<ApiReponse<TPath, 'get'>> => {
    const { client } = await this.setup();
    const { data, error } = await client.GET(path as any, {
      params: {
        query: params.query,
        path: params.path,
      },
    });
    if (error) {
      console.error(error);
      throw new Error('API error');
    }
    return data! as ApiReponse<TPath, 'get'>;
  };

  public post = async <TPath extends keyof paths>(
    path: TPath,
    params: {
      body: ApiBody<TPath, 'post'>;
      query?: ApiQueryParameters<TPath, 'post'>;
      path?: ApiPathParamters<TPath, 'post'>;
    },
  ): Promise<ApiReponse<TPath, 'get'>> => {
    const { client } = await this.setup();
    const { data, error } = await client.POST(path as any, {
      body: params.body,
      params: {
        query: params.query,
        path: params.path,
      },
    });
    if (error) {
      console.error(error);
      throw new Error('API error');
    }
    return data! as ApiReponse<TPath, 'get'>;
  };
}

export { SignalService };
