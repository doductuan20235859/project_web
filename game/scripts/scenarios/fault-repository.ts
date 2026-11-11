import type { SaveRepository } from '../../src/application/ports/save-repository';
import { SaveConflictError } from '../../src/infrastructure/persistence/errors';

export type CommitFault =
  | { kind: 'error' }
  | { kind: 'conflict' }
  | { kind: 'delay'; wait: () => Promise<void> };

/** Each entry affects one commit attempt; subsequent commits delegate normally. */
export function withCommitFaults(repository: SaveRepository, faults: readonly CommitFault[]): SaveRepository {
  let attempt = 0;
  return {
    load: () => repository.load(),
    loadBackup: () => repository.loadBackup(),
    async commit(candidate, expected) {
      const fault = faults[attempt++];
      // Capture the request before waiting so caller mutations cannot change it.
      const request = structuredClone({ candidate, expected });
      if (fault?.kind === 'error') throw new Error('Injected commit failure');
      if (fault?.kind === 'conflict') throw new SaveConflictError();
      if (fault?.kind === 'delay') await fault.wait();
      await repository.commit(request.candidate, request.expected);
    },
  };
}

/** Manual latency control; tests wait for entry instead of sleeping. */
export function createCommitGate() {
  let enter!: () => void;
  let release!: () => void;
  const entered = new Promise<void>((resolve) => { enter = resolve; });
  const released = new Promise<void>((resolve) => { release = resolve; });
  return {
    entered,
    release,
    wait() {
      enter();
      return released;
    },
  };
}
