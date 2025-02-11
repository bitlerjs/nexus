import { Bootstrap, Container, Continuation, RequestContext, TasksService } from '@bitlerjs/nexus';

import { CompletionInput, type DialogItem } from '../schemas/schemas.completion.js';

import { ToolsUsed } from './tools-used.js';

const sanitizeString = (str: string) => {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_').substr(0, 60);
};

type GetDialogOptions = {
  input: CompletionInput;
  continuation: Continuation;
  bootstrap: Bootstrap;
};
const getDialog = ({ input, continuation, bootstrap }: GetDialogOptions) => {
  const dialog: DialogItem[] = [];

  if (input.systemPrompt) {
    dialog.push({
      role: 'system',
      content: input.systemPrompt,
    });
  }
  if (bootstrap.hasData) {
    dialog.push({
      role: 'system',
      content: bootstrap.toText(),
    });
  }
  if (continuation.hasData) {
    dialog.push({
      role: 'system',
      content: continuation.toText(),
    });
  }
  dialog.push({
    role: 'system',
    content: `The current time is ${new Date().toISOString()}.`,
  });
  if (input.dialog) {
    dialog.push(...input.dialog);
  }
  dialog.push({
    role: 'user',
    content: input.prompt,
  });

  return dialog;
};

type GetTaskToolsOptions = {
  container: Container;
  tasks?: string[];
  requestContext: RequestContext;
  continuation: Continuation;
  toolsUsed: ToolsUsed;
};
const getTaskTools = async ({
  container,
  tasks = [],
  continuation,
  requestContext,
  toolsUsed,
}: GetTaskToolsOptions) => {
  const tasksService = container.get(TasksService);
  const taskInstances = (tasks || [])
    .map((taskName) => tasksService.get(taskName))
    .filter((i): i is Exclude<ReturnType<typeof tasksService.get>, undefined> => !!i);

  return taskInstances.map(
    (task) =>
      ({
        type: 'function',
        function: {
          name: sanitizeString(task.kind),
          function: async (input: unknown) => {
            try {
              const result = await tasksService.run({
                task,
                input,
                continuation,
                requestContext,
              });
              toolsUsed.register({
                kind: task.kind,
                input,
                output: result,
              });
              return result;
            } catch (e: unknown) {
              console.error(e);
              toolsUsed.register({
                kind: task.kind,
                input,
                error: e instanceof Error ? e.message : String(e),
              });
              return `The call failed with error: ${e instanceof Error ? e.message : String(e)}`;
            }
          },
          parse: JSON.parse,
          description: task.description,
          parameters: task.input as any,
        },
      }) as const,
  );
};

export { getDialog, getTaskTools };
