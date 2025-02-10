import { Type } from '@bitlerjs/nexus';

const userSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String(),
  displayName: Type.String(),
});

const issueSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  storyPoints: Type.Optional(Type.Number()),
  priority: Type.Optional(
    Type.Number({
      description: 'The priority of the issue. 0 = No priority, 1 = Urgent, 2 = High, 3 = Normal, 4 = Low.',
    }),
  ),
  state: Type.Optional(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
    }),
  ),
  assignee: Type.Optional(userSchema),
  creator: Type.Optional(userSchema),
  startedAt: Type.Optional(
    Type.String({
      format: 'date-time',
    }),
  ),
  completedAt: Type.Optional(
    Type.String({
      format: 'date-time',
    }),
  ),
  canceledAt: Type.Optional(
    Type.String({
      format: 'date-time',
    }),
  ),
  description: Type.Optional(
    Type.String({
      format: 'date-time',
    }),
  ),
});

export { userSchema, issueSchema };
