export function formatPrimitiveSelection(primitives: readonly string[]): string {
  if (primitives.length <= 3) {
    return primitives.join(', ');
  }

  return `${primitives.slice(0, 3).join(', ')} and ${primitives.length - 3} more`;
}

export function pluralize(noun: string, count: number): string {
  return count === 1 ? noun : `${noun}s`;
}
