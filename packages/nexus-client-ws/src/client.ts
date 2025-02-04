import { EventEmitter } from 'eventemitter3';
import { ServerDefinition } from '@bitlerjs/nexus-client';

import { Tasks } from './tasks/tasks.js';
import { Events } from './events/events.js';
import { Socket } from './socket/socket.js';

type ClientOptions = {
  url: string;
  token: string;
};

type ClientEvents = {
  connected: () => void;
  disconnected: () => void;
};

class Client<TSchema extends ServerDefinition = ServerDefinition> extends EventEmitter<ClientEvents> {
  #socket: Socket;
  #tasks: Tasks<TSchema>;
  #events: Events<TSchema>;
  #connected = false;

  constructor(options: ClientOptions) {
    super();
    this.#socket = new Socket({ url: options.url, token: options.token });
    this.#tasks = new Tasks({ socket: this.#socket });
    this.#events = new Events({ socket: this.#socket });

    this.#socket.on('connected', this.#onConnect);
    this.#socket.on('close', this.#onDisconnect);
  }

  public get connected() {
    return this.#connected;
  }

  public get tasks() {
    return this.#tasks;
  }

  public get events() {
    return this.#events;
  }

  public close = () => {
    this.#socket.close();
  };

  public ready = async () => {
    await this.#socket.getSocket();
  };

  #onConnect = () => {
    this.#connected = true;
  };

  #onDisconnect = () => {
    this.#connected = false;
  };
}

export * from './tasks/tasks.js';
export { Client, type ServerDefinition };
