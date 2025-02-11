import { useConfigs } from '@bitlerjs/nexus-react-ws';
import { Page } from '../../components/layout/page';
import { Button, Listbox, ListboxItem, Tooltip } from '@heroui/react';
import { useAddScreen } from '../../features/screens/screens.hooks';
import { X } from 'lucide-react';

const Configs = () => {
  const { configs, remove } = useConfigs();
  const addScreen = useAddScreen();

  return (
    <Page>
      <Page.Body>
        <Page.Content>
          <Listbox items={configs}>
            {(config) => (
              <ListboxItem
                key={config.kind}
                title={config.name || config.kind}
                onPress={() =>
                  addScreen({
                    kind: 'config',
                    id: `config-${config.kind}`,
                    title: `Config ${config.name || config.kind}`,
                    focus: true,
                    props: { kind: config.kind },
                  })
                }
                endContent={
                  <>
                    <Tooltip content="Clear value">
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => remove.mutate({ input: { kind: config.kind } })}
                        isIconOnly
                      >
                        <X />
                      </Button>
                    </Tooltip>
                  </>
                }
              />
            )}
          </Listbox>
        </Page.Content>
      </Page.Body>
    </Page>
  );
};

export { Configs };
