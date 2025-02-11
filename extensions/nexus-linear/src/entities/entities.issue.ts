import { createEntityProvider } from '@bitlerjs/nexus';

import { issueSchema } from '../schemas/schemas.js';
import { LinearService } from '../services/services.token.js';

const linearIssueEntity = createEntityProvider({
  kind: 'linear.issue',
  name: 'Linear Issue',
  description: 'A Linear issue/task',
  schema: issueSchema,
  get: async ({ container, input }) => {
    const { client } = container.get(LinearService);

    return await Promise.all(
      input.ids.map(async (id) => {
        const issue = await client.issue(id);
        const creator = await issue.creator;
        const assignee = await issue.assignee;
        const state = await issue.state;

        const result = {
          id: issue.identifier,
          title: issue.title,
          startedAt: issue.startedAt?.toISOString(),
          storyPoints: issue.estimate,
          priority: issue.priority,
          completedAt: issue.completedAt?.toISOString(),
          canceledAt: issue.canceledAt?.toISOString(),
          description: issue.description,
          state: state && {
            id: state.id,
            name: state.name,
          },
          creator: creator && {
            id: creator.id,
            isMe: creator.isMe,
            name: creator.name,
            email: creator.email,
            displayName: creator.displayName,
          },
          assignee: assignee && {
            id: assignee.id,
            isMe: assignee.isMe,
            name: assignee.name,
            email: assignee.email,
            displayName: assignee.displayName,
          },
        };
        return result;
      }),
    );
  },
});

export { linearIssueEntity };
