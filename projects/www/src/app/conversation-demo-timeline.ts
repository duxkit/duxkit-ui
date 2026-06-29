export function revealConversationText(text: string, characterCount: number): string {
  return Array.from(text).slice(0, Math.max(0, characterCount)).join('');
}
