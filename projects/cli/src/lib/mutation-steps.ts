export interface MutationStep {
  readonly id: string;
  readonly mutates: boolean;
  readonly run: () => Promise<void>;
}

export interface MutationStepResult {
  readonly completedSteps: readonly string[];
  readonly partialChanges: boolean;
}

export class MutationStepExecutionError extends Error {
  constructor(
    readonly completedSteps: readonly string[],
    readonly pendingSteps: readonly string[],
    readonly partialChanges: boolean,
    cause: unknown,
  ) {
    super('Mutation step failed.', { cause });
  }
}

export async function executeMutationSteps(
  steps: readonly MutationStep[],
): Promise<MutationStepResult> {
  const completedSteps: string[] = [];
  let partialChanges = false;

  for (const [index, step] of steps.entries()) {
    try {
      await step.run();
      completedSteps.push(step.id);
      partialChanges ||= step.mutates;
    } catch (error) {
      throw new MutationStepExecutionError(
        completedSteps,
        steps.slice(index).map((pending) => pending.id),
        partialChanges,
        error,
      );
    }
  }

  return { completedSteps, partialChanges };
}
