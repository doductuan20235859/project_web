import { useEffect, useRef, useState } from 'react';
import type { DayActionResult, DayActions } from '../application/ports/day-actions';
import type { GameCommand } from '../domain/model/command';
import type { GameState } from '../domain/model/game-state';
import { fixtureActivityOptions, fixtureExecutor } from '../testing/day-fixtures';
import type { DayWorkbenchContext, WorkbenchSaveMode, WorkbenchStatus } from './contracts';
import { createWorkbenchFixture, type WorkbenchFixtureId } from './fixtures';

interface WorkbenchSnapshot {
  fixtureId: WorkbenchFixtureId;
  state: GameState;
  status: WorkbenchStatus;
  saveMode: WorkbenchSaveMode;
  error: string | null;
}

interface PendingResult {
  candidate: GameState;
  resolve: (result: DayActionResult) => void;
}

const SAVE_FAILURE_MESSAGE = 'Lỗi lưu mô phỏng: snapshot trước được giữ nguyên trong bộ nhớ.';

/** This controller owns only React memory. It never instantiates GameSession. */
export function useWorkbench() {
  const [snapshot, setSnapshot] = useState<WorkbenchSnapshot>(() => ({
    fixtureId: 'planning-day-1',
    state: createWorkbenchFixture('planning-day-1'),
    status: 'ready',
    saveMode: 'success',
    error: null,
  }));
  const snapshotRef = useRef(snapshot);
  const pendingRef = useRef<PendingResult | null>(null);
  const commandCounterRef = useRef(0);

  useEffect(() => () => {
    pendingRef.current?.resolve({ ok: false, message: 'Workbench đã đóng; lần lưu mẫu bị hủy.' });
    pendingRef.current = null;
  }, []);

  function publish(next: WorkbenchSnapshot) {
    snapshotRef.current = next;
    setSnapshot(next);
  }

  function changeFixture(fixtureId: WorkbenchFixtureId) {
    pendingRef.current?.resolve({ ok: false, message: 'Đã đặt lại fixture; lần lưu mẫu bị hủy.' });
    pendingRef.current = null;
    commandCounterRef.current = 0;
    publish({
      fixtureId,
      state: createWorkbenchFixture(fixtureId),
      status: 'ready',
      saveMode: 'success',
      error: null,
    });
  }

  function changeSaveMode(saveMode: WorkbenchSaveMode) {
    if (pendingRef.current) return;
    publish({ ...snapshotRef.current, saveMode });
  }

  function perform(command: GameCommand): Promise<DayActionResult> {
    const current = snapshotRef.current;
    if (pendingRef.current) {
      return Promise.resolve({ ok: false, message: 'Một lần lưu mẫu đang chờ xử lý.' });
    }

    const result = fixtureExecutor(current.state, command);
    if (!result.ok) {
      publish({ ...current, status: 'error', error: result.error.message });
      return Promise.resolve({ ok: false, message: result.error.message });
    }

    if (current.saveMode === 'failure') {
      publish({ ...current, status: 'error', error: SAVE_FAILURE_MESSAGE });
      return Promise.resolve({ ok: false, message: SAVE_FAILURE_MESSAGE });
    }

    if (current.saveMode === 'success') {
      publish({ ...current, state: result.nextState, status: 'ready', error: null });
      return Promise.resolve({ ok: true });
    }

    publish({ ...current, status: 'saving', error: null });
    return new Promise<DayActionResult>((resolve) => {
      pendingRef.current = { candidate: result.nextState, resolve };
    });
  }

  function commandMetadata() {
    commandCounterRef.current += 1;
    const { meta } = snapshotRef.current.state;
    return {
      commandId: `workbench-${meta.runId}-${commandCounterRef.current}`,
      expectedRevision: meta.revision,
    };
  }

  const actions: DayActions = {
    executeDay(activityId) {
      return perform({ ...commandMetadata(), type: 'EXECUTE_DAY', activityId });
    },
    acknowledgeDay() {
      return perform({ ...commandMetadata(), type: 'ACK_DAY' });
    },
  };

  function settlePending(succeeded: boolean) {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    const current = snapshotRef.current;
    if (succeeded) {
      publish({ ...current, state: pending.candidate, status: 'ready', error: null });
      pending.resolve({ ok: true });
    } else {
      publish({ ...current, status: 'error', error: SAVE_FAILURE_MESSAGE });
      pending.resolve({ ok: false, message: SAVE_FAILURE_MESSAGE });
    }
  }

  const context: DayWorkbenchContext = {
    state: snapshot.state,
    activityOptions: fixtureActivityOptions(snapshot.state),
    status: snapshot.status,
    error: snapshot.error,
    actions,
  };

  return { snapshot, context, changeFixture, changeSaveMode, settlePending };
}
