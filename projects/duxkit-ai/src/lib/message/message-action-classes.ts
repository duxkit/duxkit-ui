import { cva } from 'class-variance-authority';

export const feedbackButtonClasses = cva('', {
  variants: {
    active: {
      true: 'bg-muted text-foreground',
      false: '',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const messageActionButtonClasses =
  'inline-flex size-6 items-center justify-center rounded-md border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50';
