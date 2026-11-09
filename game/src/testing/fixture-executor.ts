import type { ActivityOptionsProvider, CommandExecutor } from '../application/ports/command-executor';
import type { GameRuleError } from '../domain/errors';
import type { EngineResult } from '../domain/model/command';
import type { ActivityOption } from '../domain/model/day-view';
import type { GameState } from '../domain/model/game-state';
import { makePlanningDay2, makeReviewDay1 } from './fixture-states';
import { FIXTURE_CONTENT_VERSION, FIXTURE_RULES_VERSION, fixtureGameplayContent } from './fixture-content';

/** UI fixture eligibility only. Production must use the real engine's evaluator. */
export const fixtureActivityOptions: ActivityOptionsProvider = (state) => {
  return fixtureGameplayContent.dayRules.activities.map((activity): ActivityOption => {
    let unavailableReason: string | null = null;
    if (state.clock.phase !== 'planning') unavailableReason = 'Mẫu này chỉ chọn hoạt động khi lập kế hoạch.';
    else if (state.economy.cash < activity.cashCost) unavailableReason = 'Không đủ tiền mặt trong dữ liệu mẫu.';
    else if (state.character.energy < activity.minimumEnergy) unavailableReason = 'Không đủ thể lực trong dữ liệu mẫu.';
    return {
      id: activity.id,
      name: activity.name,
      description: activity.description,
      available: unavailableReason === null,
      unavailableReason,
      cashCost: activity.cashCost,
      effectLabels: ['Mẫu giao diện; chưa áp dụng công thức gameplay.'],
    };
  });
};

function failure(code: GameRuleError['code'], message: string): EngineResult {
  return { ok: false, error: { code, message } };
}

/**
 * SCRIPTED TEST/WORKBENCH ADAPTER ONLY.
 * Returns predefined snapshots; it does not calculate activities, money or risk.
 * It deliberately rejects production-version states instead of simulating a game.
 */
export const fixtureExecutor: CommandExecutor = (state, command) => {
  if (state.meta.contentVersion !== FIXTURE_CONTENT_VERSION || state.meta.rulesVersion !== FIXTURE_RULES_VERSION) {
    return failure('INVALID_PHASE', 'Fixture executor chỉ nhận dữ liệu mẫu kiểm thử.');
  }
  if (command.expectedRevision !== state.meta.revision || command.commandId === state.meta.lastCommandId) {
    return failure('STALE_COMMAND', 'Command mẫu đã cũ hoặc đã được xử lý.');
  }

  let nextState: GameState;
  if (command.type === 'EXECUTE_DAY') {
    if (state.clock.day !== 1 || state.clock.phase !== 'planning') {
      return failure('INVALID_PHASE', 'Mẫu chỉ có bước thực hiện ngày 1.');
    }
    const activity = fixtureActivityOptions(state).find((option) => option.id === command.activityId);
    if (activity === undefined) return failure('INVALID_CHOICE', 'Hoạt động không có trong dữ liệu mẫu.');
    if (!activity.available) return failure('INSUFFICIENT_RESOURCES', activity.unavailableReason ?? 'Mẫu bị khóa.');
    nextState = makeReviewDay1();
    nextState.turn.activityId = command.activityId;
    if (command.activityId !== 'fixture-study') {
      nextState.turn.summary = {
        day: 1,
        message: 'KẾT QUẢ MẪU CỐ ĐỊNH: snapshot học tập dùng để kiểm tra giao diện. Lựa chọn vừa bấm chưa được mô phỏng bằng luật gameplay.',
      };
    }
  } else if (command.type === 'ACK_DAY') {
    if (state.clock.day !== 1 || state.clock.phase !== 'review') {
      return failure('INVALID_PHASE', 'Mẫu chỉ có bước xác nhận từ ngày 1 sang ngày 2.');
    }
    nextState = makePlanningDay2();
  } else {
    if (state.clock.phase !== 'event' || state.clock.day !== 1) {
      return failure('INVALID_PHASE', 'Không có event mẫu đang chờ.');
    }
    const event = state.turn.eventQueue.find((instance) => instance.id === command.instanceId);
    if (event === undefined || !event.snapshot.choices.some((choice) => choice.id === command.choiceId)) {
      return failure('INVALID_CHOICE', 'Lựa chọn không thuộc event mẫu đang hiển thị.');
    }
    nextState = makeReviewDay1();
  }
  nextState.meta = {
    ...state.meta,
    revision: state.meta.revision + 1,
    lastCommandId: command.commandId,
  };
  return { ok: true, nextState, notices: [{ kind: 'info', message: 'Chỉ là chuyển cảnh bằng dữ liệu mẫu.' }] };
};
