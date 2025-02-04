import { createTask, Type } from '@bitlerjs/nexus';

import { LinearService } from '../services/services.token.js';

const whoAmITask = createTask({
  kind: 'linear.who-am-i',
  name: 'Linear: Who Am I',
  description: 'Get your current linear user',
  input: Type.Object({}),
  output: Type.Object({
    id: Type.String(),
    name: Type.String(),
    email: Type.String(),
    displayName: Type.String(),
    teams: Type.Array(
      Type.Object({
        id: Type.String(),
        name: Type.String(),
      }),
    ),
  }),
  handler: async ({ container }) => {
    const { client } = container.get(LinearService);
    const viewer = await client.viewer;
    const teams = await client.teams();
    return {
      id: viewer.id,
      name: viewer.name,
      email: viewer.email,
      displayName: viewer.displayName,
      teams: teams.nodes.map((team) => ({
        id: team.id,
        name: team.name,
      })),
    };
  },
});

export { whoAmITask };
