import { getGameStateIssues } from '../domain/invariants';
import { GameDashboard } from '../features/dashboard/GameDashboard';
import { Button } from '../shared/ui/Button';
import type { DayWorkbenchSlots, WorkbenchSaveMode } from './contracts';
import { isWorkbenchFixtureId, workbenchFixtures } from './fixtures';
import { useWorkbench } from './use-workbench';

interface DayWorkbenchProps {
  slots?: DayWorkbenchSlots;
}

export function DayWorkbench({ slots = {} }: DayWorkbenchProps) {
  const { snapshot, context, changeFixture, changeSaveMode, settlePending } = useWorkbench();
  const issues = getGameStateIssues(snapshot.state);
  const busy = snapshot.status === 'saving';
  const firstAvailable = context.activityOptions.find((activity) => activity.available);

  return (
    <div className="workbench">
      <header className="workbench-header">
        <div>
          <p className="eyebrow">Developer tooling · bộ nhớ tạm</p>
          <h1>Day UI workbench</h1>
          <p>
            Fixture và chuyển trạng thái dưới đây chỉ phục vụ phát triển giao diện.
            Không đọc hoặc ghi tiến trình người chơi; tải lại trang để về fixture đầu tiên.
          </p>
        </div>
        <span className="workbench-badge">DEV · SCRIPTED FIXTURES</span>
      </header>

      <main>
        <section className="workbench-controls" aria-labelledby="workbench-controls-heading">
          <h2 id="workbench-controls-heading">Điều khiển fixture</h2>
          <div className="workbench-control-grid">
            <div>
              <label htmlFor="workbench-fixture"><span>Fixture</span></label>
              <select
                id="workbench-fixture"
                value={snapshot.fixtureId}
                disabled={busy}
                onChange={(event) => {
                  if (isWorkbenchFixtureId(event.target.value)) changeFixture(event.target.value);
                }}
              >
                {workbenchFixtures.map((fixture) => (
                  <option key={fixture.id} value={fixture.id}>{fixture.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="workbench-save-mode"><span>Kịch bản lưu trong bộ nhớ</span></label>
              <select
                id="workbench-save-mode"
                value={snapshot.saveMode}
                disabled={busy}
                onChange={(event) => changeSaveMode(event.target.value as WorkbenchSaveMode)}
              >
                <option value="success">Thành công ngay</option>
                <option value="hold">Giữ ở trạng thái đang lưu</option>
                <option value="failure">Báo lỗi, giữ snapshot trước</option>
              </select>
            </div>
          </div>

          <div className="workbench-command-controls">
            <Button
              disabled={busy || snapshot.state.clock.phase !== 'planning' || !firstAvailable}
              onClick={() => {
                if (firstAvailable) void context.actions.executeDay(firstAvailable.id);
              }}
            >Thực thi mẫu EXECUTE_DAY</Button>
            <Button
              disabled={busy || snapshot.state.clock.phase !== 'review'}
              onClick={() => { void context.actions.acknowledgeDay(); }}
            >Thực thi mẫu ACK_DAY</Button>
            <Button onClick={() => changeFixture(snapshot.fixtureId)}>Đặt lại fixture</Button>
          </div>

          {busy && (
            <div className="workbench-pending" role="status">
              <p>Lần lưu mẫu đang chờ; snapshot được hiển thị vẫn là bản trước.</p>
              <Button onClick={() => settlePending(true)}>Hoàn tất lần lưu đang chờ</Button>
              <Button onClick={() => settlePending(false)}>Làm lỗi lần lưu đang chờ</Button>
            </div>
          )}
          {snapshot.error && <p className="inline-error" role="alert">{snapshot.error}</p>}

          <dl className="workbench-status">
            <div><dt>Trạng thái UI</dt><dd><output data-testid="workbench-status">{snapshot.status}</output></dd></div>
            <div><dt>Phase</dt><dd data-testid="workbench-phase">{snapshot.state.clock.phase}</dd></div>
            <div><dt>Ngày</dt><dd data-testid="workbench-day">{snapshot.state.clock.day}</dd></div>
            <div><dt>Revision</dt><dd data-testid="workbench-revision">{snapshot.state.meta.revision}</dd></div>
            <div>
              <dt>Kiểm tra invariants</dt>
              <dd data-testid="workbench-invariants">{issues.length === 0 ? 'Hợp lệ' : `${issues.length} lỗi`}</dd>
            </div>
          </dl>
          {issues.length > 0 && <pre className="workbench-errors">{issues.join('\n')}</pre>}
        </section>

        <section className="workbench-mount" aria-labelledby="workbench-ui-heading">
          <h2 id="workbench-ui-heading">Điểm gắn giao diện ngày</h2>
          {snapshot.state.clock.phase === 'planning' ? (
            slots.activityPanel ? slots.activityPanel(context) : (
              <div className="workbench-slot" data-testid="activity-panel-slot">
                <h3>ActivityPanel</h3>
                <p>Chưa gắn component. Job UI nhận activityOptions, status, error và actions qua slot.</p>
                <pre>{JSON.stringify(context.activityOptions, null, 2)}</pre>
              </div>
            )
          ) : snapshot.state.clock.phase === 'review' ? (
            slots.dayReview ? slots.dayReview(context) : (
              <div className="workbench-slot" data-testid="day-review-slot">
                <h3>DayReview</h3>
                <p>Chưa gắn component. Job UI đọc turn.summary và dùng actions.acknowledgeDay.</p>
                <pre>{JSON.stringify(snapshot.state.turn.summary, null, 2)}</pre>
              </div>
            )
          ) : (
            <div className="workbench-slot" data-testid="pending-event-slot">
              <h3>Sự kiện đang chờ</h3>
              <p>Fixture này dành để kiểm tra giao diện không cho thực hiện hoặc xác nhận ngày khi còn sự kiện.</p>
              <pre>{JSON.stringify(snapshot.state.turn.eventQueue, null, 2)}</pre>
            </div>
          )}
        </section>

        <section className="workbench-anchor" aria-label="Dashboard dùng làm tham chiếu giao diện">
          <GameDashboard state={snapshot.state} />
        </section>

        <details className="workbench-state-inspector">
          <summary>Snapshot fixture hiện tại</summary>
          <pre data-testid="workbench-state">{JSON.stringify(snapshot.state, null, 2)}</pre>
        </details>
      </main>
    </div>
  );
}
