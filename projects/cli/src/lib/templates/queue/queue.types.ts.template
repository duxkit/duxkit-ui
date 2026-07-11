export interface QueueMessagePart {
  readonly type: string;
  readonly text?: string;
  readonly url?: string;
  readonly filename?: string;
  readonly mediaType?: string;
}

export interface QueueMessage {
  readonly id: string;
  readonly parts: readonly QueueMessagePart[];
}

export interface QueueTodo {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status?: 'pending' | 'completed';
}
