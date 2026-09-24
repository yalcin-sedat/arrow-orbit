// Neon arcade renk paleti — tüm renk sabitleri buradan alınır
export const colors = {
  // Arkaplan
  background:    '#0d0d1a',
  surface:       '#1a1a2e',
  surfaceLight:  '#16213e',

  // Neon aksanlar
  neonBlue:      '#00d4ff',
  neonGreen:     '#00ff88',
  neonPurple:    '#bf5fff',
  neonGold:      '#FFD700',
  neonRed:       '#ff3355',
  neonOrange:    '#ff8c00',

  // Metin
  white:         '#ffffff',
  textMuted:     'rgba(255,255,255,0.4)',
  textDim:       'rgba(255,255,255,0.7)',

  // Çark
  wheelStroke:   '#0d0d1a',
  wheelCenter:   '#1a1a2e',

  // Geri bildirim
  correct:       'rgba(0,200,100,0.92)',
  correctBorder: 'rgba(0,255,136,0.5)',
  wrong:         'rgba(220,50,50,0.92)',
  wrongBorder:   'rgba(255,51,85,0.5)',

  // Kalpler
  heartFull:     '#ff3355',
  heartEmpty:    'rgba(255,255,255,0.2)',
} as const;

export const zoneColors = {
  learning:   { primary: '#00C8FF', accent: '#0A1A2F' },
  reward:     { primary: '#00E87A', accent: '#FFD700' },
  risk:       { primary: '#FF7A00', accent: '#FF3300' },
  chaos:      { primary: '#AA00FF', accent: '#FF0055' },
  final:      { primary: '#E8E8E8', accent: '#C0C0C0' },
  prestige:   { primary: '#0A0A0A', accent: '#FFD700' },
} as const;

export const feedbackColors = {
  fail:          '#FF2020',
  hitSpark:      '#FFFFFF',
  levelComplete: '#FFD700',
  bossComplete:  '#00C8FF',
  heartPickup:   '#00E87A',
} as const;

export type VisualZone = keyof typeof zoneColors;

export function getVisualZone(levelId: number): VisualZone {
  if (levelId <= 8) return 'learning';
  if (levelId <= 15) return 'reward';
  if (levelId <= 25) return 'risk';
  if (levelId <= 35) return 'chaos';
  if (levelId <= 45) return 'final';
  return 'prestige';
}
