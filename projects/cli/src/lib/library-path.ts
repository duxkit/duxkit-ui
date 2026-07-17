export const DEFAULT_LIBRARY_PATH = 'libs/dux-ui';

export function resolveLibraryPathOption(path: string | undefined): string | undefined {
  if (path === undefined) {
    return undefined;
  }

  return path.trim() || DEFAULT_LIBRARY_PATH;
}
