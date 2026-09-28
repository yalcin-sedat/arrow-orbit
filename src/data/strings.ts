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
  comingSoon:   'Coming soon.',
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
  haptics:      'Haptics',
  reducedMotion:'Reduced Motion',
  screenFlash:  'Screen Flash',
  privacy:      'Privacy',
  terms:        'Terms',
  restore:      'Restore',

  // Home menu — share / rate
  shareMessage: "I'm playing Arrow Orbit. Try it too!",

  // Scoreboard
  globalRanking:  'GLOBAL RANKING',
  bestRun:        'BEST RUN',
  yourBest:       'YOUR BEST',
  emptySlot:      'EMPTY',
  topTenTitle:    'TOP 10 PLAYERS',
  globalTag:      'GLOBAL',
  youFallback:    'YOU',

  // Profile setup
  profileCardTag:        'PLAYER CARD',
  chooseOrbitTitle:      'Choose your orbit',
  chooseOrbitSubtitle:   'Pick an avatar and a short player name.',
  editOrbitTitle:        'Edit your orbit',
  editOrbitSubtitle:     'Update your avatar and player name.',
  selectedTag:           'SELECTED',
  playerNameLabel:       'PLAYER NAME',
  playerNamePlaceholder: 'ORBIT ACE',
  playerNameHelper:      '3-14 characters. You can change it later.',
  continueLabel:         'CONTINUE',
  saveLabel:             'SAVE',

  // Game over screen
  trainingRunTag:    'TRAINING RUN',
  newRecordBadge:    '⭐ NEW RECORD ⭐',
  trainingScoreLabel: '» TRAINING SCORE «',
  finalScoreLabel:    '» FINAL SCORE «',
  mistakesLabel:      'MISTAKES',
  savedLabel:         'SAVED',
  savedNo:            'NO',
  reachedLevel:       (n: number) => `REACHED LEVEL ${n}`,
  playAgainDeco:      '» PLAY AGAIN «',
  mainMenuDeco:       '« MAIN MENU »',

  // Game over — reward ad placeholder overlay
  adBadge:            'AD',
  adPlayingLabel:     'Playing ad...',
  protectStreakTitle: 'PROTECT YOUR STREAK',
  bonusChanceTitle:   'BONUS CHANCE',
  protectStreakBody:  (levels: number) => `Watch a short ad to protect your\nlast ${levels} ${levels === 1 ? 'level' : 'levels'}.`,
  bonusChanceBody:    'Watch a short ad before continuing.',
  watchAdProtect:     'WATCH AD — PROTECT',
  watchAd:            'WATCH AD',
  skipRiskLosing:     (levels: number) => `SKIP — RISK LOSING ${levels} ${levels === 1 ? 'LEVEL' : 'LEVELS'}`,
  skip:               'SKIP',

  // Settings — delete my data
  deleteMyData:     'Delete My Data',
  deleteDataTitle:  'Delete My Data',
  deleteDataMessage: 'Your scores, progress and profile will be deleted from this device and the cloud. This cannot be undone.',
  deleteLabel:      'Delete',
  cancelLabel:      'Cancel',
  deleteDataError:  'Could not delete your data. Please try again.',
};
