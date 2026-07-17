import type { CliIo, CliPrimitiveChoice } from './cli.js';
import { CliCommandError } from './cli-errors.js';
import { listPrimitives, type PrimitiveId } from './primitive-registry.js';

export async function promptForPrimitives(io: CliIo): Promise<readonly string[]> {
  const choices = listPrimitives()
    .filter((primitive) => primitive.status === 'available')
    .map(
      (primitive): CliPrimitiveChoice => ({
        description: primitive.description,
        id: primitive.id,
        title: primitive.title,
      }),
    );

  try {
    if (io.selectPrimitives !== undefined) {
      return await io.selectPrimitives(choices);
    }

    const { default: checkbox } = await import('@inquirer/checkbox');

    return await checkbox<PrimitiveId>({
      choices: choices.map((choice) => ({
        description: choice.description,
        name: `${choice.title} (${choice.id})`,
        value: choice.id,
      })),
      loop: false,
      message: 'Select components to add',
      pageSize: 12,
      required: true,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      io.stderr.write('Component selection cancelled.\n');
      throw new CliCommandError(1);
    }

    throw error;
  }
}
