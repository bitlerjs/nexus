import { useConversation } from '@bitlerjs/nexus-react-ws';
import { Card, CardBody } from '@heroui/react';
import { Header } from './message.header';
import { MessageMarkdown } from './message.markdown';
import { MessageJson } from './message.json';
import { MessageLoading } from './message.loading';
import { MessageError } from './message.error';

type MessageProps = {
  message: Exclude<ReturnType<typeof useConversation>['dialog'], undefined>[0];
};

const Message = ({ message }: MessageProps) => {
  return (
    <div key={message.id} className="flex flex-col gap-2">
      <Header message={message} />
      <Card radius="sm" shadow="sm">
        <CardBody>
          {!!message.content && message.type === 'text' && <MessageMarkdown content={String(message.content)} />}
          {!!message.content && message.type === 'json' && <MessageJson content={String(message.content)} />}
          {!!message.content && message.type === 'error' && <MessageError content={String(message.content)} />}
          {!message.content && <MessageLoading />}
        </CardBody>
      </Card>
    </div>
  );
};

export { Message };
