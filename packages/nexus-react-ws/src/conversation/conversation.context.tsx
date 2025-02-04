import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { ServerSpecs } from '../generated/server.js';

import { useTaskMutation } from './conversation.typed-hooks.js';

type CompetionInput = ServerSpecs['tasks']['llm.completion']['input'];

type DialogItem = {
  role: 'user' | 'assistant' | 'system';
  id: string;
  content?: unknown;
  timestamp: Date;
  type: 'text' | 'json' | (string & {});
  contiuations: Record<string, Record<string, unknown>>;
  toolsUsed?: {
    kind: string;
    input: unknown;
    output?: unknown;
    error?: string;
  }[];
};

type AgentConfig = Omit<CompetionInput, 'dialog' | 'prompt'>;

type UseCreateConversationValues = {
  agentConfig?: AgentConfig;
  dialog?: DialogItem[];
};

const useCreateConversation = (options: UseCreateConversationValues = {}) => {
  const [dialog, setDialog] = useState<DialogItem[]>(options.dialog || []);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(options.agentConfig || {});

  const completionMutation = useTaskMutation({
    kind: 'llm.completion',
  });

  const prompt = useCallback(
    (...options: Parameters<typeof completionMutation.mutate>) => {
      const [{ input, continuation }, mutationOptions] = options;
      const id = Math.random().toString(36).substring(7);
      const lastItem = dialog[dialog.length - 1];
      const lastContinuation = lastItem?.contiuations || {};
      setDialog((prev) => {
        const lastItem = prev[prev.length - 1];
        return [
          ...prev,
          {
            role: 'user',
            id: `user-${id}`,
            timestamp: new Date(),
            content: input.prompt,
            type: 'text',
            contiuations: lastItem?.contiuations || {},
          },
          {
            role: 'system',
            id: `system-${id}`,
            timestamp: new Date(),
            type: 'text',
            contiuations: lastItem?.contiuations || {},
          },
        ];
      });
      completionMutation.mutate(
        {
          continuation: continuation || lastContinuation,
          input: {
            dialog: dialog.map((item) => ({
              role: item.role,
              content: String(item.content),
            })),
            ...agentConfig,
            ...input,
          },
        },
        {
          ...(mutationOptions || {}),
          onSuccess: (...args) => {
            const [data] = args;
            setDialog((prev) => {
              return prev.map((item) => {
                if (item.id === `system-${id}`) {
                  return {
                    ...item,
                    role: 'assistant',
                    content: data.result.content,
                    type: data.result.type,
                    timestamp: new Date(),
                    contiuations: data.continuation,
                    toolsUsed: data.result.toolsUsed,
                  };
                }
                return item;
              });
            });
            mutationOptions?.onSuccess?.(...args);
          },
        },
      );
    },
    [agentConfig, dialog],
  );

  const removeDialogItem = useCallback(
    (id: string) => {
      setDialog((prev) => prev.filter((item) => item.id !== id));
    },
    [setDialog],
  );

  const rerun = useCallback(
    (id: string) => {
      const item = dialog.find((item) => item.id === id);
      if (!item) {
        return;
      }
      const itemIndex = dialog.findIndex((item) => item.id === id);
      const newDialog = [...dialog];
      newDialog.splice(itemIndex);
      setDialog(newDialog);
      prompt({
        input: {
          dialog: newDialog.map((item) => ({
            role: item.role,
            content: String(item.content),
          })),
          prompt: String(item.content),
        },
        continuation: item.contiuations,
      });
    },
    [dialog, prompt],
  );

  const currentContinuation = useMemo(() => {
    return dialog[dialog.length - 1]?.contiuations || {};
  }, [dialog]);

  const modifyDialogItem = useCallback(
    (id: string, content: string) => {
      setDialog((prev) => {
        return prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              content,
            };
          }
          return item;
        });
      });
    },
    [setDialog],
  );

  return {
    ...completionMutation,
    currentContinuation,
    agentConfig,
    setAgentConfig,
    removeDialogItem,
    modifyDialogItem,
    dialog,
    prompt,
    rerun,
  };
};

type ConversationContextValue = ReturnType<typeof useCreateConversation>;

const ConversationContext = createContext<ConversationContextValue | undefined>(undefined);

type ConversationProviderProps = ConversationContextValue & {
  children?: ReactNode;
};

const ConversationProvider = ({ children, ...props }: ConversationProviderProps) => {
  return <ConversationContext.Provider value={props}>{children}</ConversationContext.Provider>;
};

const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('Must be inside a ConversationProvider');
  }
  return context;
};

export { useCreateConversation, ConversationProvider, useConversation };
