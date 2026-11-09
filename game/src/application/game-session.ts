import type { CharacterConfig } from '../domain/model/character';
import type { GameCommand } from '../domain/model/command';
import type { ContentRegistry } from '../domain/model/content';
import type { ActivityOption } from '../domain/model/day-view';
import type { GameState } from '../domain/model/game-state';
import { createGame } from '../engine/create-game';
import { useGameStore } from './game-store';
import type { ActivityOptionsProvider, CommandExecutor } from './ports/command-executor';
import type { DayActionResult, DayActions } from './ports/day-actions';
import type { SaveEnvelope, SaveRepository } from './ports/save-repository';

interface SessionOptions {
  createSeed?: () => number;
  createRunId?: () => string;
  createCommandId?: () => string;
  now?: () => string;
  /** Bootstrap gắn engine thật ở issue tích hợp; không gắn fixtureExecutor vào production. */
  executor?: CommandExecutor;
  activityOptions?: ActivityOptionsProvider;
}

function createSeed(): number {
  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return values[0] ?? 0;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Không thể đọc hoặc ghi dữ liệu lưu. Hãy thử lại.';
}

export class GameSession {
  private initialization: Promise<void> | undefined;
  private initializedSuccessfully = false;
  private starting = false;
  private pendingSave: SaveEnvelope | null = null;
  /** Mỗi command chờ command trước commit/thất bại xong, nên mỗi revision chỉ có một candidate. */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly repository: SaveRepository,
    private readonly content: ContentRegistry,
    private readonly options: SessionOptions = {},
  ) {}

  initialize(): Promise<void> {
    this.initialization ??= this.loadInitialState();
    return this.initialization;
  }

  private async loadInitialState(): Promise<void> {
    useGameStore.setState({ status: 'loading', error: null, hasLoaded: false });
    try {
      const save = await this.repository.load();
      if (save !== null && (
        save.state.meta.contentVersion !== this.content.version ||
        save.state.meta.rulesVersion !== this.content.rulesVersion
      )) {
        throw new Error('Bản lưu dùng phiên bản nội dung hoặc luật chưa tương thích. Dữ liệu hiện tại được giữ nguyên.');
      }
      this.initializedSuccessfully = true;
      useGameStore.setState({ state: save?.state ?? null, status: 'ready', error: null, hasLoaded: true });
    } catch (error: unknown) {
      useGameStore.setState({ state: null, status: 'error', error: errorMessage(error), hasLoaded: false });
    }
  }

  private envelope(state: GameState): SaveEnvelope {
    return {
      schemaVersion: 1,
      appVersion: '0.1.0',
      savedAt: (this.options.now ?? (() => new Date().toISOString()))(),
      state,
    };
  }

  async startNewGame(config: CharacterConfig): Promise<void> {
    await this.initialize();
    if (!this.initializedSuccessfully || this.starting) return;
    if (useGameStore.getState().state !== null) {
      useGameStore.setState({ status: 'error', error: 'Đã có lượt chơi. Bộ khung hiện giữ nguyên nhân vật đang lưu.' });
      return;
    }
    this.starting = true;
    useGameStore.setState({ status: 'saving', error: null });
    try {
      const state = createGame(
        config,
        (this.options.createSeed ?? createSeed)(),
        (this.options.createRunId ?? (() => globalThis.crypto.randomUUID()))(),
        this.content,
      );
      const save = this.envelope(state);
      this.pendingSave = save;
      await this.repository.commit(save, null);
      this.pendingSave = null;
      useGameStore.setState({ state, status: 'ready', error: null });
    } catch (error: unknown) {
      useGameStore.setState({ status: 'error', error: errorMessage(error) });
    } finally {
      this.starting = false;
    }
  }

  /** Xếp hàng command; kết quả luôn resolve, không reject. */
  dispatch(command: GameCommand): Promise<DayActionResult> {
    const run = this.queue.then(() => this.runCommand(command));
    this.queue = run;
    return run;
  }

  private async runCommand(command: GameCommand): Promise<DayActionResult> {
    await this.initialize();
    const { state, error } = useGameStore.getState();
    // Giữ nguyên lỗi load trong store; không ghi đè bằng lỗi command.
    if (!this.initializedSuccessfully) return { ok: false, message: error ?? 'Chưa mở được bản lưu.' };
    if (state === null) return this.fail('Chưa có lượt chơi để thực hiện lệnh.');
    // Retry command đã commit: không chạy lại để tránh nhân hiệu ứng.
    if (command.commandId === state.meta.lastCommandId) return { ok: true };
    if (command.expectedRevision !== state.meta.revision) {
      return this.fail('Lệnh đã cũ vì lượt chơi vừa thay đổi. Hãy xem lại trạng thái hiện tại.');
    }
    if (this.options.executor === undefined) return this.fail('Bản này chưa gắn engine ngày chơi.');

    useGameStore.setState({ status: 'saving', error: null });
    try {
      // Bản sao để executor lỗi không sửa được snapshot đã publish.
      const result = this.options.executor(structuredClone(state), command);
      if (!result.ok) return this.fail(result.error.message);
      const save = this.envelope(result.nextState);
      this.pendingSave = save;
      await this.repository.commit(save, { runId: state.meta.runId, revision: state.meta.revision });
      this.pendingSave = null;
      useGameStore.setState({ state: result.nextState, status: 'ready', error: null });
      return { ok: true };
    } catch (caught: unknown) {
      return this.fail(errorMessage(caught));
    }
  }

  private fail(message: string): DayActionResult {
    useGameStore.setState({ status: 'error', error: message });
    return { ok: false, message };
  }

  /** Gắn DayActions với snapshot đang hiển thị: bấm hai lần tạo hai command cùng revision, lần sau bị từ chối. */
  bindDayActions(displayed: Readonly<GameState>): DayActions {
    const meta = () => ({
      commandId: (this.options.createCommandId ?? (() => globalThis.crypto.randomUUID()))(),
      expectedRevision: displayed.meta.revision,
    });
    return {
      executeDay: (activityId) => this.dispatch({ ...meta(), type: 'EXECUTE_DAY', activityId }),
      acknowledgeDay: () => this.dispatch({ ...meta(), type: 'ACK_DAY' }),
    };
  }

  getActivityOptions(state: Readonly<GameState>): readonly ActivityOption[] {
    return this.options.activityOptions?.(state) ?? [];
  }

  /** Dành cho xuất cứu hộ khi lưu thất bại; chưa nối vào UI của bộ khung. */
  getPendingSave(): SaveEnvelope | null {
    return this.pendingSave === null ? null : structuredClone(this.pendingSave);
  }
}
