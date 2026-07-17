import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import type { CliIo } from './cli.js';
import { CliCommandError } from './cli-errors.js';
import { confirmApply, isInteractive, printJsonPlanForConfirmation } from './cli-interaction.js';
import { applyInitPlan, InitApplyError } from './init-apply.js';
import { renderInitFailure, renderInitSummary, renderVerboseInitPlan } from './init-output.js';
import {
  createInitPlan,
  type InitMode,
  type InitPlan,
  type InitPlannerOptions,
} from './init-plan.js';
import { inspectWorkspace } from './workspace-state.js';

export interface InitCommandOptions extends InitPlannerOptions {
  readonly dryRun?: boolean;
  readonly install?: boolean;
  readonly json?: boolean;
  readonly noInstall?: boolean;
  readonly verbose?: boolean;
}

export async function runInitCommand(options: InitCommandOptions, io: CliIo): Promise<void> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const noInstall = options.noInstall === true || options.install === false;
  let plan = await createInitPlan(options, cwd);

  if (plan.status === 'blocked' && isInteractive(io)) {
    const promptedOptions = await promptForInitAmbiguities(options, plan);

    if (promptedOptions !== null) {
      plan = await createInitPlan(promptedOptions, cwd);
    }
  }

  if (options.dryRun === true || plan.status === 'blocked') {
    writePlanOutput(plan, options, noInstall, io);

    if (plan.status === 'blocked') {
      throw new CliCommandError(1);
    }

    if (options.json !== true) {
      io.stdout.write('No files changed.\n');
    }
    return;
  }

  if (plan.plannedChanges.length > 0 && !options.yes && !isInteractive(io)) {
    const blockedPlan = withBlockedAmbiguity(
      plan,
      'Run init interactively or pass --yes before allowing writes in a non-interactive terminal.',
    );
    writePlanOutput(blockedPlan, options, noInstall, io);
    throw new CliCommandError(1);
  }

  if (options.json !== true) {
    io.stdout.write(
      options.verbose === true ? renderVerboseInitPlan(plan) : renderInitSummary(plan, noInstall),
    );
  }

  if (!options.yes && isInteractive(io) && plan.plannedChanges.length > 0) {
    printJsonPlanForConfirmation(plan, options.json === true, io);
    const confirmed = await confirmApply(io);

    if (!confirmed) {
      const cancelledPlan = withBlockedAmbiguity(plan, 'Initialization cancelled.');
      writePlanOutput(cancelledPlan, options, noInstall, io);
      throw new CliCommandError(1);
    }
  }

  try {
    const result = await applyInitPlan(plan, {
      noInstall,
    });
    const appliedPlan = {
      ...plan,
      applied: true,
      completedSteps: result.completedSteps,
      skippedInstall: result.skippedInstall,
      status: 'applied' as const,
    };

    if (options.json === true) {
      io.stdout.write(`${JSON.stringify(appliedPlan, null, 2)}\n`);
    } else {
      io.stdout.write('Initialization applied.\n');
    }
  } catch (error) {
    if (!(error instanceof InitApplyError)) {
      throw error;
    }

    const failedPlan = {
      ...plan,
      completedSteps: error.completedSteps,
      error: error.message,
      message: error.partialChanges ? 'Partial changes were made' : 'Init failed',
      pendingSteps: error.pendingSteps,
      partialChanges: error.partialChanges,
      status: 'failed' as const,
    };

    if (options.json === true) {
      io.stdout.write(`${JSON.stringify(failedPlan, null, 2)}\n`);
    } else {
      io.stderr.write(`${renderInitFailure(error)}\n`);
    }

    throw new CliCommandError(1);
  }
}

function writePlanOutput(
  plan: InitPlan,
  options: InitCommandOptions,
  noInstall: boolean,
  io: CliIo,
): void {
  if (options.json === true) {
    io.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  } else {
    const output = plan.status === 'blocked' ? io.stderr : io.stdout;
    output.write(
      options.verbose === true ? renderVerboseInitPlan(plan) : renderInitSummary(plan, noInstall),
    );
  }
}

function withBlockedAmbiguity(plan: InitPlan, message: string): InitPlan {
  const ambiguity = { flag: '--yes', message };

  return {
    ...plan,
    ambiguities: [...plan.ambiguities, ambiguity],
    nextSteps: [...plan.nextSteps, `Provide ${ambiguity.flag}: ${ambiguity.message}`],
    status: 'blocked',
  };
}

async function promptForInitAmbiguities(
  options: InitCommandOptions,
  plan: InitPlan,
): Promise<InitPlannerOptions | null> {
  const workspace = await inspectWorkspace(plan.workspace.root);
  const prompted: {
    -readonly [Key in keyof InitPlannerOptions]?: InitPlannerOptions[Key];
  } = { ...options };
  const readline = createInterface({ input: process.stdin, output: process.stderr });
  let changed = false;

  try {
    for (const ambiguity of plan.ambiguities) {
      const flag = ambiguity.flag;

      if (flag.includes('--force')) {
        const answer = await readline.question(
          'Use the explicit flags and update duxkit-ai.json? (y/N) ',
        );

        if (answer.trim().toLowerCase() === 'y') {
          prompted.force = true;
          changed = true;
        }
      } else if (flag.startsWith('--project')) {
        const choices = workspace.projects.map((project) => project.name).join(', ');
        const answer = await readline.question(
          `Which project should Duxkit AI configure (${choices})? `,
        );

        if (answer.trim().length > 0) {
          prompted.project = answer.trim();
          changed = true;
        }
      } else if (flag.startsWith('--stylesheet')) {
        const answer = await readline.question('Which stylesheet should receive Tailwind setup? ');

        if (answer.trim().length > 0) {
          prompted.stylesheet = answer.trim();
          changed = true;
        }
      } else if (flag.startsWith('--tokens')) {
        const answer = await readline.question('Add the missing theme tokens? (Y/n) ');
        prompted.tokens = answer.trim().toLowerCase() === 'n' ? 'skip' : 'add';
        changed = true;
      } else if (flag.startsWith('--tailwind')) {
        const answer = await readline.question(
          'Skip automatic Tailwind migration and leave it for a manual step? (y/N) ',
        );

        if (answer.trim().toLowerCase() === 'y') {
          prompted.tailwind = 'skip';
          changed = true;
        }
      } else if (flag.startsWith('--postcss')) {
        const answer = await readline.question(
          'Skip automatic PostCSS editing and leave it for a manual step? (y/N) ',
        );

        if (answer.trim().toLowerCase() === 'y') {
          prompted.postcss = 'skip';
          changed = true;
        }
      }
    }
  } finally {
    readline.close();
  }

  return changed ? prompted : null;
}

export function isInitMode(value: string): value is InitMode {
  return value === 'add' || value === 'skip' || value === 'require-existing';
}
