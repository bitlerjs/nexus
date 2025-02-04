import { createTask, Type } from '@bitlerjs/nexus';

import { LinearService } from '../services/services.token.js';
import { issueSchema } from '../schemas/schemas.js';
import { issueContinuation } from '../continuation/continuation.issue.js';

const assignedIssuesTask = createTask({
  kind: 'linear.assigned-issues',
  name: 'Linear: Assigned Issues',
  description: 'Get a list of issues/tasks assigned to you in Linear',
  input: Type.Object({}),
  output: Type.Array(issueSchema),
  handler: async ({ container, continuation }) => {
    const { client } = container.get(LinearService);
    const viewer = await client.viewer;
    const issues = await viewer.assignedIssues({
      filter: {
        completedAt: {
          null: true,
        },
        canceledAt: {
          null: true,
        },
      },
    });
    const results = issues.nodes.map((issue) => ({
      id: issue.identifier,
      title: issue.title,
      startedAt: issue.startedAt?.toISOString(),
      storyPoints: issue.estimate,
      priority: issue.priority,
      completedAt: issue.completedAt?.toISOString(),
      canceledAt: issue.canceledAt?.toISOString(),
      description: issue.description,
    }));

    continuation.clear(issueContinuation);
    for (const issue of results) {
      continuation.set({
        item: issueContinuation,
        id: issue.id,
        value: issue,
      });
    }

    return results;
  },
});

export { assignedIssuesTask };
