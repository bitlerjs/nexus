type TypingMessage = {
  action: 'STARTED' | 'STOPPED';
  timestamp: number;
  groupId?: string; // Optional, only present in some cases
};

// Define the data message structure
type DataMessage = {
  timestamp: number;
  message: string;
  expiresInSeconds: number;
  viewOnce: boolean;
};

// Define the receipt message structure
type ReceiptMessage = {
  when: number;
  isDelivery: boolean;
  isRead: boolean;
  isViewed: boolean;
  timestamps: number[];
};

// Define the sync message structure
type SyncMessage = {
  readMessages?: {
    sender: string;
    senderNumber: string;
    senderUuid: string;
    timestamp: number;
  }[];
  sentMessage?: {
    destination: string | null;
    destinationNumber: string | null;
    destinationUuid: string | null;
    timestamp: number;
    message: string;
    expiresInSeconds: number;
    viewOnce: boolean;
    groupInfo?: {
      groupId: string;
      type: 'DELIVER';
    };
  };
};

// Define the envelope structure
type Envelope = {
  source: string;
  sourceNumber: string;
  sourceUuid: string;
  sourceName: string;
  sourceDevice: number;
  timestamp: number;
  typingMessage?: TypingMessage;
  dataMessage?: DataMessage;
  receiptMessage?: ReceiptMessage;
  syncMessage?: SyncMessage;
};

// Define the message structure
type Message = {
  envelope: Envelope;
  account: string;
};

export { type TypingMessage, type DataMessage, type ReceiptMessage, type SyncMessage, type Envelope, type Message };
