import type { FileUIPart, SourceDocumentUIPart } from 'ai';

export type AiAttachmentPart = FileUIPart | SourceDocumentUIPart;
export type AiAttachmentKind = 'image' | 'video' | 'audio' | 'document' | 'source';
export type AttachmentsVariant = 'grid' | 'inline' | 'list';

const documentMediaTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
  'text/plain',
  'text/markdown',
]);

export function getAttachmentMediaType(part: AiAttachmentPart): string {
  return part.mediaType || 'application/octet-stream';
}

export function getAttachmentUrl(part: AiAttachmentPart): string | undefined {
  return part.type === 'file' ? part.url : undefined;
}

export function getAttachmentName(part: AiAttachmentPart): string {
  if (part.type === 'source-document') {
    return part.title || part.filename || 'Source document';
  }

  if (part.filename !== undefined && part.filename.trim().length > 0) {
    return part.filename;
  }

  return getNameFromUrl(part.url) ?? 'Attachment';
}

export function getAttachmentKind(part: AiAttachmentPart): AiAttachmentKind {
  if (part.type === 'source-document') {
    return 'source';
  }

  const mediaType = getAttachmentMediaType(part).toLowerCase();

  if (mediaType.startsWith('image/')) {
    return 'image';
  }

  if (mediaType.startsWith('video/')) {
    return 'video';
  }

  if (mediaType.startsWith('audio/')) {
    return 'audio';
  }

  if (documentMediaTypes.has(mediaType) || mediaType.startsWith('text/')) {
    return 'document';
  }

  return 'document';
}

function getNameFromUrl(url: string): string | undefined {
  let pathname: string;

  try {
    pathname = new URL(url, 'http://attachment.local').pathname;
  } catch {
    pathname = url.split(/[?#]/, 1)[0] ?? '';
  }

  const name = pathname.split('/').filter(Boolean).at(-1);

  if (name === undefined || name.length === 0) {
    return undefined;
  }

  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}
