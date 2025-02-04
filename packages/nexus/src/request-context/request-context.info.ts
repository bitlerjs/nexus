import { TSchema } from '@sinclair/typebox';

type RequestContextInfo<TItemSchema extends TSchema = TSchema> = {
  kind: string;
  schema: TItemSchema;
};

const createRequestContextInfo = <TItemSchema extends TSchema = TSchema>(
  requestInfo: RequestContextInfo<TItemSchema>,
) => requestInfo;

class RequestContextInfoService {
  #items: Map<string, RequestContextInfo>;

  constructor() {
    this.#items = new Map<string, RequestContextInfo>();
  }

  public register = (info: RequestContextInfo[]) => {
    info.forEach((item) => {
      this.#items.set(item.kind, item);
    });
  };
}

export { createRequestContextInfo, type RequestContextInfo, RequestContextInfoService };
