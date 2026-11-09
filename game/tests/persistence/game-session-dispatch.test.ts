import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSession } from '../../src/application/game-session';
import { useGameStore } from '../../src/application/game-store';
import type { CommandExecutor } from '../../src/application/ports/command-executor';
import type { SaveEnvelope, SaveRepository } from '../../src/application/ports/save-repository';
import type { GameState } from '../../src/domain/model/game-state';
import { SaveDatabase } from '../../src/infrastructure/persistence/database';
import { SaveConflictError } from '../../src/infrastructure/persistence/errors';
import { IndexedDbSaveRepository } from '../../src/infrastructure/persistence/indexeddb-save-repository';
import { MemorySaveRepository } from '../../src/infrastructure/persistence/memory-save-repository';
import {
  fixtureActivityOptions,
  fixtureExecutor,
  fixtureGameplayContent,
  makePendingEvent,
  makePoorPlanning,
  makePlanningDay1,
  makeReviewDay1,
} from '../../src/testing/day-fixtures';

// Mọi test ở đây chạy bằng fixtureExecutor/fake executor, không phải engine thật.
const content = fixtureGameplayContent.registry;
const now = () => '2026-11-10T03:00:00.000Z';

function envelope(state: GameState): SaveEnvelope {
  return { schemaVersion: 1, appVersion: '0.1.0', savedAt: now(), state };
}

let commandNumber = 0;
const createCommandId = () => `cmd-${++commandNumber}`;

async function startedSession(
  state: GameState,
  executor: CommandExecutor | undefined = fixtureExecutor,
  repository: SaveRepository = new MemorySaveRepository(),
) {
  await repository.commit(envelope(state), null);
  const session = new GameSession(repository, content, {
    now, createCommandId, executor, activityOptions: fixtureActivityOptions,
  });
  await session.initialize();
  return { session, repository };
}

/** Giữ commit lại cho tới khi test gọi release(). */
function holdCommits(repository: SaveRepository) {
  const releases: (() => void)[] = [];
  const commit = repository.commit.bind(repository);
  const spy = vi.spyOn(repository, 'commit').mockImplementation(async (save, expected) => {
    await new Promise<void>((resolve) => releases.push(resolve));
    await commit(save, expected);
  });
  return { spy, releases };
}

beforeEach(() => {
  commandNumber = 0;
  useGameStore.setState({ state: null, status: 'loading', error: null, hasLoaded: false });
});

