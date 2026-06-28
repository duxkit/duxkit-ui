import type { Preview } from '@storybook/angular';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      const theme = context.globals['theme'] === 'dark' ? 'dark' : 'light';
      document.documentElement.dataset['theme'] = theme;
      document.documentElement.style.colorScheme = theme;

      return story();
    },
  ],
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'centered',
  },
};

export default preview;
