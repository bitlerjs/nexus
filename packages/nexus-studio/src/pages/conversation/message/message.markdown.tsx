import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import themeLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import themeDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import { useTheme } from 'next-themes';

type MessageMarkdownProps = {
  content: string;
};

const MessageMarkdown = ({ content }: MessageMarkdownProps) => {
  const { theme } = useTheme();
  const codeTheme = theme === 'dark' ? themeDark : themeLight;
  return (
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
      {String(content)}
    </ReactMarkdown>
  );
};

export { MessageMarkdown };
