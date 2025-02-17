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

// TODO: FIX
const host = 'localhost';
const secure = false;

class SignalService {
  #client: Client;
  #container: Container;
  #setupPromise: Promise<SignalSocket[]> | null = null;

  constructor(container: Container) {
    this.#container = container;
    this.#client = createClient({
      host,
      secure,
    });
  }

  #setup = async () => {
    const accounts = await this.get('/v1/accounts');
    if (!accounts) {
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

    return sockets;
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

    const sockets = await this.#setupPromise;
    sockets.forEach((socket) => socket.destroy());
  };

  public getAccounts = async () => {
    const accounts = await this.setup();
    return accounts.map((account) => account.id);
  };

  public get = async <TPath extends keyof paths>(
    path: TPath,
    params: {
      query?: ApiQueryParameters<TPath, 'get'>;
      path?: ApiPathParamters<TPath, 'get'>;
    } = {},
  ): Promise<ApiReponse<TPath, 'get'>> => {
    const { data, error } = await this.#client.GET(path as any, {
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
    const { data, error } = await this.#client.POST(path as any, {
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
