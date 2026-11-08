import type { CharacterConfig } from '../../domain/model/character';

interface AvatarProps {
  avatarId: CharacterConfig['avatarId'];
  large?: boolean;
}

export function Avatar({ avatarId, large = false }: AvatarProps) {
  return (
    <span
      className={`avatar avatar--${avatarId}${large ? ' avatar--large' : ''}`}
      aria-hidden="true"
    >
      <span className="avatar__hair" />
      <span className="avatar__face" />
      <span className="avatar__shirt" />
    </span>
  );
}
