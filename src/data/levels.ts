// Level tanımları — collisionToleranceDeg büyüdükçe çarpışma alanı büyür, yani oyun zorlaşır.

export type RotationDirection = 'clockwise' | 'counterClockwise';
export type SpeedPattern =
  | 'constant'
  | 'accelerating'
  | 'stopAndGo'
  | 'switchDirection'
  | 'fakeReverse'
  | 'glitch';

export type LevelArchetype =
  | 'breath'
  | 'tempo'
  | 'sniper'
  | 'ambush'
  | 'metronome'
  | 'reverse'
  | 'avalanche'
  | 'chaos'
  | 'corridor'
  | 'trap'
  | 'boss'
  | 'prestige';

export type LevelTheme = 'classic' | 'aqua' | 'violet' | 'ember' | 'gold' | 'void';

export type SpecialObjectType = 'heart' | 'star';

export type SpecialObjectConfig = {
  type: SpecialObjectType;
  angle: number;
};

export type LevelConfig = {
  id: number;
  requiredPins: number;
  rotationDuration: number;
  direction: RotationDirection;
  collisionToleranceDeg: number;
  initialPins: number[];
  speedPattern: SpeedPattern;
  archetype: LevelArchetype;
  theme: LevelTheme;
  specialObjects?: SpecialObjectConfig[];
};

