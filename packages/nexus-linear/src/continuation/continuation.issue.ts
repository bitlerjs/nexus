import { createContinuationItem } from '@bitlerjs/nexus';

import { issueSchema } from '../schemas/schemas.js';

const issueContinuation = createContinuationItem({
  kind: 'linear.issue',
  name: 'Linear: Issue',
  description: 'A Linear issue',
  schema: issueSchema,
});

export { issueContinuation };
