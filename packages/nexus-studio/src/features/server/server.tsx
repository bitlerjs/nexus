import { WebLoginProvider } from '@bitlerjs/nexus-react-login';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Input } from '@heroui/react';
import { Bot, LogIn, LogOut } from 'lucide-react';
import { ReactNode, useCallback, useRef, useState } from 'react';

const LOCALSTORAGE_KEY = 'nexus-studio:server';

type ServerProps = {
  children: ReactNode;
};

const Server = ({ children }: ServerProps) => {
  const inputRef = useRef<HTMLInputElement>();
  const [url, setUrl] = useState(localStorage.getItem(LOCALSTORAGE_KEY) || undefined);

  const handleLogout = useCallback(() => {
    setUrl(undefined);
    localStorage.removeItem(LOCALSTORAGE_KEY);
  }, []);

  const hasCode = new URL(location.href).searchParams.get('code');

  const handleSetUrl = useCallback(() => {
    if (!inputRef.current) {
      return;
    }
    localStorage.setItem(LOCALSTORAGE_KEY, inputRef.current.value);
    setUrl(inputRef.current.value);
  }, []);

  if (!url && !hasCode) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Card className="w-screen max-w-md">
          <CardHeader className="justify-center">
            <div className="flex items-center gap-2">
              <Bot size={40} className="stroke-default-500 rotate-12" />
              <div>
                <div className="text-4xl font-bold">Nexus</div>
                <div className="text-xs text-default-500">Everything is an agent</div>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Input ref={inputRef as any} label="Server URL" placeholder="https://my.cloud" />
          </CardBody>
          <CardFooter className="justify-end">
            <Button startContent={<LogIn size={16} />} color="primary" onPress={handleSetUrl}>
              Go to login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  if (!url) {
    throw new Error('Should not be here');
  }
  return (
    <WebLoginProvider
      onLogout={handleLogout}
      url={url}
      error={({ error, logout }) => (
        <div className="h-screen flex justify-center items-center">
          <Card>
            <CardBody>
              <Alert
                color="danger"
                variant="flat"
                title="Error connecting to server"
                description={error instanceof Error ? error.message : String(error)}
              />
            </CardBody>
            <CardFooter className="justify-end">
              <Button startContent={<LogOut size={16} />} color="danger" onPress={logout}>
                Logout
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    >
      {children}
    </WebLoginProvider>
  );
};

export { Server };
