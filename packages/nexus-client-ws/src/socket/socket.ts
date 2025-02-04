import { EventEmitter } from 'eventemitter3';
import { createRequest, type RequestPayload, RequestResponse, type RequestType } from '@bitlerjs/nexus-socket';

type SocketOptions = {
  url: string;
  token: string;
};

type SocketEvents = {
  connected: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: (data: any) => void;
  close: () => void;
};

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
      socket.addEventListener('open', async () => {
        socket.send(JSON.stringify({ type: 'authenticate', payload: { token: this.#options.token } }));
      });

      socket.addEventListener('close', () => {
        this.#socket = undefined;
        this.emit('close');
        if (!this.#closed) {
          resolve(this.#setup());
        }
      });

      socket.addEventListener('error', (error) => {
        reject(error);
      });

      socket.addEventListener('message', ({ data }) => {
        this.emit('message', JSON.parse(data));
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
    const request = createRequest(type, payload);
    socket.addEventListener(
      'message',
      ({ data }) => {
        request.process(JSON.parse(data));
      },
      {},
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
