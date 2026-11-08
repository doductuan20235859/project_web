import { describe, expect, it } from 'vitest';
import { SaveValidationError, UnsupportedSaveVersionError } from '../../src/infrastructure/persistence/errors';
import { decodeSave, encodeSave, MAX_IMPORT_BYTES } from '../../src/infrastructure/persistence/import-export';
import { parseSaveEnvelope } from '../../src/infrastructure/persistence/save-schema';
import { makeSave } from './fixtures';

describe('JSON save và kiểm tra dữ liệu runtime', () => {
  it('xuất/nhập bảo toàn seed, chỉ số và toàn bộ snapshot', () => {
    const save = makeSave();
    expect(decodeSave(encodeSave(save))).toEqual(save);
  });

  it('chặn JSON lỗi, file quá lớn và schema chưa hỗ trợ', () => {
    expect(() => decodeSave('{')).toThrow(SaveValidationError);
    expect(() => decodeSave(' '.repeat(MAX_IMPORT_BYTES + 1))).toThrow('2 MB');
    expect(() => parseSaveEnvelope({ ...makeSave(), schemaVersion: 2 })).toThrow(UnsupportedSaveVersionError);
  });

  it('phát hiện dữ liệu nested sai thay vì cast hoặc âm thầm clamp', () => {
    const save = makeSave();
    expect(() => parseSaveEnvelope({
      ...save,
      state: { ...save.state, character: { ...save.state.character, energy: 101 } },
    })).toThrow(SaveValidationError);
    expect(() => parseSaveEnvelope({
      ...save,
      state: { ...save.state, relationships: { lan: 50 } },
    })).toThrow(SaveValidationError);
  });

  it('XP trên 100 là hợp lệ và XP âm bị chặn', () => {
    const save = makeSave();
    save.state.character.japaneseXp = 350;
    expect(parseSaveEnvelope(save).state.character.japaneseXp).toBe(350);
    save.state.character.japaneseXp = -1;
    expect(() => parseSaveEnvelope(save)).toThrow(SaveValidationError);
  });
});
