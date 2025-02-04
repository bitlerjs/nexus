import { createTypedHooks } from '@bitlerjs/nexus-react-ws';

import { ServerSpecs } from '../generated/server.js';

const { useTaskQuery, useEventEffect, useTaskMutation } = createTypedHooks<ServerSpecs>();

export { useTaskQuery, useEventEffect, useTaskMutation };
