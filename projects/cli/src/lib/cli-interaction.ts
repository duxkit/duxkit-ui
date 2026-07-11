import { createInterface } from 'node:readline/promises';
import type { CliIo } from './cli.js';

export function isInteractive(io: CliIo): boolean {
  return io.interactive ?? (process.stdin.isTTY === true && process.stdout.isTTY === true);
}

export function printJsonPlanForConfirmation(plan: unknown, json: boolean, io: CliIo): void {
  if (json) {
    io.stderr.write(`${JSON.stringify(plan, null, 2)}\n`);
  }
}

export async function confirmApply(io: CliIo): Promise<boolean> {
  if (io.confirm !== undefined) {
    return io.confirm('Apply these changes?');
  }

  const readline = createInterface({ input: process.stdin, output: process.stderr });

  try {
    const answer = await readline.question('Apply these changes? (y/N) ');
    return answer.trim().toLowerCase() === 'y';
  } finally {
    readline.close();
  }
}
