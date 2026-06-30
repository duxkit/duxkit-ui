export type {
  ChatStatus as AiChatStatus,
  UIMessage as AiMessage,
  UIMessagePart as AiMessagePart,
} from 'ai';
import type { AiAttachmentPart } from './attachment';

export interface AiPromptSubmit {
  readonly text: string;
  readonly files: readonly AiAttachmentPart[];
}
