import clsx from 'clsx';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import React, { ComponentProps, useRef } from 'react';

type Props = ComponentProps<typeof MonacoEditor> & {
  footer?: React.ReactNode;
};

const Editor = ({ className, ...props }: Props) => {
  const divRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={divRef} className={clsx('h-full', className, 'relative')}>
      <div className="absolute inset-0">
        <MonacoEditor
          theme="vs-dark"
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
