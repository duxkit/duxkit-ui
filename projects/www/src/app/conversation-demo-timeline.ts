export type DemoReasoningStepStatus = 'active' | 'complete' | 'pending';
export type DemoReasoningStepState = 'hidden' | 'active' | 'complete';

export function revealConversationText(text: string, characterCount: number): string {
  return Array.from(text).slice(0, Math.max(0, characterCount)).join('');
}

export function reasoningStepStatus(state: DemoReasoningStepState): DemoReasoningStepStatus {
  return state === 'hidden' ? 'pending' : state;
}

export function reasoningSequenceStreaming(
  visible: boolean,
  finalStepState: DemoReasoningStepState,
): boolean {
  return visible && finalStepState !== 'complete';
}
