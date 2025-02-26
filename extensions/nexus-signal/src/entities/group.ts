import { createEntityProvider, Type } from '@bitlerjs/nexus';

import { SignalService } from '../services/services.signal.js';

const groupSchema = Type.Object({
  name: Type.String(),
  id: Type.String(),
  internalId: Type.String(),
});

const signalGroup = createEntityProvider({
  kind: 'signal.contact',
  name: 'Signal Contact',
  description: 'A contact from Signal',
  schema: groupSchema,
  get: async ({ input, container }) => {
    const signalService = container.get(SignalService);
    const accounts = await signalService.get('/v1/accounts');
    const byAccount = await Promise.all(
      accounts.map(async (account) => {
        const response = await signalService.get('/v1/groups/{number}', {
          path: {
            number: account,
          },
        });
        return response.map((contact) => ({
          id: contact.id || 'Unknown',
          internalId: contact.internal_id || 'Unknown',
          name: contact.name || 'Unknown',
        }));
      }),
    );
    const groups = byAccount.flatMap((a) => a).filter((contact) => input.ids.includes(contact.id));
    return groups;
  },
  find: {
    schema: Type.Object({}),
    handler: async ({ container }) => {
      const signalService = container.get(SignalService);
      const accounts = await signalService.get('/v1/accounts');
      const byAccount = await Promise.all(
        accounts.map(async (account) => {
          const response = await signalService.get('/v1/groups/{number}', {
            path: {
              number: account,
            },
          });
          return response.map((contact) => ({
            id: contact.id || 'Unknown',
            internalId: contact.internal_id || 'Unknown',
            name: contact.name || 'Unknown',
          }));
        }),
      );
      const groups = byAccount.flatMap((a) => a);
      return groups;
    },
  },
});

export { signalGroup };
