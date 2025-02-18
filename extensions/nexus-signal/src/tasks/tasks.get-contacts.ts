import { createTask, Type } from '@bitlerjs/nexus';

import { SignalService } from '../services/services.signal.js';

const getContactsTask = createTask({
  kind: 'signal.get-contacts',
  name: 'Get Contacts',
  group: 'Signal',
  description: 'Get contacts from Signal',
  input: Type.Object({}),
  output: Type.Object({
    contacts: Type.Array(
      Type.Object({
        name: Type.String(),
        phone: Type.String(),
      }),
    ),
  }),
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
    return { contacts };
  },
});

export { getContactsTask };
