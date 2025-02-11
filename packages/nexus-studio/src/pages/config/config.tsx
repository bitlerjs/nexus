import { useConfig } from '@bitlerjs/nexus-react-ws';
import { Page } from '../../components/layout/page';
import { useCallback, useEffect, useState } from 'react';
import { Editor } from '../../components/editor/editor';
import { Button } from '@heroui/react';
import { useAddToast } from '../../features/toasts/toasts.hooks';
import YAML from 'yaml';

type ConfigProps = {
  kind: string;
};
const Config = ({ kind }: ConfigProps) => {
  const { current, update } = useConfig(kind);
  const [currentValue, setCurrentValue] = useState('{}');
  const addToast = useAddToast();

  useEffect(() => {
    setCurrentValue(current ? YAML.stringify(current, null, 2) : '{}');
  }, [current]);

  const save = useCallback(() => {
    update.mutate(
      {
        input: {
          kind,
          value: YAML.parse(currentValue),
        },
      },
      {
        onError: (error) => {
          addToast({
            type: 'error',
            title: 'Error',
            description: error instanceof Error ? error.message : String(error),
            timeout: 5000,
          });
        },
      },
    );
  }, [update, kind, currentValue]);

  return (
    <Page>
      <Page.Body className="flex flex-col">
        <div className="flex-1">
          <Editor value={currentValue} onChange={(e) => setCurrentValue(e || '')} />
        </div>
        <Button onPress={save} color="primary">
          Save
        </Button>
      </Page.Body>
    </Page>
  );
};

export { Config };
