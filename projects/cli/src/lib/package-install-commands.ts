import type { DependencySection } from './primitive-registry.js';
import type { PackageManagerName } from './workspace-state.js';

interface InstallablePackage {
  readonly name: string;
  readonly section: DependencySection;
  readonly version: string;
}

export function createPackageInstallCommands(
  packageManager: PackageManagerName,
  packages: readonly InstallablePackage[],
): readonly string[] {
  if (packageManager === 'unknown' || packages.length === 0) {
    return [];
  }

  return [
    createInstallCommand(
      packageManager,
      packages.filter((dependency) => dependency.section === 'dependencies'),
      false,
    ),
    createInstallCommand(
      packageManager,
      packages.filter((dependency) => dependency.section === 'devDependencies'),
      true,
    ),
    createInstallCommand(
      packageManager,
      packages.filter((dependency) => dependency.section === 'peerDependencies'),
      false,
    ),
  ].filter((command): command is string => command !== null);
}

function createInstallCommand(
  packageManager: Exclude<PackageManagerName, 'unknown'>,
  packages: readonly InstallablePackage[],
  dev: boolean,
): string | null {
  if (packages.length === 0) {
    return null;
  }

  const action = packageManager === 'npm' ? 'install' : 'add';
  const devFlag = dev ? ' -D' : '';
  const dependencies = packages.map(formatPackage);

  return `${packageManager} ${action}${devFlag} ${dependencies.join(' ')}`;
}

function formatPackage(dependency: InstallablePackage): string {
  const packageSpec = `${dependency.name}@${dependency.version}`;

  return /\s/.test(packageSpec) ? `'${packageSpec}'` : packageSpec;
}
