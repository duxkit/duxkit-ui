import { Command, CommanderError, InvalidArgumentError } from 'commander';
import { runAddCommand, type AddCommandOptions } from './add-command.js';
import { CliCommandError } from './cli-errors.js';
import { runInitCommand, type InitCommandOptions, isInitMode } from './init-command.js';
import { runInspectCommand, type InspectCommandOptions } from './inspect-command.js';
import { runListCommand, type ListCommandOptions } from './list-command.js';
import type { PrimitiveId } from './primitive-registry.js';
import type { PackageManagerName } from './workspace-state.js';

export interface CliOutput {
  write(chunk: string): void;
}

export interface CliPrimitiveChoice {
  readonly description: string;
  readonly id: PrimitiveId;
  readonly title: string;
}

export interface CliIo {
  readonly confirm?: (message: string) => Promise<boolean>;
  readonly inputLibraryPath?: (defaultPath: string) => Promise<string>;
  readonly interactive?: boolean;
  readonly selectPrimitives?: (
    choices: readonly CliPrimitiveChoice[],
  ) => Promise<readonly PrimitiveId[]>;
  readonly stdout: CliOutput;
  readonly stderr: CliOutput;
}

function parseInitMode(value: string): 'add' | 'skip' | 'require-existing' {
  if (isInitMode(value)) {
    return value;
  }

  throw new InvalidArgumentError("expected 'add', 'skip', or 'require-existing'");
}

function parsePackageManager(value: string): Exclude<PackageManagerName, 'unknown'> {
  if (value === 'npm' || value === 'pnpm' || value === 'yarn' || value === 'bun') {
    return value;
  }

  throw new InvalidArgumentError("expected 'npm', 'pnpm', 'yarn', or 'bun'");
}

function configureCommand(command: Command): Command {
  return command.allowUnknownOption(false).allowExcessArguments(false).exitOverride();
}

export function createCli(io: CliIo): Command {
  const program = new Command();

  program
    .name('duxkit-ui')
    .description('Add Duxkit AI primitives to Angular workspaces.')
    .configureOutput({
      writeOut: (chunk) => io.stdout.write(chunk),
      writeErr: (chunk) => io.stderr.write(chunk),
    })
    .allowUnknownOption(false)
    .allowExcessArguments(false)
    .showHelpAfterError();

  configureCommand(program.command('init'))
    .description('Initialize Duxkit AI primitive generation in an Angular workspace.')
    .option('--cwd <path>', 'Workspace directory to inspect.')
    .option('--project <name>', 'Angular application project to configure.')
    .option('--stylesheet <path>', 'Global stylesheet to configure.')
    .option('--library-path <path>', 'Library directory for generated AI primitives.')
    .option('--style <language>', 'Generated component style language.')
    .option(
      '--tokens <mode>',
      "Theme token handling: 'add', 'skip', or 'require-existing'.",
      parseInitMode,
    )
    .option(
      '--tailwind <mode>',
      "Tailwind handling: 'add', 'skip', or 'require-existing'.",
      parseInitMode,
    )
    .option(
      '--postcss <mode>',
      "PostCSS handling: 'add', 'skip', or 'require-existing'.",
      parseInitMode,
    )
    .option(
      '--package-manager <manager>',
      'Package manager to use for the planned install command.',
      parsePackageManager,
    )
    .option('--dry-run', 'Plan changes without writing files or installing packages.')
    .option('--json', 'Print machine-readable JSON output.')
    .option('--verbose', 'Print every planned package, file, and configuration change.')
    .option('--yes', 'Accept safe defaults and skip final confirmation.')
    .option('--force', 'Allow explicit init flags to replace conflicting config values.')
    .option('--no-install', 'Do not install missing dependencies.')
    .action((options: InitCommandOptions) => runInitCommand(options, io));

  configureCommand(program.command('add'))
    .description('Add one or more Duxkit AI primitives to the configured workspace.')
    .argument('[primitives...]', 'Primitive ids to add.')
    .option('--all', 'Select every available primitive.')
    .option('--cwd <path>', 'Workspace directory to inspect.')
    .option('--project <name>', 'Angular application project to configure.')
    .option('--library-path <path>', 'Library directory for generated AI primitives.')
    .option(
      '--package-manager <manager>',
      'Package manager to use for the planned install command.',
      parsePackageManager,
    )
    .option('--dry-run', 'Plan changes without writing files or installing packages.')
    .option('--json', 'Print machine-readable JSON output.')
    .option('--verbose', 'Print every planned package, file, and configuration change.')
    .option('--yes', 'Accept safe defaults and skip final confirmation.')
    .option('--no-install', 'Do not install missing dependencies.')
    .option('--force', 'Overwrite Duxkit-owned generated files where safe.')
    .action((primitives: readonly string[], options: AddCommandOptions) =>
      runAddCommand(primitives, options, io),
    );

  configureCommand(program.command('list'))
    .description('List Duxkit AI primitives.')
    .option('--cwd <path>', 'Workspace directory to inspect.')
    .option('--json', 'Print machine-readable JSON output.')
    .option('--verbose', 'Include aliases, dependencies, and dependency groups.')
    .action((options: ListCommandOptions) => runListCommand(options, io));

  configureCommand(program.command('inspect'))
    .description('Inspect Duxkit AI workspace state.')
    .option('--cwd <path>', 'Workspace directory to inspect.')
    .option('--json', 'Print machine-readable JSON output.')
    .action((options: InspectCommandOptions) => runInspectCommand(options, io));

  return program;
}

export async function runCli(argv: readonly string[], io: CliIo): Promise<number> {
  const program = createCli(io);
  program.exitOverride();

  try {
    await program.parseAsync([...argv], { from: 'user' });
    return 0;
  } catch (error) {
    if (error instanceof CommanderError) {
      return error.exitCode;
    }

    if (error instanceof CliCommandError) {
      return error.exitCode;
    }

    throw error;
  }
}
