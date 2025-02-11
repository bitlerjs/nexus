import clsx from 'clsx';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { ComponentProps, useRef } from 'react';
import { useTheme } from 'next-themes';

type Props = ComponentProps<typeof MonacoEditor> & {};

const Editor = ({ className, ...props }: Props) => {
  const divRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeName = theme === 'dark' ? 'vs-dark' : 'vs-light';

  return (
    <div ref={divRef} className={clsx('h-full', className, 'relative')}>
      <div className="absolute inset-0">
        <MonacoEditor
          theme={themeName}
          className="rounded overflow-hidde"
          defaultLanguage="yaml"
          {...props}
          options={{
            minimap: { enabled: false },
            tabSize: 2,
            lineNumbers: 'relative',
            ...(props.options || {}),
          }}
        />
      </div>
    </div>
  );
};

export { Editor };
