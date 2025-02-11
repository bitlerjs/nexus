import { type ServerDefinition } from '@bitlerjs/nexus-client-ws';
import { useEffect } from 'react';

import { useNexus } from '../provider/provider.js';
import { useHasEvent } from '../events/events.js';

type UseEventEffectOptions<T extends ServerDefinition, TKey extends keyof T['events']> = {
  kind: TKey;
  input: T['events'][TKey]['input'];
  handler: (event: T['events'][TKey]['output']) => unknown;
};

const useEventEffect = <T extends ServerDefinition, TKey extends keyof T['events']>(
  options: UseEventEffectOptions<T, TKey>,
  deps: unknown[] = [],
) => {
  const { kind, input, handler } = options;
  const { client } = useNexus();
  const hasEvent = useHasEvent(kind as string);

  useEffect(() => {
    if (!client || !hasEvent) {
      return;
    }
    const promise = client.events.subscribe(kind as string, input, handler);
    return () => {
      promise.then((subscription) => {
        subscription.unsubscribe();
      });
    };
  }, [kind, client, hasEvent, ...deps]);
};

const createEventHooks = <T extends ServerDefinition>() => {
  const typesUseEventsEffect = <TKey extends keyof T['events']>(...args: Parameters<typeof useEventEffect<T, TKey>>) =>
    useEventEffect(...args);

  return {
    useEventEffect: typesUseEventsEffect,
  };
};

export { useEventEffect, createEventHooks };
