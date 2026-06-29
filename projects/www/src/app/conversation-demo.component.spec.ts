import { describe, expect, it } from 'vitest';
import {
  reasoningSequenceStreaming,
  reasoningStepStatus,
  revealConversationText,
} from './conversation-demo-timeline';

describe('conversation demo streaming text', () => {
  it('reveals text progressively and clamps to the available content', () => {
    expect(revealConversationText('Angular agents', 0)).toBe('');
    expect(revealConversationText('Angular agents', 7)).toBe('Angular');
    expect(revealConversationText('Angular agents', 999)).toBe('Angular agents');
  });

  it('does not split surrogate-pair characters while streaming', () => {
    expect(revealConversationText('Ship 🚀', 6)).toBe('Ship 🚀');
  });

  it('marks visible reasoning steps active before they complete', () => {
    expect(reasoningStepStatus('hidden')).toBe('pending');
    expect(reasoningStepStatus('active')).toBe('active');
    expect(reasoningStepStatus('complete')).toBe('complete');
  });

  it('keeps the reasoning sequence streaming until the final step completes', () => {
    expect(reasoningSequenceStreaming(false, 'hidden')).toBe(false);
    expect(reasoningSequenceStreaming(true, 'hidden')).toBe(true);
    expect(reasoningSequenceStreaming(true, 'active')).toBe(true);
    expect(reasoningSequenceStreaming(true, 'complete')).toBe(false);
  });
});
