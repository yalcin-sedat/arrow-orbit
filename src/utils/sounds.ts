// Ses efekti yöneticisi — expo-audio tabanlı, lazy yükleme + önbellekleme
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

type SoundName = 'tap' | 'launch' | 'correct' | 'wrong' | 'gameover' | 'button' | 'levelup' | 'heart' | 'bonus' | 'coin';

const SOUND_SOURCES: Record<SoundName, number> = {
  tap:      require('../../assets/sounds/whoosh-effect.mp3'),
  launch:   require('../../assets/sounds/whoosh-effect.mp3'),
  correct:  require('../../assets/sounds/impact-sound.mp3'),
  wrong:    require('../../assets/sounds/crash.mp3'),
  gameover: require('../../assets/sounds/game-over.mp3'),
  button:   require('../../assets/sounds/click.mp3'),
  levelup:  require('../../assets/sounds/great-success.mp3'),
  heart:    require('../../assets/sounds/heart.mp3'),
  bonus:    require('../../assets/sounds/bonus-points.mp3'),
  coin:     require('../../assets/sounds/coin.mp3'),
};

const VOLUMES: Record<SoundName, number> = {
  tap:      0.6,
  launch:   0.7,
  correct:  1.0,
  wrong:    0.85,
  gameover: 1.0,
  button:   0.7,
  levelup:  1.0,
  heart:    1.0,
  bonus:    0.9,
  coin:     1.0,
};

const cache: Partial<Record<SoundName, AudioPlayer>> = {};
let sfxEnabled = true;

let modeSet = false;
async function ensureAudioMode() {
  if (modeSet) return;
  modeSet = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch {}
}

async function play(name: SoundName): Promise<void> {
  if (!sfxEnabled) return;
  try {
    await ensureAudioMode();
    if (!cache[name]) {
      const player = createAudioPlayer(SOUND_SOURCES[name]);
      player.volume = VOLUMES[name];
      cache[name] = player;
    }
    const player = cache[name]!;
    await player.seekTo(0);
    player.volume = VOLUMES[name];
    player.play();
  } catch {}
}

// --- Pool sistemi: correct + wrong ard arda çalınabilsin ---

const POOL_SIZE = 3;
const pool: Partial<Record<SoundName, { players: AudioPlayer[]; index: number }>> = {};

async function playPooled(name: SoundName): Promise<void> {
  if (!sfxEnabled) return;
  try {
    await ensureAudioMode();
    if (!pool[name]) {
      const players: AudioPlayer[] = [];
      for (let i = 0; i < POOL_SIZE; i++) {
        const p = createAudioPlayer(SOUND_SOURCES[name]);
        p.volume = VOLUMES[name];
        players.push(p);
      }
      pool[name] = { players, index: 0 };
    }
    const entry = pool[name]!;
    const player = entry.players[entry.index];
    entry.index = (entry.index + 1) % POOL_SIZE;
    // A freshly created local player already starts at zero. Seeking before it
    // finishes loading can reject and silently prevent the first playback.
    if (player.currentTime > 0) {
      await player.seekTo(0);
    }
    player.volume = VOLUMES[name];
    player.play();
  } catch {}
}

export const sounds = {
  tap:      () => play('tap'),
  launch:   () => play('launch'),
  correct:  () => playPooled('correct'),
  wrong:    () => playPooled('wrong'),
  gameover: () => play('gameover'),
  button:   () => play('button'),
  levelup:  () => play('levelup'),
  heart:    () => play('heart'),
  bonus:    () => play('bonus'),
  coin:     () => playPooled('coin'),
  isEnabled:        () => sfxEnabled,
  setEnabled:       (v: boolean) => { sfxEnabled = v; },
};
