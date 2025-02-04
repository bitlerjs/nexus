import { RequestContextInfo } from './request-context.info.js';

class RequestContext {
  #current: Map<string, RequestContextInfo>;

  constructor() {
    this.#current = new Map<string, RequestContextInfo>();
  }

  public set = (info: RequestContextInfo) => {
    this.#current.set(info.kind, info);
  };
}

export * from './request-context.info.js';
export { RequestContext };
