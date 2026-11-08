import type { CharacterConfig } from '../domain/model/character';
import type { ContentRegistry } from '../domain/model/content';
import { createGame } from '../engine/create-game';
import { useGameStore } from './game-store';
import type { SaveEnvelope, SaveRepository } from './ports/save-repository';

interface SessionOptions {
  createSeed?: () => number;
  createRunId?: () => string;
  now?: () => string;
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
      const save: SaveEnvelope = {
        schemaVersion: 1,
        appVersion: '0.1.0',
        savedAt: (this.options.now ?? (() => new Date().toISOString()))(),
        state,
      };
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

  /** Dành cho xuất cứu hộ khi lưu thất bại; chưa nối vào UI của bộ khung. */
  getPendingSave(): SaveEnvelope | null {
    return this.pendingSave === null ? null : structuredClone(this.pendingSave);
  }
}
