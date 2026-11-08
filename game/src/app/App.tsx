import { useEffect } from 'react';
import { useGameStore } from '../application/game-store';
import { CharacterCreation } from '../features/character/CharacterCreation';
import { GameDashboard } from '../features/dashboard/GameDashboard';
import { Button } from '../shared/ui/Button';
import { Loading } from '../shared/ui/Loading';
import { gameSession } from './bootstrap';

export function App() {
  const state = useGameStore((store) => store.state);
  const status = useGameStore((store) => store.status);
  const error = useGameStore((store) => store.error);
  const hasLoaded = useGameStore((store) => store.hasLoaded);

  useEffect(() => {
    void gameSession.initialize();
  }, []);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#main-content" aria-label="Nhật ký đi Nhật, đến nội dung chính">
          <span className="brand__mark" aria-hidden="true">旅</span>
          <span>
            <span className="brand__name">Nhật ký đi Nhật</span>
            <span className="brand__subtitle">Hành trình tha hương</span>
          </span>
        </a>
        <span className="edition-label">Một hành trình của riêng bạn</span>
      </header>

      <main id="main-content" className="main-content">
        {status === 'loading' && !hasLoaded ? (
          <Loading>Đang mở trang nhật ký của bạn…</Loading>
        ) : status === 'error' && !hasLoaded ? (
          <section className="notice-card notice-card--error" role="alert">
            <p className="eyebrow">Chưa thể mở nhật ký</p>
            <h1>Hãy giữ lại trang viết của bạn.</h1>
            <p>{error ?? 'Không thể đọc tiến trình đã lưu trên thiết bị.'}</p>
            <p>Dữ liệu hiện có được giữ nguyên. Bạn có thể tải lại trang để thử mở lại.</p>
            <Button onClick={() => window.location.reload()}>Thử tải lại</Button>
          </section>
        ) : state ? (
          <>
            {error && <p className="inline-error" role="alert">{error}</p>}
            <GameDashboard state={state} />
          </>
        ) : (
          <CharacterCreation
            isSaving={status === 'saving'}
            error={error}
            onSubmit={(config) => gameSession.startNewGame(config)}
          />
        )}
      </main>

      <footer className="site-footer">
        <span>Nhật ký đi Nhật</span>
        <span>Mỗi lựa chọn, một dấu chân.</span>
      </footer>
    </div>
  );
}
