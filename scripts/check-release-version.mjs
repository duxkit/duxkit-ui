import { readFile } from 'node:fs/promises';

const [packagePath, tagPrefix, tag = process.env.GITHUB_REF_NAME] = process.argv.slice(2);

if (!packagePath || !tagPrefix || !tag) {
  console.error('Usage: node scripts/check-release-version.mjs <package.json> <tag-prefix> [tag]');
  process.exit(1);
}

const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
const expectedTag = `${tagPrefix}${packageJson.version}`;

if (tag !== expectedTag) {
  console.error(`Release tag ${tag} does not match package version ${expectedTag}.`);
  process.exit(1);
}

console.log(`Release tag matches ${packageJson.name}@${packageJson.version}`);
