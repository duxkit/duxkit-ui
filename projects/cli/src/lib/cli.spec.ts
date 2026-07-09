import { describe, expect, it } from 'vitest';
import { runCli, type CliIo } from './cli.js';

interface CliResult {
  readonly exitCode: number;
  readonly stderr: string;
  readonly stdout: string;
}

async function run(argv: readonly string[]): Promise<CliResult> {
  let stderr = '';
  let stdout = '';
  const io: CliIo = {
    stderr: {
      write: (chunk) => {
        stderr += chunk;
      },
    },
    stdout: {
      write: (chunk) => {
        stdout += chunk;
      },
    },
  };

  const exitCode = await runCli(argv, io);

  return {
    exitCode,
    stderr,
    stdout,
  };
}

describe('duxkit-ui command shell', () => {
  it.each([
    [
      'init',
      [
        '--cwd',
        '/tmp/app',
        '--project',
        'app',
        '--stylesheet',
        'src/styles.scss',
        '--components-path',
        'src/app/components/ai',
        '--style',
        'scss',
        '--tokens',
        'add',
        '--dry-run',
        '--json',
        '--yes',
        '--no-install',
      ],
    ],
    [
      'add',
      [
        'message',
        'conversation',
        '--cwd',
        '/tmp/app',
        '--project',
        'app',
        '--components-path',
        'src/app/components/ai',
        '--dry-run',
        '--json',
        '--yes',
        '--no-install',
        '--force',
      ],
    ],
  ] as const)('parses %s with supported options', async (command, args) => {
    const result = await run([command, ...args]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(`duxkit-ui ${command} is scaffolded but not implemented yet.`);
    expect(result.stderr).not.toContain('unknown option');
    expect(result.stdout).toBe('');
  });

  it('inspects workspace state as JSON', async () => {
    const result = await run(['inspect', '--cwd', '/tmp/app', '--json']);
    const parsed = JSON.parse(result.stdout) as {
      readonly componentDestination: string | null;
      readonly root: string;
      readonly type: string;
    };

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(parsed.root).toBe('/tmp/app');
    expect(parsed.type).toBe('unknown');
    expect(parsed.componentDestination).toBeNull();
  });

  it('lists primitives in human-readable form', async () => {
    const result = await run(['list']);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Available primitives');
    expect(result.stdout).toContain(
      '- message (Message) groups: Angular, Styling, Markdown, Icons, AI runtime deps: markdown, code-block',
    );
    expect(result.stdout).toContain('Installed primitives');
    expect(result.stdout).toContain('None detected');
    expect(result.stdout).toContain('Dependency groups');
    expect(result.stdout).not.toContain('Planned primitives');
  });

  it('lists primitives as JSON', async () => {
    const result = await run(['list', '--json']);
    const parsed = JSON.parse(result.stdout) as {
      readonly primitives: readonly {
        readonly id: string;
        readonly installed: boolean;
        readonly primitiveDependencies: readonly string[];
        readonly status: string;
      }[];
    };

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(parsed.primitives).toContainEqual(
      expect.objectContaining({
        id: 'message',
        installed: false,
        primitiveDependencies: ['markdown', 'code-block'],
        status: 'available',
      }),
    );
  });

  it('fails clearly for unknown commands', async () => {
    const result = await run(['remove', 'message']);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("error: unknown command 'remove'");
  });

  it('fails clearly for unsupported options', async () => {
    const result = await run(['list', '--force']);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("error: unknown option '--force'");
  });

  it('fails clearly for unsupported option values', async () => {
    const result = await run(['init', '--tokens', 'replace']);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      "error: option '--tokens <mode>' argument 'replace' is invalid",
    );
  });

  it('prints help for the binary and supported commands', async () => {
    const rootHelp = await run(['--help']);
    const commandHelp = await run(['add', '--help']);

    expect(rootHelp.exitCode).toBe(0);
    expect(rootHelp.stdout).toContain('Usage: duxkit-ui [options] [command]');
    expect(rootHelp.stdout).toContain('init');
    expect(rootHelp.stdout).toContain('add');
    expect(rootHelp.stdout).toContain('list');
    expect(rootHelp.stdout).toContain('inspect');

    expect(commandHelp.exitCode).toBe(0);
    expect(commandHelp.stdout).toContain('Usage: duxkit-ui add [options] [primitives...]');
    expect(commandHelp.stdout).toContain('--force');
  });
});
