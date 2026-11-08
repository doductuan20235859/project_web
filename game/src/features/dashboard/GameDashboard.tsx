import { selectBackgroundLabel, selectGoalLabel, selectJapaneseLevel } from '../../application/selectors';
import { contentRegistry } from '../../content/registry';
import type { GameState } from '../../domain/model/game-state';
import { Avatar } from '../../shared/ui/Avatar';
import { Money } from '../../shared/ui/Money';
import { StatBar } from '../../shared/ui/StatBar';

export function GameDashboard({ state }: { state: GameState }) {
  const goal = contentRegistry.goals.find((item) => item.id === state.character.goalId);

  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Chương 01 · Ngày {state.clock.day} / 30</p>
          <h1>Chào {state.character.name},<br />hành trình đã bắt đầu.</h1>
        </div>
        <span className="save-indicator"><span aria-hidden="true" />Đã lưu trên thiết bị</span>
      </div>

      <div className="dashboard-grid">
        <section className="paper-card profile-card" aria-labelledby="profile-heading">
          <Avatar avatarId={state.character.avatarId} large />
          <p className="eyebrow">Trang nhật ký đầu tiên</p>
          <h2 id="profile-heading">{state.character.name}</h2>
          <p className="muted">{selectBackgroundLabel(state, contentRegistry)}</p>
          <div className="profile-goal">
            <span className="eyebrow">Điều bạn hướng tới</span>
            <strong>{selectGoalLabel(state, contentRegistry)}</strong>
            <p>{goal?.description}</p>
          </div>
        </section>

        <div className="dashboard-main">
          <section className="paper-card" aria-labelledby="finance-heading">
            <div className="section-heading">
              <h2 id="finance-heading">Hành trang tài chính</h2>
              <span className="small-label">Đơn vị: JPY</span>
            </div>
            <div className="finance-grid">
              <div className="finance-item finance-item--primary">
                <span>Tiền đang có</span>
                <strong><Money amount={state.economy.cash} /></strong>
              </div>
              <div className="finance-item">
                <span>Lương chờ nhận</span>
                <strong><Money amount={state.economy.unpaidWages} /></strong>
              </div>
              <div className="finance-item">
                <span>Khoản chưa thanh toán</span>
                <strong><Money amount={state.economy.unpaidEssentialCosts} /></strong>
              </div>
            </div>
          </section>

          <section className="paper-card" aria-labelledby="wellbeing-heading">
            <div className="section-heading">
              <h2 id="wellbeing-heading">Bạn hôm nay</h2>
              <span className="small-label">Lắng nghe bản thân</span>
            </div>
            <div className="wellbeing-grid">
              <StatBar label="Thể lực" value={state.character.energy} />
              <StatBar label="Sức khỏe" value={state.character.health} tone="blue" />
              <StatBar label="Căng thẳng" value={state.character.stress} tone="rose" />
            </div>
            <div className="skill-row">
              <span>Năng lực tiếng Nhật<br /><span className="small-label">{selectJapaneseLevel(state)}</span></span>
              <strong>{state.character.japaneseXp} <span className="muted">XP</span></strong>
            </div>
          </section>

          <section className="paper-card" aria-labelledby="relationships-heading">
            <div className="section-heading">
              <h2 id="relationships-heading">Những người bên bạn</h2>
            </div>
            <ul className="relationship-list">
              {contentRegistry.npcs.map((npc) => (
                <li key={npc.id}>
                  <span className="relationship-initial" aria-hidden="true">{npc.name.charAt(0)}</span>
                  <span className="relationship-name">{npc.name}</span>
                  <strong>{state.relationships[npc.id]}<span className="muted"> / 100</span></strong>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
