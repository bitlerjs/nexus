import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import themeLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import themeDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import { useTheme } from 'next-themes';

type MessageJsonProps = {
  content: string;
};

const MessageJson = ({ content }: MessageJsonProps) => {
  const { theme } = useTheme();
  const codeTheme = theme === 'dark' ? themeDark : themeLight;

  return (
    <SyntaxHighlighter wrapLines language="json" style={codeTheme}>
      {JSON.stringify(JSON.parse(String(content)), null, 2)}
    </SyntaxHighlighter>
  );
};

export { MessageJson };
