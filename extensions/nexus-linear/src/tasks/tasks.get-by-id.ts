import { createTask, Type } from '@bitlerjs/nexus';

import { LinearService } from '../services/services.token.js';
import { issueSchema } from '../schemas/schemas.js';
import { issueContinuation } from '../continuation/continuation.issue.js';

const getByIdTask = createTask({
  kind: 'linear.get-by-id',
  name: 'Linear: Get By ID',
  description: 'Get a specific Linear issue by its ID',
  input: Type.Object({
    id: Type.String(),
  }),
  output: issueSchema,
  handler: async ({ container, input, continuation }) => {
    const { client } = container.get(LinearService);
    const issue = await client.issue(input.id);
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

    continuation.set({
      item: issueContinuation,
      value: result,
      id: issue.identifier,
    });

    return result;
  },
});

export { getByIdTask };
