// Oyun mantığı — saf fonksiyonlar, test edilebilir, state tutmaz.
// Yeni çekirdek: dönen hedefe pin saplama ve pinler arası açı çarpışması.

export type GameState = {
  score: number;
  streak: number;
  placedPins: number[];
  remainingPins: number;
  lives: number;
};

export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function angleDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, 360 - diff);
}

// Pin alttan geldiği için dünya uzayındaki temas noktası 180 derecedir.
// Hedef R derece dönmüşse, hedefin lokal temas açısı (180 - R) olur.
export function getImpactAngle(rotation: number): number {
  return normalizeAngle(180 - rotation);
}

export function willCollideWithPins(
  impactAngle: number,
  placedPins: number[],
  toleranceDeg: number,
): boolean {
  return placedPins.some((pinAngle) => angleDistance(impactAngle, pinAngle) <= toleranceDeg);
}

export function addPin(placedPins: number[], impactAngle: number): number[] {
  return [...placedPins, normalizeAngle(impactAngle)];
}

export function isLevelComplete(placedPins: number[], requiredPins: number): boolean {
  return placedPins.length >= requiredPins;
}

export function createLevelState(requiredPins: number, initialPins: number[] = []): GameState {
  return {
    score: 0,
    streak: 0,
    placedPins: initialPins.map(normalizeAngle),
    remainingPins: requiredPins,
    lives: 1,
  };
}

export function applySafeHit(state: GameState, impactAngle: number): GameState {
  return {
    score: state.score + 1,
    streak: state.streak + 1,
    placedPins: addPin(state.placedPins, impactAngle),
    remainingPins: Math.max(0, state.remainingPins - 1),
    lives: state.lives,
  };
}
