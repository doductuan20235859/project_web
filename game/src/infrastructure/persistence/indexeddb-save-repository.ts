import type { SaveEnvelope, SaveExpectation, SaveRepository } from '../../application/ports/save-repository';
import { SaveDatabase } from './database';
import { SaveConflictError } from './errors';
import { parseSaveEnvelope, validateCommitCandidate } from './save-schema';

export class IndexedDbSaveRepository implements SaveRepository {
  constructor(private readonly database: SaveDatabase = new SaveDatabase()) {}

  async load(): Promise<SaveEnvelope | null> {
    const record = await this.database.snapshots.get('current');
    return record === undefined ? null : parseSaveEnvelope(record.value);
  }

  async loadBackup(): Promise<SaveEnvelope | null> {
    const record = await this.database.snapshots.get('backup');
    return record === undefined ? null : parseSaveEnvelope(record.value);
  }

  async commit(candidate: SaveEnvelope, expected: SaveExpectation | null): Promise<void> {
    const validated = validateCommitCandidate(candidate, expected);
    await this.database.transaction('rw', this.database.snapshots, async () => {
      const currentRecord = await this.database.snapshots.get('current');
      if (expected === null) {
        if (currentRecord !== undefined) throw new SaveConflictError();
      } else {
        if (currentRecord === undefined) throw new SaveConflictError();
        const current = parseSaveEnvelope(currentRecord.value);
        if (current.state.meta.runId !== expected.runId || current.state.meta.revision !== expected.revision) {
          throw new SaveConflictError();
        }
      }
      if (currentRecord !== undefined) {
        await this.database.snapshots.put({ key: 'backup', value: currentRecord.value });
      }
      await this.database.snapshots.put({ key: 'current', value: validated });
    });
  }
}
