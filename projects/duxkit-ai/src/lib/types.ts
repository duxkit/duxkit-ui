export type {
  ChatStatus as AiChatStatus,
  UIMessage as AiMessage,
  UIMessagePart as AiMessagePart,
} from 'ai';

export interface AiPromptSubmit {
  readonly text: string;
}
