import type { SaveEnvelope, SaveExpectation, SaveRepository } from '../../application/ports/save-repository';
import { SaveConflictError } from './errors';
import { validateCommitCandidate } from './save-schema';

/** Adapter nhỏ dùng cho test và fixture; ứng dụng thật dùng IndexedDB. */
export class MemorySaveRepository implements SaveRepository {
  private current: SaveEnvelope | null = null;
  private backup: SaveEnvelope | null = null;

  async load(): Promise<SaveEnvelope | null> {
    return this.current === null ? null : structuredClone(this.current);
  }

  async loadBackup(): Promise<SaveEnvelope | null> {
    return this.backup === null ? null : structuredClone(this.backup);
  }

  async commit(candidate: SaveEnvelope, expected: SaveExpectation | null): Promise<void> {
    const validated = validateCommitCandidate(candidate, expected);
    if (expected === null) {
      if (this.current !== null) throw new SaveConflictError();
    } else if (this.current?.state.meta.runId !== expected.runId || this.current.state.meta.revision !== expected.revision) {
      throw new SaveConflictError();
    }
    this.backup = this.current === null ? null : structuredClone(this.current);
    this.current = validated;
  }
}