export const LEVELS: LevelConfig[] = [
  // 1-8: öğrenme ve ritim
  { id: 1,  requiredPins: 10, rotationDuration: 5000, direction: 'clockwise',        collisionToleranceDeg: 7,  initialPins: [],                          speedPattern: 'constant',        archetype: 'breath',    theme: 'classic', specialObjects: [{ type: 'star', angle: 130 }] },
  { id: 2,  requiredPins: 10, rotationDuration: 4700, direction: 'clockwise',        collisionToleranceDeg: 7,  initialPins: [],                          speedPattern: 'constant',        archetype: 'breath',    theme: 'classic', specialObjects: [{ type: 'star', angle: 130 }] },
  { id: 3,  requiredPins: 10, rotationDuration: 4400, direction: 'counterClockwise', collisionToleranceDeg: 8,  initialPins: [],                          speedPattern: 'constant',        archetype: 'reverse',   theme: 'classic', specialObjects: [{ type: 'star', angle: 130 }] },
  { id: 4,  requiredPins: 10, rotationDuration: 4100, direction: 'clockwise',        collisionToleranceDeg: 8,  initialPins: [90],                        speedPattern: 'constant',        archetype: 'tempo',     theme: 'classic', specialObjects: [{ type: 'star', angle: 220 }] },
  { id: 5,  requiredPins: 11, rotationDuration: 3900, direction: 'clockwise',        collisionToleranceDeg: 8,  initialPins: [0, 180],                    speedPattern: 'constant',        archetype: 'tempo',     theme: 'aqua',    specialObjects: [{ type: 'star', angle: 90 }, { type: 'star', angle: 210 }, { type: 'star', angle: 330 }] },
  { id: 6,  requiredPins: 11, rotationDuration: 3700, direction: 'counterClockwise', collisionToleranceDeg: 9,  initialPins: [60, 240],                   speedPattern: 'constant',        archetype: 'reverse',   theme: 'aqua',    specialObjects: [{ type: 'star', angle: 150 }] },
  { id: 7,  requiredPins: 12, rotationDuration: 3500, direction: 'clockwise',        collisionToleranceDeg: 9,  initialPins: [30, 180],                   speedPattern: 'constant',        archetype: 'tempo',     theme: 'aqua',    specialObjects: [{ type: 'star', angle: 105 }] },
  { id: 8,  requiredPins: 12, rotationDuration: 3300, direction: 'clockwise',        collisionToleranceDeg: 10, initialPins: [45, 135, 270],              speedPattern: 'constant',        archetype: 'ambush',    theme: 'aqua',    specialObjects: [{ type: 'star', angle: 320 }] },

  // 9-15: ödül ve ilk özel hareketler
  { id: 9,  requiredPins: 11, rotationDuration: 3600, direction: 'clockwise',        collisionToleranceDeg: 9,  initialPins: [90, 250],                   speedPattern: 'constant',        archetype: 'tempo',     theme: 'aqua',    specialObjects: [{ type: 'heart', angle: 180 }, { type: 'star', angle: 330 }] },
  { id: 10, requiredPins: 13, rotationDuration: 3100, direction: 'counterClockwise', collisionToleranceDeg: 10, initialPins: [0, 90, 180],                speedPattern: 'constant',        archetype: 'boss',      theme: 'gold',    specialObjects: [{ type: 'star', angle: 270 }] },
  { id: 11, requiredPins: 10, rotationDuration: 4500, direction: 'clockwise',        collisionToleranceDeg: 11, initialPins: [60, 150, 240, 330],         speedPattern: 'constant',        archetype: 'sniper',    theme: 'violet',  specialObjects: [{ type: 'star', angle: 285 }] },
  { id: 12, requiredPins: 10, rotationDuration: 3000, direction: 'clockwise',        collisionToleranceDeg: 10, initialPins: [45, 225],                   speedPattern: 'constant',        archetype: 'tempo',     theme: 'violet',  specialObjects: [{ type: 'star', angle: 310 }] },
  { id: 13, requiredPins: 10, rotationDuration: 3000, direction: 'counterClockwise', collisionToleranceDeg: 11, initialPins: [0, 72, 144, 216, 288],      speedPattern: 'constant',        archetype: 'ambush',    theme: 'violet',  specialObjects: [{ type: 'star', angle: 252 }] },
  { id: 14, requiredPins: 10, rotationDuration: 3500, direction: 'clockwise',        collisionToleranceDeg: 10, initialPins: [90, 270],                   speedPattern: 'stopAndGo',       archetype: 'metronome', theme: 'violet',  specialObjects: [{ type: 'star', angle: 180 }] },
  { id: 15, requiredPins: 10, rotationDuration: 2700, direction: 'clockwise',        collisionToleranceDeg: 11, initialPins: [30, 150, 270],              speedPattern: 'accelerating',    archetype: 'boss',      theme: 'gold',    specialObjects: [{ type: 'star', angle: 90 }, { type: 'star', angle: 210 }, { type: 'star', angle: 330 }] },

  // 16-25: ters yön, hızlanma, koridor ve risk/ödül
  { id: 16, requiredPins: 10, rotationDuration: 3800, direction: 'counterClockwise', collisionToleranceDeg: 9,  initialPins: [],                          speedPattern: 'constant',        archetype: 'reverse',   theme: 'classic', specialObjects: [{ type: 'star', angle: 130 }] },
  { id: 17, requiredPins: 10, rotationDuration: 3500, direction: 'counterClockwise', collisionToleranceDeg: 10, initialPins: [0, 180],                    speedPattern: 'constant',        archetype: 'reverse',   theme: 'classic', specialObjects: [{ type: 'heart', angle: 270 }, { type: 'star', angle: 90 }] },
  { id: 18, requiredPins: 10, rotationDuration: 3200, direction: 'counterClockwise', collisionToleranceDeg: 10, initialPins: [60, 180, 300],              speedPattern: 'constant',        archetype: 'reverse',   theme: 'classic', specialObjects: [{ type: 'star', angle: 240 }] },
  { id: 19, requiredPins: 10, rotationDuration: 4000, direction: 'clockwise',        collisionToleranceDeg: 10, initialPins: [0, 120, 240],               speedPattern: 'accelerating',    archetype: 'avalanche', theme: 'ember',   specialObjects: [{ type: 'star', angle: 300 }] },
  { id: 20, requiredPins: 10, rotationDuration: 2900, direction: 'counterClockwise', collisionToleranceDeg: 11, initialPins: [45, 135, 225, 315],         speedPattern: 'constant',        archetype: 'boss',      theme: 'gold',    specialObjects: [{ type: 'star', angle: 90 }, { type: 'star', angle: 210 }, { type: 'star', angle: 330 }] },
  { id: 21, requiredPins: 4,  rotationDuration: 5000, direction: 'counterClockwise', collisionToleranceDeg: 12, initialPins: [40, 80, 160, 200, 280, 320],speedPattern: 'constant',        archetype: 'sniper',    theme: 'violet',  specialObjects: [{ type: 'star', angle: 120 }] },
  { id: 22, requiredPins: 8,  rotationDuration: 2700, direction: 'clockwise',        collisionToleranceDeg: 11, initialPins: [0, 72, 144, 216, 288],      speedPattern: 'constant',        archetype: 'ambush',    theme: 'violet',  specialObjects: [{ type: 'star', angle: 180 }] },
  { id: 23, requiredPins: 7,  rotationDuration: 3100, direction: 'counterClockwise', collisionToleranceDeg: 11, initialPins: [90, 180, 270],              speedPattern: 'stopAndGo',       archetype: 'metronome', theme: 'aqua',    specialObjects: [{ type: 'star', angle: 20 }] },
  { id: 24, requiredPins: 5,  rotationDuration: 2900, direction: 'clockwise',        collisionToleranceDeg: 12, initialPins: [10, 25, 190, 205, 330, 345],speedPattern: 'constant',        archetype: 'corridor',  theme: 'aqua',    specialObjects: [{ type: 'star', angle: 110 }] },
  { id: 25, requiredPins: 10, rotationDuration: 2300, direction: 'counterClockwise', collisionToleranceDeg: 12, initialPins: [45, 135, 225, 315],         speedPattern: 'accelerating',    archetype: 'boss',      theme: 'gold',    specialObjects: [{ type: 'heart', angle: 20 }, { type: 'star', angle: 90 }, { type: 'star', angle: 210 }, { type: 'star', angle: 330 }] },

  // 26-35: kaos, fake reverse, glitch ve baskı
  { id: 26, requiredPins: 6,  rotationDuration: 3100, direction: 'clockwise',        collisionToleranceDeg: 11, initialPins: [90, 270],                   speedPattern: 'switchDirection', archetype: 'chaos',     theme: 'ember',   specialObjects: [{ type: 'star', angle: 0 }] },
  { id: 27, requiredPins: 8,  rotationDuration: 2600, direction: 'clockwise',        collisionToleranceDeg: 12, initialPins: [30, 90, 150, 210, 270, 330],speedPattern: 'constant',        archetype: 'ambush',    theme: 'ember',   specialObjects: [{ type: 'star', angle: 60 }] },
  { id: 28, requiredPins: 7,  rotationDuration: 2600, direction: 'counterClockwise', collisionToleranceDeg: 12, initialPins: [0, 60, 120, 180, 240, 300], speedPattern: 'constant',        archetype: 'reverse',   theme: 'ember',   specialObjects: [{ type: 'star', angle: 330 }] },
  { id: 29, requiredPins: 8,  rotationDuration: 3600, direction: 'clockwise',        collisionToleranceDeg: 12, initialPins: [45, 135, 225],              speedPattern: 'accelerating',    archetype: 'avalanche', theme: 'ember',   specialObjects: [{ type: 'star', angle: 315 }] },
  { id: 30, requiredPins: 7,  rotationDuration: 2900, direction: 'clockwise',        collisionToleranceDeg: 12, initialPins: [60, 180, 300],              speedPattern: 'switchDirection', archetype: 'chaos',     theme: 'gold',    specialObjects: [{ type: 'heart', angle: 250 }, { type: 'star', angle: 0 }, { type: 'star', angle: 120 }, { type: 'star', angle: 210 }] },
  { id: 31, requiredPins: 8,  rotationDuration: 2400, direction: 'clockwise',        collisionToleranceDeg: 12, initialPins: [45, 90, 225, 270],          speedPattern: 'fakeReverse',     archetype: 'trap',      theme: 'void',    specialObjects: [{ type: 'star', angle: 157 }] },
  { id: 32, requiredPins: 5,  rotationDuration: 2700, direction: 'counterClockwise', collisionToleranceDeg: 12, initialPins: [5, 20, 125, 140, 245, 260, 355], speedPattern: 'constant',   archetype: 'corridor',  theme: 'void',    specialObjects: [{ type: 'star', angle: 192 }] },
  { id: 33, requiredPins: 8,  rotationDuration: 2200, direction: 'counterClockwise', collisionToleranceDeg: 12, initialPins: [30, 150, 270],              speedPattern: 'stopAndGo',       archetype: 'metronome', theme: 'void',    specialObjects: [{ type: 'star', angle: 80 }] },
  { id: 34, requiredPins: 4,  rotationDuration: 4200, direction: 'clockwise',        collisionToleranceDeg: 13, initialPins: [70, 110, 175, 215, 280, 320],speedPattern: 'constant',       archetype: 'sniper',    theme: 'void',    specialObjects: [{ type: 'heart', angle: 35 }, { type: 'star', angle: 142 }] },
  { id: 35, requiredPins: 10, rotationDuration: 2100, direction: 'counterClockwise', collisionToleranceDeg: 13, initialPins: [30, 90, 150, 210, 270, 330],speedPattern: 'glitch',          archetype: 'boss',      theme: 'gold',    specialObjects: [{ type: 'heart', angle: 0 }, { type: 'star', angle: 60 }, { type: 'star', angle: 180 }, { type: 'star', angle: 300 }] },

  // 36-45: final adil zorluk
  { id: 36, requiredPins: 9,  rotationDuration: 1900, direction: 'clockwise',        collisionToleranceDeg: 13, initialPins: [0, 60, 120, 180, 240, 300], speedPattern: 'accelerating',    archetype: 'avalanche', theme: 'ember',   specialObjects: [{ type: 'star', angle: 150 }] },
  { id: 37, requiredPins: 7,  rotationDuration: 2600, direction: 'clockwise',        collisionToleranceDeg: 13, initialPins: [45, 135, 225, 315],         speedPattern: 'switchDirection', archetype: 'chaos',     theme: 'ember',   specialObjects: [{ type: 'star', angle: 180 }] },
  { id: 38, requiredPins: 6,  rotationDuration: 2300, direction: 'counterClockwise', collisionToleranceDeg: 13, initialPins: [5, 20, 35, 185, 200, 215, 350], speedPattern: 'constant',    archetype: 'corridor',  theme: 'void',    specialObjects: [{ type: 'star', angle: 110 }] },
  { id: 39, requiredPins: 9,  rotationDuration: 1900, direction: 'counterClockwise', collisionToleranceDeg: 13, initialPins: [30, 60, 150, 180, 270, 300], speedPattern: 'accelerating',   archetype: 'avalanche', theme: 'void',    specialObjects: [{ type: 'heart', angle: 110 }, { type: 'star', angle: 225 }] },
  { id: 40, requiredPins: 11, rotationDuration: 1900, direction: 'clockwise',        collisionToleranceDeg: 14, initialPins: [30, 90, 150, 210, 270, 330],speedPattern: 'switchDirection', archetype: 'boss',      theme: 'gold',    specialObjects: [{ type: 'heart', angle: 0 }, { type: 'star', angle: 60 }, { type: 'star', angle: 180 }, { type: 'star', angle: 300 }] },
  { id: 41, requiredPins: 7,  rotationDuration: 2100, direction: 'counterClockwise', collisionToleranceDeg: 14, initialPins: [20, 75, 130, 200, 255, 310],speedPattern: 'fakeReverse',     archetype: 'trap',      theme: 'void',    specialObjects: [{ type: 'star', angle: 165 }] },
  { id: 42, requiredPins: 8,  rotationDuration: 2000, direction: 'clockwise',        collisionToleranceDeg: 14, initialPins: [0, 45, 120, 165, 240, 285], speedPattern: 'glitch',          archetype: 'trap',      theme: 'void',    specialObjects: [{ type: 'star', angle: 330 }] },
  { id: 43, requiredPins: 5,  rotationDuration: 4300, direction: 'counterClockwise', collisionToleranceDeg: 14, initialPins: [30, 70, 150, 190, 270, 310],speedPattern: 'constant',        archetype: 'sniper',    theme: 'violet',  specialObjects: [{ type: 'star', angle: 230 }] },
  { id: 44, requiredPins: 9,  rotationDuration: 1800, direction: 'clockwise',        collisionToleranceDeg: 14, initialPins: [0, 40, 80, 160, 200, 280, 320], speedPattern: 'switchDirection', archetype: 'chaos',  theme: 'ember',   specialObjects: [{ type: 'heart', angle: 120 }, { type: 'star', angle: 240 }] },
  { id: 45, requiredPins: 8,  rotationDuration: 1800, direction: 'counterClockwise', collisionToleranceDeg: 15, initialPins: [15, 55, 95, 135, 195, 235, 275, 315], speedPattern: 'glitch', archetype: 'boss',     theme: 'gold',    specialObjects: [{ type: 'heart', angle: 345 }, { type: 'star', angle: 75 }, { type: 'star', angle: 165 }, { type: 'star', angle: 255 }] },

  // 46-50: prestige / neredeyse imkansız
  // requiredPins (AUDIT 2.8/2.4/2.5): kapasite = ceil(gap/tol) - 2 formülüyle her levelde en az 2 ok marj kalacak şekilde düşürüldü.
  { id: 46, requiredPins: 8,  rotationDuration: 1500, direction: 'clockwise',        collisionToleranceDeg: 15, initialPins: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324], speedPattern: 'switchDirection', archetype: 'prestige', theme: 'void',  specialObjects: [{ type: 'star', angle: 198 }] },
  { id: 47, requiredPins: 8,  rotationDuration: 1400, direction: 'counterClockwise', collisionToleranceDeg: 15, initialPins: [20, 56, 92, 128, 164, 200, 236, 272, 308, 344], speedPattern: 'glitch',         archetype: 'prestige', theme: 'void',  specialObjects: [{ type: 'star', angle: 2 }] },
  { id: 48, requiredPins: 6,  rotationDuration: 1350, direction: 'clockwise',        collisionToleranceDeg: 15, initialPins: [0, 45, 90, 135, 180, 225, 270, 315], speedPattern: 'fakeReverse',    archetype: 'prestige', theme: 'void',  specialObjects: [{ type: 'heart', angle: 22 }, { type: 'star', angle: 112 }] },
  { id: 49, requiredPins: 6,  rotationDuration: 1250, direction: 'counterClockwise', collisionToleranceDeg: 16, initialPins: [30, 75, 120, 165, 210, 255, 300, 345], speedPattern: 'glitch',         archetype: 'prestige', theme: 'void',  specialObjects: [{ type: 'star', angle: 187 }] },
  { id: 50, requiredPins: 8,  rotationDuration: 1150, direction: 'clockwise',        collisionToleranceDeg: 16, initialPins: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324], speedPattern: 'glitch',         archetype: 'prestige', theme: 'gold',  specialObjects: [{ type: 'heart', angle: 18 }, { type: 'star', angle: 54 }, { type: 'star', angle: 162 }, { type: 'star', angle: 270 }] },
];
