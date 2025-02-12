import OpenAI from 'openai';
import { createTask } from '@bitlerjs/nexus/dist/tasks/tasks.task.js';
import { Bootstrap, TasksService, Type } from '@bitlerjs/nexus';

import { completionInputSchema } from '../schemas/schemas.completion.js';
import { getDialog, getTaskTools } from '../utils/completions.js';
import { ModelsService } from '../services/services.model.js';
import { ToolsUsed } from '../utils/tools-used.js';

const completionTask = createTask({
  kind: 'llm.completion',
  name: 'LLM Completion',
  description: 'Run the LLM completion task',
  input: completionInputSchema,
  output: Type.Object({
    type: Type.String(),
    content: Type.Any(),
    toolsUsed: Type.Optional(
      Type.Array(
        Type.Object({
          kind: Type.String(),
          input: Type.Any(),
          output: Type.Optional(Type.Any()),
          error: Type.Optional(Type.String()),
        }),
      ),
    ),
  }),
  handler: async ({ container, input, requestContext, continuation }) => {
    const tasksService = container.get(TasksService);
    const bootstrap = new Bootstrap({
      container,
    });
    await Promise.all(
      input.tasks?.map(async (kind) => {
        const task = tasksService.get(kind);
        if (!task) {
          return [];
        }
        await bootstrap.load(task.bootstrap || []);
      }) || [],
    );
    const dialog = getDialog({ input, continuation, bootstrap });
    const toolsUsed = new ToolsUsed();
    const tools = await getTaskTools({
      container,
      tasks: input.tasks,
      requestContext,
      continuation,
      toolsUsed,
    });
    const modelsService = container.get(ModelsService);
    const model = input.model ? modelsService.get(input.model) : modelsService.getDefault();

    if (!model) {
      throw new Error(`Model not found: ${input.model}`);
    }

    const client = new OpenAI({
      baseURL: model.api.url,
      apiKey: model.api.key,
    });

    const responseFormat = input.schema
      ? ({
        type: 'json_schema',
        json_schema: {
          name: 'default_response',
          schema: input.schema as any,
        },
      } as const)
      : undefined;

    const getResponse = async () => {
      if (tools.length > 0) {
        const runner = client.beta.chat.completions.runTools({
          messages: dialog,
          max_tokens: input.maxTokens,
          temperature: input.temperature,
          tools,
          response_format: responseFormat,
          model: model.model,
        });
        const finalContent = await runner.finalContent();
        if (!finalContent) {
          throw new Error('No final content');
        }

        return finalContent;
      } else {
        const completion = await client.chat.completions.create({
          messages: dialog,
          max_tokens: input.maxTokens,
          temperature: input.temperature,
          response_format: responseFormat,
          model: model.model,
        });

        const result = completion.choices[0]?.message?.content;
        if (!result) {
          throw new Error('No result');
        }
        return result;
      }
    };

    const response = await getResponse();

    return {
      type: input.schema ? 'json' : 'text',
      content: response,
      toolsUsed: toolsUsed.toJson(),
    };
  },
});

export { completionTask };
