import { Container, Continuation, RequestContext, TasksService } from '@bitlerjs/nexus';
import { tasks as notificationTasks } from '@bitlerjs/nexus-notifications';
import { Databases } from '@bitlerjs/nexus-data';
import { KnowledgeBaseService } from '@bitlerjs/nexus-knowledge-base';

import { Message } from '../types/message.js';
import { dbConfig, MessageRow } from '../databases/databases.js';

type SignalSocketOptions = {
  id: string;
  host: string;
  secure: boolean;
  container: Container;
};

class SignalSocket {
  #options: SignalSocketOptions;
  #socket: WebSocket;

  constructor(options: SignalSocketOptions) {
    this.#options = options;
    this.#socket = this.#setup();
  }

  public get id() {
    return this.#options.id;
  }

  #onopen = () => {
    console.log('connected');
  };

  #onclose = () => {
    console.log('disconnected');
  };

  #onerror = (event: Event) => {
    console.error(event);
  };

  #onmessage = async (event: MessageEvent) => {
    const { container, id } = this.#options;
    const tasksService = container.get(TasksService);
    const message: Message = JSON.parse(event.data);
    if (message.envelope.dataMessage) {
      const dbs = container.get(Databases);
      const db = await dbs.get(dbConfig);
      const knowledgeBaseService = container.get(KnowledgeBaseService);
      const messageId = `signal-${message.envelope.sourceUuid}-${message.envelope.timestamp}`;
      await db<MessageRow>('messages').insert({
        id: messageId,
        timestamp: new Date(),
        senderId: message.envelope.source,
        recipientId: id,
        isMe: false,
        // groupId: message.envelope.dataMessage.message, TODO:
      });
      const { messageEntity } = await import('../entities/message.js');
      await knowledgeBaseService.add({
        entity: messageEntity,
        id: messageId,
        documents: [message.envelope.dataMessage.message],
      });
      await tasksService.run({
        task: notificationTasks.addNotification,
        input: {
          id: `signal-${message.envelope.sourceUuid}-${message.envelope.timestamp}`,
          title: 'New signal message',
          message: [
            `**From ${message.envelope.sourceName} (${message.envelope.source})**`,
            '',
            message.envelope.dataMessage.message,
          ].join('\n'),
        },
        requestContext: new RequestContext(),
        continuation: new Continuation({
          container,
        }),
      });
    }

    if (message.envelope.syncMessage?.readMessages) {
      const ids = message.envelope.syncMessage.readMessages.map(
        (readMessage) => `signal-${readMessage.senderUuid}-${readMessage.timestamp}`,
      );

      await tasksService.run({
        task: notificationTasks.removeNotifications,
        input: {
          ids,
        },
        requestContext: new RequestContext(),
        continuation: new Continuation({
          container,
        }),
      });
    }
  };

  #setup = () => {
    const { id, host, secure } = this.#options;
    const socketUrl = new URL(`v1/receive/${id}`, `${secure ? 'wss' : 'ws'}://${host}`);
    const socket = new WebSocket(socketUrl);
    socket.addEventListener('message', this.#onmessage);
    socket.addEventListener('open', this.#onopen);
    socket.addEventListener('close', this.#onclose);
    socket.addEventListener('error', this.#onerror);
    return socket;
  };

  public destroy = () => {
    this.#socket.close();
  };
}

export { SignalSocket, type SignalSocketOptions };
