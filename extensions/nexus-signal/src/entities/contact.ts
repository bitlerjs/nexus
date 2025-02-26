import { createEntityProvider, Type } from '@bitlerjs/nexus';

import { SignalService } from '../services/services.signal.js';

const contactSchema = Type.Object({
  name: Type.String(),
  phone: Type.String(),
});

const signalContact = createEntityProvider({
  kind: 'signal.contact',
  name: 'Signal Contact',
  description: 'A contact from Signal',
  schema: contactSchema,
  get: async ({ input, container }) => {
    const signalService = container.get(SignalService);
    const accounts = await signalService.get('/v1/accounts');
    const contactGroups = await Promise.all(
      accounts.map(async (account) => {
        const response = await signalService.get('/v1/contacts/{number}', {
          path: {
            number: account,
          },
        });
        return response.map((contact) => ({
          name: contact.profile_name || contact.name || contact.username || contact.number || 'Unknown',
          phone: contact.number || 'Unknown',
        }));
      }),
    );
    const contacts = contactGroups.flatMap((a) => a).filter((contact) => input.ids.includes(contact.phone));
    return contacts;
  },
  find: {
    schema: Type.Object({}),
    handler: async ({ container }) => {
      const signalService = container.get(SignalService);
      const accounts = await signalService.get('/v1/accounts');
      const contactGroups = await Promise.all(
        accounts.map(async (account) => {
          const response = await signalService.get('/v1/contacts/{number}', {
            path: {
              number: account,
            },
          });
          return response.map((contact) => ({
            name: contact.profile_name || contact.name || contact.username || contact.number || 'Unknown',
            phone: contact.number || 'Unknown',
          }));
        }),
      );
      const contacts = contactGroups.flatMap((a) => a);
      return contacts;
    },
  },
});

export { signalContact };
