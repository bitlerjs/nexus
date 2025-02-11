import { useTask } from '@bitlerjs/nexus-react-ws';
import { Page } from '../../components/layout/page';
import { Button } from '@heroui/react';
import { Editor } from '../../components/editor/editor';
import { useAddToast } from '../../features/toasts/toasts.hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import YAML from 'yaml';
import { useScreen } from '../../features/screens/screens.hooks';
import { Play } from 'lucide-react';

type TaskProps = {
  kind: string;
};

const getInput = (id: string) => {
  const input = localStorage.getItem(`nexus-studio:task:${id}`);
  return input || '{}';
};

const Task = ({ kind }: TaskProps) => {
  const { task, run } = useTask(kind);
  const { id } = useScreen();
  const addToast = useAddToast();
  const [value, setValue] = useState(getInput(id));

  const onRun = useCallback(() => {
    try {
      run.mutate(
        {
          input: YAML.parse(value),
        },
        {
          onError: (error) => {
            addToast({
              title: 'Error',
              description: error instanceof Error ? error.message : String(error),
              type: 'error',
            });
          },
        },
      );
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : String(error),
        type: 'error',
      });
    }
  }, [run]);

  useEffect(
    () => () => {
      localStorage.setItem(`nexus-studio:task:${id}`, value);
    },
    [value],
  );

  const outputYaml = useMemo(() => (run.data ? YAML.stringify(run.data) : ''), [run.data]);

  return (
    <Page>
      <Page.Header title={`Task: ${task?.name}`} />
      <Page.Body className="flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Editor
              options={{
                readOnly: run.isPending,
              }}
              language="yaml"
              value={value}
              onChange={(e) => setValue(e || '')}
            />
          </div>
          <div className="flex justify-end">
            <Button onPress={onRun} color="primary" isLoading={run.isPending} startContent={<Play size={16} />}>
              Run
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <Editor options={{ readOnly: true }} language="yaml" value={outputYaml} />
        </div>
      </Page.Body>
    </Page>
  );
};

export { Task };
