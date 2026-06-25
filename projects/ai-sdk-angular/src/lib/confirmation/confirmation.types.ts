import type { DynamicToolUIPart, ToolUIPart } from 'ai';

export type ConfirmationToolPart = ToolUIPart | DynamicToolUIPart;
export type ConfirmationToolApproval = ConfirmationToolPart['approval'];
export type ConfirmationToolState = ConfirmationToolPart['state'];

export const confirmationResponseStates: readonly ConfirmationToolState[] = [
  'approval-responded',
  'output-denied',
  'output-available',
];
