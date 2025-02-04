import {
  Listbox,
  ListboxItem,
  ListboxSection,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ScrollShadow,
} from '@heroui/react';
import { useMemo, useState } from 'react';

type ContinuationProps = {
  continuation: Record<string, Record<string, unknown>>;
};

const Continuation = ({ continuation }: ContinuationProps) => {
  const [selected, setSelected] = useState<{
    kind: string;
    key: string;
    value: unknown;
  }>();
  const items = useMemo(() => {
    return Object.entries(continuation).flatMap(([kind, value]) => {
      return Object.entries(value).map(([key, value]) => ({
        kind,
        key,
        value,
      }));
    });
  }, [continuation]);
  console.log(items);
  return (
    <div className="flex flex-col gap-1">
      <Listbox items={items}>
        {({ kind, key, value }) => (
          <ListboxItem key={key} title={kind} description={key} onPress={() => setSelected({ kind, key, value })} />
        )}
      </Listbox>
      <Modal isOpen={!!selected} onClose={() => setSelected(undefined)}>
        {selected && (
          <ModalContent>
            <ModalHeader>{selected.kind}</ModalHeader>
            <ModalBody>
              <ScrollShadow className="max-h-[80vh]">
                <pre>{JSON.stringify(selected.value, null, 2)}</pre>
              </ScrollShadow>
            </ModalBody>
          </ModalContent>
        )}
      </Modal>
    </div>
  );
};

export { Continuation };
