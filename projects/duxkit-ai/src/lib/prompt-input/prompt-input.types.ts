import type { ChatStatus, FileUIPart } from 'ai';

export type PromptInputStatus = ChatStatus;
export type PromptInputFilePart = FileUIPart & {
  readonly file: File;
  readonly id: string;
};

export interface AiPromptSubmit {
  readonly text: string;
  readonly files: readonly FileUIPart[];
}

export type PromptInputFileErrorCode = 'accept' | 'max_file_size' | 'max_files';

export interface PromptInputFileError {
  readonly code: PromptInputFileErrorCode;
  readonly message: string;
  readonly files: readonly File[];
}
