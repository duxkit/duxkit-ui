import type { CliIo } from './cli.js';
import { CliCommandError } from './cli-errors.js';

export async function promptForLibraryPath(io: CliIo, defaultPath: string): Promise<string> {
  try {
    const selectedPath =
      io.inputLibraryPath !== undefined
        ? await io.inputLibraryPath(defaultPath)
        : await promptWithInquirer(defaultPath);

    return selectedPath.trim() || defaultPath;
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      io.stderr.write('Initialization cancelled.\n');
      throw new CliCommandError(1);
    }

    throw error;
  }
}

async function promptWithInquirer(defaultPath: string): Promise<string> {
  const { default: input } = await import('@inquirer/input');

  return input({
    default: defaultPath,
    message: 'Library path',
  });
}
