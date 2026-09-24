// All UI strings — single source for future i18n
export const strings = {
  // In-game
  dogruIsabet:  'Perfect Hit!',
  pinSaplandi:  'Pin Stuck!',
  carpisma:     'Collision!',
  kalanPin:     'Pins Left',
  puan:         'Score',
  can:          'Lives',
  seviye:       'Level',
  yaniyorsun:   'On Fire! 🔥',
  combo:        (n: number) => `${n} Combo!`,
  tapToThrow:   'Tap to throw!',

  // Navigation / general
  tekrarOyna:   'Play Again',
  oyunBitti:    'GAME OVER',
  anaMenue:     'Main Menu',
  finalSkor:    'Final Score',

  // Level
  levelAtladi:  (n: number) => `LEVEL ${n}`,
  levelLabel:   (n: number) => `LEVEL ${n}`,
  levelLabelPrefix: 'LEVEL',
  yeniRekor:    'NEW RECORD!',
  enYuksek:     (n: number) => `Best: ${n}`,

  // Home menu
  oyna:         'PLAY',
  ayarlar:      'Settings',
  yakinda:      'Coming soon.',
  brandKicker:  'TAP. TIME. STRIKE.',
  brandTitle:   'ARROW ORBIT',
  levelsTitle:  'LEVELS',
  leaderboardTitle: 'SCOREBOARD',
  back:         'BACK',
  locked:       'LOCKED',
  topScore:     'Top Score',
  bestLevel:    'Best Level',
  removeAds:    'Remove Ads',
  sound:        'Sound',
  vibration:    'Vibration',
  leftHand:     'Left Hand',
  music:        'Music',
  haptics:      'Haptics',
  reducedMotion:'Reduced Motion',
  screenFlash:  'Screen Flash',
  privacy:      'Privacy',
  terms:        'Terms',
  restore:      'Restore',
};
