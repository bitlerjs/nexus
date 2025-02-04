import { createTask, Type } from '@bitlerjs/nexus';

import { LinearService } from '../services/services.token.js';
import { issueSchema } from '../schemas/schemas.js';
import { issueContinuation } from '../continuation/continuation.issue.js';

const getBySprintTask = createTask({
  kind: 'linear.get-issues-sprint',
  name: 'Linear: Get issues for the current sprint',
  description: 'Get a list of issues/tasks for the teams current sprint',
  input: Type.Object({
    teamId: Type.String(),
  }),
  output: Type.Array(issueSchema),
  handler: async ({ container, input, continuation }) => {
    const { client } = container.get(LinearService);
    const team = await client.team(input.teamId);
    const cycles = await team.cycles({
      filter: { isActive: { eq: true } },
    });
    if (cycles.nodes.length === 0) {
      throw new Error(`No active sprint found for team ${team.name}`);
    }

    const currentCycle = cycles.nodes[0];
    const issues = await currentCycle.issues({
      first: 100,
    });

    const results = await Promise.all(
      issues.nodes.map(async (issue) => {
        const assignee = await issue.assignee;
        return {
          id: issue.identifier,
          title: issue.title,
          startedAt: issue.startedAt?.toISOString(),
          storyPoints: issue.estimate,
          priority: issue.priority,
          completedAt: issue.completedAt?.toISOString(),
          canceledAt: issue.canceledAt?.toISOString(),
          assignee: assignee && {
            id: assignee.id,
            isMe: assignee.isMe,
            name: assignee.name,
            email: assignee.email,
            displayName: assignee.displayName,
          },
        };
      }),
    );

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

export { getBySprintTask };
