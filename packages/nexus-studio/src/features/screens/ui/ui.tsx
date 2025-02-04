import { Button, Tab, Tabs } from '@heroui/react';
import { useScreensContext, screens as screenList } from '../screens.context';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { ScreenContext } from '../screens.screen';

const ScreensContainer = () => {
  const { screens, removeScreen, activeScreenId, setActiveScreenId } = useScreensContext();
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-center py-2">
        <Tabs
          selectedKey={activeScreenId}
          onSelectionChange={(key) => {
            setActiveScreenId(String(key));
          }}
        >
          {Object.entries(screens).map(([id, screen]) => (
            <Tab
              key={id}
              className="pr-0"
              title={
                <div className="flex gap-2 items-center">
                  {screen.title || id}
                  <Button
                    variant="light"
                    isIconOnly
                    size="sm"
                    onPress={() => {
                      removeScreen(id);
                    }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              }
            />
          ))}
        </Tabs>
      </div>
      <div className="flex-1 overflow-y-hidden">
        {Object.entries(screens).map(([id, screen]) => {
          const ScreenComponent = screenList[screen.kind].component as any;
          return (
            <ScreenContext.Provider value={{ isActive: id === activeScreenId, id }} key={id}>
              <div className={clsx('h-full', { hidden: id !== activeScreenId })}>
                <ScreenComponent key={id} {...screen.props} />
              </div>
            </ScreenContext.Provider>
          );
        })}
      </div>
    </div>
  );
};

export { ScreensContainer };
