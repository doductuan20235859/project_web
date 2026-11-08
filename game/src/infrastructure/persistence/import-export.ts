import type { SaveEnvelope } from '../../application/ports/save-repository';
import { SaveValidationError } from './errors';
import { parseSaveEnvelope } from './save-schema';

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

export function encodeSave(save: SaveEnvelope): string {
  return JSON.stringify(parseSaveEnvelope(save), null, 2);
}

export function decodeSave(json: string): SaveEnvelope {
  if (new TextEncoder().encode(json).byteLength > MAX_IMPORT_BYTES) {
    throw new SaveValidationError('File lưu vượt quá giới hạn 2 MB.');
  }
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new SaveValidationError('File lưu không phải JSON hợp lệ.');
  }
  return parseSaveEnvelope(value);
}
