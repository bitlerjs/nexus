import { useConversation } from '@bitlerjs/nexus-react-ws';
import { Card, CardBody, Image, Skeleton } from '@heroui/react';
import ReactMarkdown from 'react-markdown';
import { Header } from './message.header';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import themeLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import themeDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import { useTheme } from 'next-themes';

type MessageProps = {
  message: Exclude<ReturnType<typeof useConversation>['dialog'], undefined>[0];
};

const Message = ({ message }: MessageProps) => {
  const { theme } = useTheme();
  const codeTheme = theme === 'dark' ? themeDark : themeLight;
  return (
    <div key={message.id} className="flex flex-col gap-2">
      <Header message={message} />
      <Card radius="sm" shadow="sm">
        <CardBody>
          {!!message.content && message.type !== 'json' && (
            <ReactMarkdown
              className="prose dark:prose-invert w-full max-w-full"
              components={{
                pre({ children }) {
                  return <pre className="not-prose">{children}</pre>;
                },
                img({ src, alt }) {
                  return (
                    <img
                      src={src}
                      alt={alt}
                      className="w-full not-prose shadow-lg border-default-100 rounded-lg overflow-hidden border"
                    />
                  );
                },
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <SyntaxHighlighter
                      showLineNumbers
                      className="not-prose"
                      wrapLongLines
                      style={codeTheme}
                      language={match[1]}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {String(message.content)}
            </ReactMarkdown>
          )}
          {!!message.content && message.type === 'json' && (
            <SyntaxHighlighter wrapLines language="json" style={codeTheme}>
              {JSON.stringify(JSON.parse(String(message.content)), null, 2)}
            </SyntaxHighlighter>
          )}
          {!message.content && (
            <div className="space-y-3 py-4">
              <Skeleton className="w-3/5 rounded-lg">
                <div className="h-3 w-3/5 rounded-lg bg-default-200" />
              </Skeleton>
              <Skeleton className="w-4/5 rounded-lg">
                <div className="h-3 w-4/5 rounded-lg bg-default-200" />
              </Skeleton>
              <Skeleton className="w-2/5 rounded-lg">
                <div className="h-3 w-2/5 rounded-lg bg-default-300" />
              </Skeleton>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export { Message };
