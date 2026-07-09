export class CliCommandError extends Error {
  constructor(readonly exitCode: number) {
    super();
  }
}
