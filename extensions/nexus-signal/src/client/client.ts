import createBaseClient from 'openapi-fetch';

import { paths } from '../generated/api.js';

type CreateClientOptions = {
  host: string;
  secure: boolean;
};
const createClient = ({ host, secure }: CreateClientOptions) => {
  const client = createBaseClient<paths>({
    baseUrl: `${secure ? 'https' : 'http'}://${host}`,
  });

  return client;
};

type Client = ReturnType<typeof createClient>;

export { createClient, type Client };
