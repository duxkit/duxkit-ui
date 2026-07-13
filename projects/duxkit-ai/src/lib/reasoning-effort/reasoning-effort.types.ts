/** A selectable AI reasoning-effort level. */
export interface ReasoningEffortLevel {
  /** Stable value sent to the AI provider. */
  readonly value: string;
  /** Human-readable label shown in the trigger and picker. */
  readonly label: string;
  /** Optional supporting copy shown in list mode. */
  readonly description?: string;
}

/** Default reasoning-effort values and labels. */
export const DEFAULT_REASONING_EFFORT_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'xhigh', label: 'xhigh' },
  { value: 'max', label: 'Max' },
  { value: 'ultra', label: 'Ultra' },
] as const satisfies readonly ReasoningEffortLevel[];
