import { Static, Type } from '@bitlerjs/nexus';

const dialogItemSchema = Type.Object({
  role: Type.Union([Type.Literal('user'), Type.Literal('assistant'), Type.Literal('system')]),
  content: Type.String(),
});

type DialogItem = Static<typeof dialogItemSchema>;

const completionInputSchema = Type.Object({
  systemPrompt: Type.Optional(Type.String()),
  model: Type.Optional(Type.String()),
  prompt: Type.String(),
  dialog: Type.Optional(Type.Array(dialogItemSchema)),
  tasks: Type.Optional(Type.Array(Type.String())),
  schema: Type.Optional(Type.Unknown()),
  maxTokens: Type.Optional(Type.Number()),
  temperature: Type.Optional(Type.Number()),
});

type CompletionInput = Static<typeof completionInputSchema>;

export { completionInputSchema, type CompletionInput, type DialogItem };
