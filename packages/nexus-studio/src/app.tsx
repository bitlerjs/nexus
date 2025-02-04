import { Divider, HeroUIProvider } from '@heroui/react';
import { Sidebar } from './containers/sidebar/sidebar.js';
import { NexusProvider, useCreateNexus } from '@bitlerjs/nexus-react-ws';
import { ScreensContainer, ScreensProvider } from './features/screens/screens.js';
import { ActionsProvider } from './features/actions/actions.js';
import { ThemeProvider } from 'next-themes';
import { ToastsProvider } from './features/toasts/toasts.provider.js';

const App = () => {
  const client = useCreateNexus({
    getSession: async () => {
      return { url: 'http://localhost:4000', token: '' };
    },
    setSession: async (session) => {
      console.log('setSession', session);
    },
  });
  return (
    <HeroUIProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <ToastsProvider>
          <NexusProvider {...client}>
            {client.state === 'logged-in' && (
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
            )}
          </NexusProvider>
        </ToastsProvider>
      </ThemeProvider>
    </HeroUIProvider>
  );
};

export { App };
