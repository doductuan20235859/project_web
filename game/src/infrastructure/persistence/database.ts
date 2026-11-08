import Dexie, { type Table } from 'dexie';

export type SaveRecordKey = 'current' | 'backup';

export interface SaveRecord {
  key: SaveRecordKey;
  value: unknown;
}

export class SaveDatabase extends Dexie {
  snapshots: Table<SaveRecord, SaveRecordKey>;

  constructor(name = 'nhat-ky-di-nhat') {
    super(name);
    this.version(1).stores({ snapshots: 'key' });
    this.snapshots = this.table<SaveRecord, SaveRecordKey>('snapshots');
  }
}
