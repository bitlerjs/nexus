import { Alert } from '@heroui/react';

type MessageErrorProps = {
  content: string;
};

const MessageError = ({ content }: MessageErrorProps) => {
  return <Alert color="danger" title={content} />;
};

export { MessageError };
