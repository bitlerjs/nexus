import { createTask, Type } from '@bitlerjs/nexus';

import { SignalService } from '../services/services.signal.js';

const getGroupsTask = createTask({
  kind: 'signal.get-groups',
  name: 'Get Groups',
  group: 'Signal',
  description: 'Get groups from Signal',
  input: Type.Object({}),
  output: Type.Object({
    groups: Type.Array(
      Type.Object({
        name: Type.String(),
        id: Type.String(),
        internalId: Type.String(),
      }),
    ),
  }),
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
    return { groups };
  },
});

export { getGroupsTask };
