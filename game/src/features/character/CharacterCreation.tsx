import { useId, useState, type FormEvent } from 'react';
import { contentRegistry } from '../../content/registry';
import type { CharacterConfig } from '../../domain/model/character';
import { Avatar } from '../../shared/ui/Avatar';
import { Button } from '../../shared/ui/Button';

interface CharacterCreationProps {
  isSaving: boolean;
  error: string | null;
  onSubmit: (config: CharacterConfig) => Promise<void>;
}

const avatarChoices: ReadonlyArray<{ id: CharacterConfig['avatarId']; name: string }> = [
  { id: 'traveler-1', name: 'Áo xanh rêu' },
  { id: 'traveler-2', name: 'Áo đỏ gạch' },
  { id: 'traveler-3', name: 'Áo xanh trời' },
];

export function CharacterCreation({ isSaving, error, onSubmit }: CharacterCreationProps) {
  const nameId = useId();
  const nameErrorId = useId();
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState<CharacterConfig['avatarId']>('traveler-1');
  const [backgroundId, setBackgroundId] = useState<CharacterConfig['backgroundId']>('ordinary');
  const [goalId, setGoalId] = useState<CharacterConfig['goalId']>('family');
  const [nameError, setNameError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError('Hãy viết tên nhân vật của bạn.');
      return;
    }

    setNameError(null);
    void onSubmit({ name: trimmedName, avatarId, backgroundId, goalId });
  }

  return (
    <div className="creation-layout">
      <aside className="introduction">
        <p className="eyebrow">Chương 01 · Ngày đầu nơi đất khách</p>
        <h1>Một chiếc vali.<br />Một khởi đầu mới.</h1>
        <p className="introduction__lead">
          Rời một nơi thân quen để bắt đầu cuộc sống ở Nhật Bản.
          Bạn mang theo điều gì, và muốn viết nên hành trình ra sao?
        </p>
        <div className="journey-note">
          <span className="journey-note__number" aria-hidden="true">01</span>
          <div>
            <strong>Trang đầu của bạn</strong>
            <p>Chọn một khởi đầu và một điều để hướng tới. Câu chuyện sẽ mang dấu ấn của riêng bạn.</p>
          </div>
        </div>
        <p className="introduction__caption">Không chỉ là đích đến, mà còn là những ngày bạn đã sống.</p>
      </aside>

      <section className="paper-card character-card" aria-labelledby="character-heading">
        <div className="card-heading">
          <p className="eyebrow">Trước khi lên đường</p>
          <h2 id="character-heading">Bạn là ai?</h2>
        </div>

        <form className="character-form" onSubmit={handleSubmit}>
          <fieldset disabled={isSaving} className="form-fields">
            <legend className="sr-only">Thông tin nhân vật</legend>

            <div className="field-group">
              <label className="field-label" htmlFor={nameId}>Tên của bạn</label>
              <input
                id={nameId}
                name="character-name"
                autoComplete="nickname"
                placeholder="Tên mà mọi người sẽ gọi bạn"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (nameError) setNameError(null);
                }}
                maxLength={40}
                required
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? nameErrorId : undefined}
              />
              {nameError && <p id={nameErrorId} className="field-error" role="alert">{nameError}</p>}
            </div>

            <fieldset className="field-group">
              <legend className="field-label">Chọn hình đại diện</legend>
              <div className="avatar-choices">
                {avatarChoices.map((avatar) => (
                  <label key={avatar.id} className="avatar-choice">
                    <input
                      className="sr-only"
                      type="radio"
                      name="avatar"
                      value={avatar.id}
                      checked={avatarId === avatar.id}
                      onChange={() => setAvatarId(avatar.id)}
                    />
                    <span className="avatar-choice__body">
                      <Avatar avatarId={avatar.id} />
                      <span>{avatar.name}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="field-group">
              <legend className="field-label">Điều đưa bạn tới Nhật</legend>
              <div className="option-list">
                {contentRegistry.backgrounds.map((background) => (
                  <label key={background.id} className="choice-option">
                    <input
                      type="radio"
                      name="background"
                      value={background.id}
                      checked={backgroundId === background.id}
                      onChange={() => setBackgroundId(background.id)}
                    />
                    <span>
                      <strong>{background.name}</strong>
                      <span className="choice-option__description">{background.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="field-group">
              <legend className="field-label">Mục tiêu của hành trình</legend>
              <div className="goal-choices">
                {contentRegistry.goals.map((goal) => (
                  <label key={goal.id} className="goal-choice">
                    <input
                      type="radio"
                      name="goal"
                      value={goal.id}
                      checked={goalId === goal.id}
                      onChange={() => setGoalId(goal.id)}
                    />
                    <span>{goal.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </fieldset>

          {error && <p className="inline-error" role="alert">{error}</p>}

          <div className="form-footer">
            <p>Tiến trình được lưu trên thiết bị này.</p>
            <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
              {isSaving ? 'Đang mở nhật ký…' : 'Bắt đầu hành trình'}
              {!isSaving && <span aria-hidden="true">→</span>}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
