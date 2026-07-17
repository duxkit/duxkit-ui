import { resolve } from 'node:path';
import type { CliIo } from './cli.js';
import { CliCommandError } from './cli-errors.js';
import { confirmApply, isInteractive, printJsonPlanForConfirmation } from './cli-interaction.js';
import { applyAddPlan, AddApplyError } from './add-apply.js';
import {
  renderAddFailure,
  renderAddSuccess,
  renderAddSummary,
  renderVerboseAddPlan,
} from './add-output.js';
import { createAddPlan, type AddPlan, type AddPlannerOptions } from './add-plan.js';
import { promptForPrimitives } from './primitive-picker.js';

export interface AddCommandOptions extends AddPlannerOptions {
  readonly dryRun?: boolean;
  readonly install?: boolean;
  readonly json?: boolean;
  readonly verbose?: boolean;
}

export async function runAddCommand(
  inputs: readonly string[],
  options: AddCommandOptions,
  io: CliIo,
): Promise<void> {
  const noInstall = options.noInstall === true || options.install === false;
  const selectedInputs =
    inputs.length === 0 && options.all !== true && options.json !== true && isInteractive(io)
      ? await promptForPrimitives(io)
      : inputs;
  const plan = await createAddPlan(
    selectedInputs,
    { ...options, noInstall },
    resolve(options.cwd ?? process.cwd()),
  );

  if (plan.status === 'blocked') {
    writePlanOutput(plan, options, noInstall, io);
    throw new CliCommandError(1);
  }

  if (options.dryRun === true) {
    writePlanOutput(plan, options, noInstall, io);
    if (options.json !== true) {
      io.stdout.write('No files changed.\n');
    }
    return;
  }

  if (plan.plannedChanges.length > 0 && options.yes !== true && !isInteractive(io)) {
    const blockedPlan = {
      ...plan,
      ambiguities: [
        ...plan.ambiguities,
        'Pass --yes before allowing add writes in a non-interactive terminal, or run add interactively.',
      ],
      status: 'blocked' as const,
    };
    writePlanOutput(blockedPlan, options, noInstall, io);
    throw new CliCommandError(1);
  }

  if (options.json !== true) {
    io.stdout.write(
      options.verbose === true ? renderVerboseAddPlan(plan) : renderAddSummary(plan, noInstall),
    );
  }

  if (options.yes !== true && isInteractive(io) && plan.plannedChanges.length > 0) {
    printJsonPlanForConfirmation(plan, options.json === true, io);
    const confirmed = await confirmApply(io);

    if (!confirmed) {
      const cancelledPlan = {
        ...plan,
        ambiguities: [...plan.ambiguities, 'Add cancelled.'],
        status: 'blocked' as const,
      };

      if (options.json === true) {
        io.stdout.write(`${JSON.stringify(cancelledPlan, null, 2)}\n`);
      } else {
        io.stderr.write('Add cancelled.\n');
      }

      throw new CliCommandError(1);
    }
  }

  try {
    const result = await applyAddPlan(plan, {
      noInstall,
    });
    const appliedPlan = {
      ...plan,
      applied: true,
      completedPrimitives: result.completedPrimitives,
      completedSteps: result.completedSteps,
      skippedInstall: result.skippedInstall,
      status: 'applied' as const,
    };

    if (options.json === true) {
      io.stdout.write(`${JSON.stringify(appliedPlan, null, 2)}\n`);
    } else {
      io.stdout.write(renderAddSuccess(plan, options.verbose === true));
    }
  } catch (error) {
    if (!(error instanceof AddApplyError)) {
      throw error;
    }

    const failedPlan = {
      ...plan,
      applied: false,
      completedSteps: error.completedSteps,
      error: error.message,
      message: error.partialChanges ? 'Partial changes were made' : 'Add failed',
      pendingSteps: error.pendingSteps,
      partialChanges: error.partialChanges,
      status: 'failed' as const,
    };

    if (options.json === true) {
      io.stdout.write(`${JSON.stringify(failedPlan, null, 2)}\n`);
    } else {
      io.stderr.write(`${renderAddFailure(error)}\n`);
    }

    throw new CliCommandError(1);
  }
}

function writePlanOutput(
  plan: AddPlan,
  options: AddCommandOptions,
  noInstall: boolean,
  io: CliIo,
): void {
  if (options.json === true) {
    io.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  } else {
    const output = plan.status === 'blocked' ? io.stderr : io.stdout;
    output.write(
      options.verbose === true ? renderVerboseAddPlan(plan) : renderAddSummary(plan, noInstall),
    );
  }
}
