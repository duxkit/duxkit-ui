import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  output,
  untracked,
} from '@angular/core';
import { BrnDialog, BrnDialogOverlay, type BrnDialogState } from '@spartan-ng/brain/dialog';
import { twMerge } from 'tailwind-merge';

export const modelSelectorOverlayClasses =
  'fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 duration-100';

@Component({
  selector: 'ai-model-selector,[aiModelSelector]',
  imports: [BrnDialogOverlay],
  hostDirectives: [BrnDialog],
  host: {
    '[class]': 'classes()',
    '(document:keydown)': 'handleDocumentKeydown($event)',
  },
  template: `
    <div brnDialogOverlay [class]="overlayClasses"></div>
    <ng-content />
  `,
})
export class ModelSelector {
  private readonly dialog = inject(BrnDialog);
  private readonly injector = inject(Injector);

  /** Whether the model selector dialog is open. */
  public readonly open = input<boolean>(false);
  /** Keyboard shortcut that opens the selector, for example "mod+k". */
  public readonly openShortcut = input<string | undefined>(undefined);
  /** Additional classes merged onto the model selector root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  /** Emits when the selector opens or closes. */
  public readonly openChange = output<boolean>();

  protected readonly overlayClasses = modelSelectorOverlayClasses;
  protected readonly classes = computed(() => twMerge('not-prose', this.userClass()));

  public constructor() {
    this.dialog.stateChanged.subscribe((state) => this.openChange.emit(state === 'open'));

    afterNextRender(() => {
      effect(
        () => {
          const open = this.open();

          untracked(() => {
            if (open) {
              this.dialog.open();
            } else {
              this.dialog.close();
            }
          });
        },
        { injector: this.injector },
      );
    });
  }

  protected handleDocumentKeydown(event: KeyboardEvent): void {
    const shortcut = this.openShortcut();

    if (!shortcut || !matchesShortcut(event, shortcut)) {
      return;
    }

    event.preventDefault();
    this.dialog.open();
  }
}

function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut
    .toLowerCase()
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean);
  const key = parts.at(-1);

  if (!key || event.key.toLowerCase() !== key) {
    return false;
  }

  const requiresMod = parts.includes('mod');
  const requiresCtrl = parts.includes('ctrl') || parts.includes('control');
  const requiresMeta = parts.includes('meta') || parts.includes('cmd') || parts.includes('command');
  const requiresAlt = parts.includes('alt') || parts.includes('option');
  const requiresShift = parts.includes('shift');

  return (
    (!requiresMod || event.metaKey || event.ctrlKey) &&
    (!requiresCtrl || event.ctrlKey) &&
    (!requiresMeta || event.metaKey) &&
    (!requiresAlt || event.altKey) &&
    (!requiresShift || event.shiftKey)
  );
}

export type ModelSelectorDialogState = BrnDialogState;
