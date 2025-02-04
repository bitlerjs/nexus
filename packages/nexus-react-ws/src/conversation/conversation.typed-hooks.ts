import { createTypedHooks } from '../exports.js';
import { ServerSpecs } from '../generated/server.js';

const { useTaskQuery, useTaskMutation, useEventEffect } = createTypedHooks<ServerSpecs>();

export { useTaskQuery, useTaskMutation, useEventEffect };
