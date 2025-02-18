import { LinearClient } from '@linear/sdk';

class LinearService {
  #token?: string;
  #client?: LinearClient;

  public set token(token: string | undefined) {
    this.#client = undefined;
    this.#token = token;
  }

  public get client() {
    if (!this.#token) {
      throw new Error('Linear token is not set');
    }
    if (!this.#client) {
      this.#client = new LinearClient({ apiKey: this.#token });
    }
    return this.#client;
  }
}

export { LinearService };
