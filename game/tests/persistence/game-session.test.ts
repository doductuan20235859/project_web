import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSession } from '../../src/application/game-session';
import { useGameStore } from '../../src/application/game-store';
import type { SaveRepository } from '../../src/application/ports/save-repository';
import { contentRegistry } from '../../src/content/registry';
import { MemorySaveRepository } from '../../src/infrastructure/persistence/memory-save-repository';
import { characterConfig, makeSave } from './fixtures';

const options = {
  createSeed: () => 123,
  createRunId: () => 'new-run',
  now: () => '2026-11-08T03:00:00.000Z',
};

beforeEach(() => {
  useGameStore.setState({ state: null, status: 'loading', error: null, hasLoaded: false });
});

describe('GameSession load và tạo nhân vật', () => {
  it('memo initialize để StrictMode không load hai lần', async () => {
    const repository = new MemorySaveRepository();
    const load = vi.spyOn(repository, 'load');
    const session = new GameSession(repository, contentRegistry, options);
    const first = session.initialize();
    expect(session.initialize()).toBe(first);
    await first;
    expect(load).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState()).toEqual({ state: null, status: 'ready', error: null, hasLoaded: true });
  });

  it('chỉ công bố nhân vật sau khi persistence commit thành công', async () => {
    const repository = new MemorySaveRepository();
    let releaseCommit: (() => void) | undefined;
    const commit = repository.commit.bind(repository);
    vi.spyOn(repository, 'commit').mockImplementation(async (save, expected) => {
      await new Promise<void>((resolve) => { releaseCommit = resolve; });
      await commit(save, expected);
    });
    const session = new GameSession(repository, contentRegistry, options);
    await session.initialize();
    const creation = session.startNewGame(characterConfig);
    await vi.waitFor(() => expect(releaseCommit).toBeTypeOf('function'));
    expect(useGameStore.getState().state).toBeNull();
    expect(useGameStore.getState().status).toBe('saving');
    releaseCommit?.();
    await creation;
    expect(useGameStore.getState().state).toEqual((await repository.load())?.state);
    expect(useGameStore.getState().status).toBe('ready');
  });

  it('lưu thất bại giữ state cũ và giữ ứng viên cho xuất cứu hộ', async () => {
    const repository = new MemorySaveRepository();
    vi.spyOn(repository, 'commit').mockRejectedValue(new Error('Không đủ dung lượng'));
    const session = new GameSession(repository, contentRegistry, options);
    await session.startNewGame(characterConfig);
    expect(useGameStore.getState().state).toBeNull();
    expect(useGameStore.getState().error).toBe('Không đủ dung lượng');
    expect(useGameStore.getState().hasLoaded).toBe(true);
    expect(session.getPendingSave()?.state.character.name).toBe(characterConfig.name);
  });

  it('lỗi load không cho tạo lượt mới để đè dữ liệu cũ', async () => {
    const commit = vi.fn();
    const repository: SaveRepository = {
      load: vi.fn().mockRejectedValue(new Error('Save hỏng')),
      loadBackup: vi.fn().mockResolvedValue(null),
      commit,
    };
    const session = new GameSession(repository, contentRegistry, options);
    await session.startNewGame(characterConfig);
    expect(commit).not.toHaveBeenCalled();
    expect(useGameStore.getState().status).toBe('error');
    expect(useGameStore.getState().error).toBe('Save hỏng');
    expect(useGameStore.getState().hasLoaded).toBe(false);
  });

  it('lỗi tạo nhân vật vẫn cho sửa thông tin và thử lại sau khi load thành công', async () => {
    const repository = new MemorySaveRepository();
    const session = new GameSession(repository, contentRegistry, options);
    await session.startNewGame({ ...characterConfig, name: '   ' });
    expect(useGameStore.getState().status).toBe('error');
    expect(useGameStore.getState().hasLoaded).toBe(true);
    expect(useGameStore.getState().state).toBeNull();
    await session.startNewGame(characterConfig);
    expect(useGameStore.getState().status).toBe('ready');
    expect(useGameStore.getState().state?.character.name).toBe(characterConfig.name);
  });

  it('khôi phục lượt hiện có và chặn tạo mới ghi đè', async () => {
    const repository = new MemorySaveRepository();
    const existing = makeSave();
    await repository.commit(existing, null);
    const commit = vi.spyOn(repository, 'commit');
    const session = new GameSession(repository, contentRegistry, options);
    await session.initialize();
    await session.startNewGame(characterConfig);
    expect(commit).not.toHaveBeenCalled();
    expect(useGameStore.getState().state).toEqual(existing.state);
    expect(await repository.load()).toEqual(existing);
  });

  it('không hydrate save có content/rules chưa tương thích', async () => {
    const repository = new MemorySaveRepository();
    const existing = makeSave();
    existing.state.meta.rulesVersion = 'future-rules';
    await repository.commit(existing, null);
    const session = new GameSession(repository, contentRegistry, options);
    await session.initialize();
    expect(useGameStore.getState().state).toBeNull();
    expect(useGameStore.getState().status).toBe('error');
    expect(useGameStore.getState().hasLoaded).toBe(false);
    expect(await repository.load()).toEqual(existing);
  });
});
