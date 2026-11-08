import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SaveDatabase } from '../../src/infrastructure/persistence/database';
import { SaveConflictError, SaveValidationError, UnsupportedSaveVersionError } from '../../src/infrastructure/persistence/errors';
import { IndexedDbSaveRepository } from '../../src/infrastructure/persistence/indexeddb-save-repository';
import { makeSave, nextSave } from './fixtures';

let database: SaveDatabase;
let repository: IndexedDbSaveRepository;
let databaseNumber = 0;

beforeEach(() => {
  databaseNumber += 1;
  database = new SaveDatabase(`save-repository-test-${databaseNumber}`);
  repository = new IndexedDbSaveRepository(database);
});

afterEach(async () => {
  await database.delete();
});

describe('IndexedDB current/backup và kiểm tra revision', () => {
  it('đọc rỗng và giữ bản trước sau lần commit kế tiếp', async () => {
    expect(await repository.load()).toBeNull();
    const first = makeSave();
    await repository.commit(first, null);
    const second = nextSave(first);
    await repository.commit(second, first.state.meta);
    expect(await repository.load()).toEqual(second);
    expect(await repository.loadBackup()).toEqual(first);
  });

  it('chặn tạo mới đè lượt đã có và chặn revision cũ', async () => {
    const first = makeSave();
    await repository.commit(first, null);
    const second = nextSave(first);
    await repository.commit(second, first.state.meta);
    await expect(repository.commit(first, null)).rejects.toBeInstanceOf(SaveConflictError);
    await expect(repository.commit(nextSave(first), first.state.meta)).rejects.toBeInstanceOf(SaveConflictError);
    expect(await repository.load()).toEqual(second);
    expect(await repository.loadBackup()).toEqual(first);
  });

  it('chặn đổi runId hoặc ghi revision không tăng đúng một lần', async () => {
    const first = makeSave();
    await repository.commit(first, null);
    await expect(repository.commit(first, first.state.meta)).rejects.toBeInstanceOf(SaveValidationError);
    const wrongRun = nextSave(first);
    wrongRun.state.meta.runId = 'other-run';
    await expect(repository.commit(wrongRun, first.state.meta)).rejects.toBeInstanceOf(SaveValidationError);
    const skippedRevision = nextSave(first);
    skippedRevision.state.meta.revision += 1;
    await expect(repository.commit(skippedRevision, first.state.meta)).rejects.toBeInstanceOf(SaveValidationError);
    expect(await repository.load()).toEqual(first);
    expect(await repository.loadBackup()).toBeNull();
  });

  it('chỉ một trong hai commit cùng revision được chấp nhận', async () => {
    const first = makeSave();
    await repository.commit(first, null);
    const results = await Promise.allSettled([
      repository.commit(nextSave(first), first.state.meta),
      repository.commit(nextSave(first), first.state.meta),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect((await repository.load())?.state.meta.revision).toBe(first.state.meta.revision + 1);
    expect(await repository.loadBackup()).toEqual(first);
  });

  it('rollback cả backup khi ghi current thất bại trong transaction', async () => {
    const first = makeSave();
    await repository.commit(first, null);
    database.snapshots.hook('updating', (_changes, key) => {
      if (key === 'current') throw new Error('Lỗi ghi giả lập');
    });
    await expect(repository.commit(nextSave(first), first.state.meta)).rejects.toThrow('Lỗi ghi giả lập');
    expect(await repository.load()).toEqual(first);
    expect(await repository.loadBackup()).toBeNull();
  });

  it('giữ nguyên save hỏng và không cho tạo mới đè lên', async () => {
    const invalid = { schemaVersion: 1, state: { broken: true } };
    await database.snapshots.put({ key: 'current', value: invalid });
    await expect(repository.load()).rejects.toBeInstanceOf(SaveValidationError);
    await expect(repository.commit(makeSave(), null)).rejects.toBeInstanceOf(SaveConflictError);
    expect((await database.snapshots.get('current'))?.value).toEqual(invalid);
  });

  it('giữ save có phiên bản tương lai để mở lại bằng bản tương thích', async () => {
    const future = { ...makeSave(), schemaVersion: 2 };
    await database.snapshots.put({ key: 'current', value: future });
    await expect(repository.load()).rejects.toBeInstanceOf(UnsupportedSaveVersionError);
    expect((await database.snapshots.get('current'))?.value).toEqual(future);
  });
});
