import { createTask, Type } from '@bitlerjs/nexus';

import { SignalService } from '../services/services.signal.js';

const sendTask = createTask({
  kind: 'signal.send',
  name: 'Send Signal Message',
  group: 'Signal',
  description: 'Send a message to a Signal contact',
  input: Type.Object({
    recipient: Type.String({
      description: "The recipient's phone number",
    }),
    message: Type.String(),
    attachments: Type.Optional(
      Type.Array(
        Type.String({
          description:
            'Base64 encoded attachment ("<BASE64 ENCODED DATA>", "data:<MIME-TYPE>;base64<comma><BASE64 ENCODED DATA>", "data:<MIME-TYPE>;filename=<FILENAME>;base64<comma><BASE64 ENCODED DATA>")',
        }),
      ),
    ),
  }),
  output: Type.Object({
    success: Type.Boolean(),
  }),
  handler: async ({ container, input }) => {
    const signalService = container.get(SignalService);
    const accounts = await signalService.getAccounts();
    await signalService.post('/v2/send', {
      body: {
        base64_attachments: input.attachments,
        number: accounts[0],
        recipients: [input.recipient],
        message: input.message,
      },
    });
    return { success: true };
  },
});

export { sendTask };
