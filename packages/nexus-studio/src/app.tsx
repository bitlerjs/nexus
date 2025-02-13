import { Divider, HeroUIProvider } from '@heroui/react';
import { Sidebar } from './containers/sidebar/sidebar.js';
import { ScreensContainer, ScreensProvider } from './features/screens/screens.js';
import { ActionsProvider } from './features/actions/actions.js';
import { ThemeProvider } from 'next-themes';
import { ToastsProvider } from './features/toasts/toasts.provider.js';
import { NexusProvider } from '@bitlerjs/nexus-react-ws';
import { Server } from './features/server/server.js';

const App = () => {
  return (
    <HeroUIProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <ToastsProvider>
          <Server>
            <NexusProvider>
              <ScreensProvider>
                <ActionsProvider>
                  <div className="h-screen w-screen flex bg-default-50">
                    <div>
                      <Sidebar />
                    </div>
                    <Divider orientation="vertical" />
                    <div className="flex-1 overflow-y-hidden">
                      <ScreensContainer />
                    </div>
                  </div>
                </ActionsProvider>
              </ScreensProvider>
            </NexusProvider>
          </Server>
        </ToastsProvider>
      </ThemeProvider>
    </HeroUIProvider>
  );
};

export { App };
