import { useEntities } from '@bitlerjs/nexus-react-ws';
import { Button, Input, Listbox, ListboxItem } from '@heroui/react';
import { useAddScreen } from '../../features/screens/screens.hooks';
import { Page } from '../../components/layout/page';
import { Search } from 'lucide-react';

const Entities = () => {
  const { entities } = useEntities();
  const addScreen = useAddScreen();
  return (
    <Page>
      <Page.Header title="Tasks">
        <Page.Content>
          <Input placeholder="Search tasks" startContent={<Search />} />
        </Page.Content>
      </Page.Header>
      <Page.Body>
        <Page.Content>
          <Listbox selectionMode="none" shouldHighlightOnFocus={false}>
            {entities.map((entity) => (
              <ListboxItem
                key={entity.kind}
                title={entity.name}
                description={entity.description}
                shouldHighlightOnFocus={false}
                endContent={
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      variant="flat"
                      isIconOnly
                      onPress={() => {
                        addScreen({
                          kind: 'entitiesFind',
                          id: `entities-find:${entity.kind}`,
                          title: `Find: ${entity.name}`,
                          focus: true,
                          props: { kind: entity.kind },
                        });
                      }}
                    >
                      <Search />
                    </Button>
                  </div>
                }
              />
            ))}
          </Listbox>
        </Page.Content>
      </Page.Body>
    </Page>
  );
};

export { Entities };
