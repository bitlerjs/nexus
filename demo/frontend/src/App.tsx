import { NexusProvider, useCreateNexus } from '@bitlerjs/nexus-react-ws';
import { Todos } from './pages/todos';
import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider } from 'next-themes';

const App = () => {
  const nexus = useCreateNexus({
    getSession: async () => ({
      url: 'http://localhost:4000',
      token: '',
    }),
  });

  return (
    <HeroUIProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <NexusProvider {...nexus}>{nexus.state === 'logged-in' && <Todos />}</NexusProvider>
      </ThemeProvider>
    </HeroUIProvider>
  );
};

export { App };
