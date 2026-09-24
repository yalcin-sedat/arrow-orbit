import { PlayerAvatarId } from '../utils/storage';

export type PlayerAvatarOption = {
  accent: string;
  id: PlayerAvatarId;
  label: string;
  mark: string;
};

export const PLAYER_AVATARS: PlayerAvatarOption[] = [
  { accent: '#00d4ff', id: 'nova', label: 'Nova', mark: 'N' },
  { accent: '#ffd84a', id: 'bolt', label: 'Bolt', mark: 'B' },
  { accent: '#00e87a', id: 'pulse', label: 'Pulse', mark: 'P' },
  { accent: '#ff7a00', id: 'flare', label: 'Flare', mark: 'F' },
  { accent: '#aa66ff', id: 'comet', label: 'Comet', mark: 'C' },
  { accent: '#e8e8e8', id: 'void', label: 'Void', mark: 'V' },
];

export function getPlayerAvatarOption(avatarId: PlayerAvatarId): PlayerAvatarOption {
  return PLAYER_AVATARS.find((avatar) => avatar.id === avatarId) ?? PLAYER_AVATARS[0];
}
