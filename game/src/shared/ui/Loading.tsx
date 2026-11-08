import type { PropsWithChildren } from 'react';

export function Loading({ children }: PropsWithChildren) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-state__dot" aria-hidden="true" />
      <p>{children ?? 'Đang tải…'}</p>
    </div>
  );
}