describe('GameSession dispatch với executor được inject', () => {
  it('chỉ publish state sau khi commit thành công', async () => {
    const { session, repository } = await startedSession(makePlanningDay1());
    const { releases } = holdCommits(repository);
    const actions = session.bindDayActions(useGameStore.getState().state!);

    const pending = actions.executeDay('fixture-study');
    await vi.waitFor(() => expect(releases).toHaveLength(1));
    expect(useGameStore.getState().status).toBe('saving');
    expect(useGameStore.getState().state?.clock.phase).toBe('planning');

    releases[0]!();
    expect(await pending).toEqual({ ok: true });
    const saved = await repository.load();
    expect(saved?.state.clock.phase).toBe('review');
    expect(saved?.state.meta.revision).toBe(1);
    expect(useGameStore.getState().state).toEqual(saved?.state);
    expect(useGameStore.getState().status).toBe('ready');
  });

  it('double-click: lệnh thứ hai chờ lệnh đầu và bị từ chối, executor chạy đúng một lần', async () => {
    const executor = vi.fn(fixtureExecutor);
    const { session, repository } = await startedSession(makePlanningDay1(), executor);
    const { releases } = holdCommits(repository);
    const actions = session.bindDayActions(useGameStore.getState().state!);

    const first = actions.executeDay('fixture-study');
    const second = actions.executeDay('fixture-study');
    await vi.waitFor(() => expect(releases).toHaveLength(1));
    expect(executor).toHaveBeenCalledTimes(1); // chưa có candidate thứ hai trong lúc chờ commit

    releases[0]!();
    expect(await first).toEqual({ ok: true });
    expect(await second).toMatchObject({ ok: false });
    expect(useGameStore.getState()).toMatchObject({ status: 'ready', error: null });
    expect(executor).toHaveBeenCalledTimes(1);
    expect((await repository.load())?.state.meta.revision).toBe(1);
  });

  it('retry cùng commandId sau khi đã commit không cộng hiệu ứng lần hai', async () => {
    const executor = vi.fn(fixtureExecutor);
    const { session, repository } = await startedSession(makePlanningDay1(), executor);
    const command = { commandId: 'same', expectedRevision: 0, type: 'EXECUTE_DAY', activityId: 'fixture-study' } as const;

    expect(await session.dispatch(command)).toEqual({ ok: true });
    expect(await session.dispatch(command)).toEqual({ ok: true });
    expect(executor).toHaveBeenCalledTimes(1);
    expect((await repository.load())?.state.meta.revision).toBe(1);
  });

  it('lỗi executor giữ snapshot đã lưu và trả lỗi qua DayActions', async () => {
    const before = makePoorPlanning();
    const { session, repository } = await startedSession(before);
    const commit = vi.spyOn(repository, 'commit');

    const result = await session.bindDayActions(before).executeDay('fixture-study');

    expect(result).toMatchObject({ ok: false });
    expect(commit).not.toHaveBeenCalled();
    expect(useGameStore.getState().state).toEqual(before);
    expect(useGameStore.getState().error).toBe(result.ok ? null : result.message);
  });

  it('executor ném lỗi hoặc sửa input không làm hỏng snapshot đã publish', async () => {
    const mutating: CommandExecutor = (state) => {
      (state as GameState).economy.cash = -1;
      throw new Error('Engine lỗi');
    };
    const { session } = await startedSession(makePlanningDay1(), mutating);

    const result = await session.bindDayActions(useGameStore.getState().state!).executeDay('fixture-study');

    expect(result).toEqual({ ok: false, message: 'Engine lỗi' });
    expect(useGameStore.getState().state).toEqual(makePlanningDay1());
  });

  it('commit lỗi giữ state cũ, giữ candidate cứu hộ, thử lại thành công đúng một lần', async () => {
    const { session, repository } = await startedSession(makePlanningDay1());
    vi.spyOn(repository, 'commit').mockRejectedValueOnce(new Error('Không đủ dung lượng'));
    const actions = session.bindDayActions(useGameStore.getState().state!);

    expect(await actions.executeDay('fixture-study')).toEqual({ ok: false, message: 'Không đủ dung lượng' });
    expect(useGameStore.getState().state).toEqual(makePlanningDay1());
    expect(useGameStore.getState().error).toBe('Không đủ dung lượng');
    expect(session.getPendingSave()?.state.clock.phase).toBe('review');

    expect(await actions.executeDay('fixture-study')).toEqual({ ok: true });
    expect((await repository.load())?.state.meta.revision).toBe(1);
  });

  it('CAS chặn ghi đè khi tab khác đã đổi save', async () => {
    const { session, repository } = await startedSession(makePlanningDay1());
    const otherTab = envelope(makeReviewDay1());
    await repository.commit(otherTab, { runId: 'fixture-run', revision: 0 });

    const result = await session.bindDayActions(useGameStore.getState().state!).executeDay('fixture-study');

    expect(result).toEqual({ ok: false, message: new SaveConflictError().message });
    expect(useGameStore.getState().state).toEqual(makePlanningDay1());
    expect(await repository.load()).toEqual(otherTab);
  });

  it('chưa gắn executor (như production bootstrap) thì không ghi gì', async () => {
    const repository = new MemorySaveRepository();
    const { session } = await startedSession(makePlanningDay1(), undefined, repository);
    const commit = vi.spyOn(repository, 'commit');

    const result = await session.bindDayActions(useGameStore.getState().state!).acknowledgeDay();

    expect(result).toMatchObject({ ok: false });
    expect(commit).not.toHaveBeenCalled();
    expect(session.getActivityOptions(makePlanningDay1())).toHaveLength(fixtureGameplayContent.dayRules.activities.length);
  });

  it('lỗi load không bị lỗi command ghi đè', async () => {
    const repository: SaveRepository = {
      load: vi.fn().mockRejectedValue(new Error('Save hỏng')),
      loadBackup: vi.fn().mockResolvedValue(null),
      commit: vi.fn(),
    };
    const session = new GameSession(repository, content, { executor: fixtureExecutor });

    const result = await session.dispatch({ commandId: 'x', expectedRevision: 0, type: 'ACK_DAY' });

    expect(result).toEqual({ ok: false, message: 'Save hỏng' });
    expect(useGameStore.getState().error).toBe('Save hỏng');
    expect(repository.commit).not.toHaveBeenCalled();
  });
});

describe('Reload từ IndexedDB giữ state và RNG', () => {
  it.each([
    ['review ngày 1', makeReviewDay1],
    ['event đang chờ', makePendingEvent],
  ])('%s', async (_name, make) => {
    const database = new SaveDatabase(`dispatch-reload-${make.name}`);
    try {
      await new IndexedDbSaveRepository(database).commit(envelope(make()), null);
      const session = new GameSession(new IndexedDbSaveRepository(database), content);
      await session.initialize();
      expect(useGameStore.getState().state).toEqual(make());
      expect(useGameStore.getState().state?.random).toEqual(make().random);
    } finally {
      await database.delete();
    }
  });

  it('review ngày 1 sau reload vẫn ACK sang ngày 2 đúng một lần', async () => {
    const database = new SaveDatabase('dispatch-reload-ack');
    try {
      await new IndexedDbSaveRepository(database).commit(envelope(makeReviewDay1()), null);
      const session = new GameSession(new IndexedDbSaveRepository(database), content, {
        now, createCommandId, executor: fixtureExecutor,
      });
      await session.initialize();
      const actions = session.bindDayActions(useGameStore.getState().state!);
      const results = await Promise.all([actions.acknowledgeDay(), actions.acknowledgeDay()]);
      expect(results.filter((result) => result.ok)).toHaveLength(1);
      expect(useGameStore.getState().state?.clock).toEqual({ day: 2, phase: 'planning' });
      expect(useGameStore.getState().state?.meta.revision).toBe(2);
    } finally {
      await database.delete();
    }
  });
});
