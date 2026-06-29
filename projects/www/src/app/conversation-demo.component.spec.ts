import { describe, expect, it } from 'vitest';
import { revealConversationText } from './conversation-demo-timeline';

describe('conversation demo streaming text', () => {
  it('reveals text progressively and clamps to the available content', () => {
    expect(revealConversationText('Angular agents', 0)).toBe('');
    expect(revealConversationText('Angular agents', 7)).toBe('Angular');
    expect(revealConversationText('Angular agents', 999)).toBe('Angular agents');
  });

  it('does not split surrogate-pair characters while streaming', () => {
    expect(revealConversationText('Ship 🚀', 6)).toBe('Ship 🚀');
  });
});
