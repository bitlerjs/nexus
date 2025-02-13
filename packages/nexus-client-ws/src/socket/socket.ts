import { EventEmitter } from 'eventemitter3';
import { createRequest, type RequestPayload, RequestResponse, type RequestType } from '@bitlerjs/nexus-socket';

type SocketOptions = {
  url: string;
  headers?: Record<string, string>;
};

type SocketEvents = {
  connected: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: (data: any) => void;
  close: () => void;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class Socket extends EventEmitter<SocketEvents> {
  #options: SocketOptions;
  #socket?: Promise<WebSocket>;
  #closed = false;

  constructor(options: SocketOptions) {
    super();
    this.#options = options;
  }

  #setup = () =>
    new Promise<WebSocket>((resolve, reject) => {
      if (this.#closed) {
        return;
      }
      const { url } = this.#options;
      const socket = new WebSocket(`${url}/api/ws`);
      const authListener = ({ data }: MessageEvent) => {
        const message = JSON.parse(data);
        if (message.type === 'authenticated') {
          socket.removeEventListener('message', authListener);
          resolve(socket);
          this.emit('connected');
        }
      };
      socket.addEventListener('message', authListener);

      socket.addEventListener('close', async () => {
        this.#socket = undefined;
        this.emit('close');
        if (!this.#closed) {
          await sleep(3000);
          resolve(this.#setup());
        }
      });

      socket.addEventListener('error', (error) => {
        reject(error);
      });

      socket.addEventListener('message', ({ data }) => {
        this.emit('message', JSON.parse(data));
      });

      socket.addEventListener('open', async () => {
        socket.send(JSON.stringify({ type: 'authenticate', payload: { headers: this.#options.headers || {} } }));
      });
    });

  public getSocket = async () => {
    if (!this.#socket) {
      this.#socket = this.#setup();
    }
    return this.#socket;
  };

  public request = async <TType extends RequestType>(
    type: TType,
    payload: RequestPayload<TType>,
  ): Promise<RequestResponse<TType>> => {
    const socket = await this.getSocket();
    const abortController = new AbortController();
    const request = createRequest(type, payload);
    socket.addEventListener('message', ({ data }) => {
      request.process(JSON.parse(data));
    });
    abortController.signal.addEventListener('abort', () => {
      socket.removeEventListener('message', request.process);
    });
    socket.addEventListener(
      'close',
      () => {
        abortController.abort();
        request.reject(new Error('Socket closed'));
      },
      {
        signal: abortController.signal,
      },
    );
    socket.send(JSON.stringify(request.body));
    return request.promise;
  };

  public close = async () => {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    const socket = await this.#socket;
    socket?.close();
    this.removeAllListeners();
  };
}

export { Socket };
