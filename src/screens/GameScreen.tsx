// Çekirdek oyun ekranı — yeni pivot: dönen hedefe pin/ok saplama.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Path, Svg } from 'react-native-svg';
import { LEVELS, LevelConfig, SpecialObjectConfig } from '../data/levels';
import {
  angleDistance,
  applySafeHit,
  createLevelState,
  GameState,
  getImpactAngle,
  isLevelComplete,
  willCollideWithPins,
} from '../utils/gameLogic';
import { sounds } from '../utils/sounds';
import {
  DEFAULT_APP_SETTINGS,
  getAppSettings,
  saveHighScoreIfBetter,
} from '../utils/storage';
import Target from '../components/Target';
import Pin, { PIN_W, PIN_H } from '../components/Pin';
import HUD from '../components/HUD';
import ScreenFlash, { FlashType } from '../components/ScreenFlash';
import LevelTransitionOverlay from '../components/LevelTransitionOverlay';
import SpaceBackground from '../components/SpaceBackground';
import { strings } from '../data/strings';
import { getVisualZone } from '../theme/colors';
import PerfectEffect from '../components/PerfectEffect';

const { width, height } = Dimensions.get('window');

const TARGET_RADIUS = 115;
const TARGET_CX = width / 2;
const TARGET_CY = height * 0.38;
const HUD_HEART_X = width / 2;
const HUD_HEART_Y = 96;
const PIN_Y_REST = height * 0.78;
const PIN_TIP_DEPTH_INSIDE_TARGET = 22;
const PIN_CENTER_DISTANCE = TARGET_RADIUS + PIN_H / 2 - PIN_TIP_DEPTH_INSIDE_TARGET;
const PIN_Y_HIT = TARGET_CY + PIN_CENTER_DISTANCE;
const SPECIAL_OBJECT_TOLERANCE = 10;
const STARTING_LIVES = 1;
const MAX_LIVES = 1;
const STAR_BONUS_SCORE = 3;
const PERFECT_STREAK_COUNT = 5;

const STAR_SECTOR_COLORS = [
  '#00ff88',
  '#00d4ff',
  '#b455ff',
  '#ffd700',
  '#ff7a00',
  '#ff3366',
  '#00ff88',
  '#00d4ff',
  '#ffd700',
  '#ffffff',
] as const;

function getStarColor(levelId: number): string {
  const index = Math.floor((levelId - 1) / 5);
  return STAR_SECTOR_COLORS[index % STAR_SECTOR_COLORS.length];
}
const PERFECT_LEVEL_BONUS_SCORE = 5;


type Props = {
  initialLevelId?: number;
  initialScore?: number;
  onExit: () => void;
  onGoToLevels?: () => void;
  onLevelUnlocked?: (levelId: number) => void;
  onGameOver: (finalScore: number, isNewRecord: boolean, meta?: { isTraining: boolean; mistakes: number }) => void;
  onScoreChanged?: (score: number) => void;
  scoringEnabled?: boolean;
  trainingMaxLevelId?: number;
};

type ScoreFeedback = {
  color: string;
  id: number;
  text: string;
};

type HeartPickup = {
  id: number;
  startX: number;
  startY: number;
};

function buildLevelState(level: LevelConfig, previous?: GameState, initialScore = 0): GameState {
  return {
    ...createLevelState(level.requiredPins, level.initialPins),
    score: previous?.score ?? initialScore,
    streak: previous?.streak ?? 0,
    lives: previous?.lives ?? STARTING_LIVES,
  };
}

export default function GameScreen({
  initialLevelId = 1,
  initialScore = 0,
  onExit,
  onGoToLevels,
  onGameOver,
  onLevelUnlocked,
  onScoreChanged,
  scoringEnabled = true,
  trainingMaxLevelId,
}: Props) {
  const initialLevelIdx = Math.max(0, LEVELS.findIndex((level) => level.id === initialLevelId));
  const [levelIdx, setLevelIdx] = useState(initialLevelIdx);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [gameState, setGameState] = useState<GameState>(() => buildLevelState(LEVELS[initialLevelIdx], undefined, initialScore));
  const [flash, setFlash] = useState<FlashType>(null);
  const [pinLaunched, setPinLaunched] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);
  const [consumedSpecials, setConsumedSpecials] = useState<string[]>([]);
  const consumedSpecialsRef = useRef<Set<string>>(new Set());
  const [hasThrownOnce, setHasThrownOnce] = useState(false);
  const [trainingLimitReached, setTrainingLimitReached] = useState(false);
  const [trainingEndVisible, setTrainingEndVisible] = useState(false);
  const [perfectLevelId, setPerfectLevelId] = useState(initialLevelId);
  const [perfectTrigger, setPerfectTrigger] = useState(0);
  const [scoreFeedbacks, setScoreFeedbacks] = useState<ScoreFeedback[]>([]);
  const [heartPickups, setHeartPickups] = useState<HeartPickup[]>([]);
  const [transitionLevelId, setTransitionLevelId] = useState<number | null>(null);
  const [hapticsEnabled, setHapticsEnabled] = useState(DEFAULT_APP_SETTINGS.hapticsEnabled);
  const [screenFlashEnabled, setScreenFlashEnabled] = useState(DEFAULT_APP_SETTINGS.screenFlashEnabled);
  // Arka plandan dönüşte rotasyon effect'ini zorla yeniden tetiklemek için sayaç.
  // isLevelingUp=true iken arka plana geçilirse rotasyon effect'inin bağımlılıkları
  // (levelIdx, exitConfirmVisible vb.) hiç değişmeyebilir; bu sayaç değişerek
  // effect'i her durumda yeniden çalıştırır ve donmuş hedefi kurtarır.
  const [resumeToken, setResumeToken] = useState(0);

  const level = LEVELS[levelIdx];
  const visualZone = getVisualZone(level.id);
  const levelRef = useRef<LevelConfig>(level);
  const completedLevelScoreIds = useRef(new Set<number>());
  const gameStateRef = useRef(gameState);
  const levelStartScoreRef = useRef(initialScore);
  const lastReportedScoreRef = useRef(initialScore);
  const scoreFeedbackIdRef = useRef(0);
  const heartPickupIdRef = useRef(0);
  const trainingMistakesRef = useRef(0);
  const pinLaunchedRef = useRef(false);
  const throwIdRef = useRef(0);
  // Bu levelde çarpışma/can kaybı oldu mu — streak reset takibi için
  const levelLostLife = useRef(false);
  // AppState pause dalında rotasyon gerçekten donduruldu mu — active dönüşünde
  // sadece bu true ise resumeToken artırılır; aksi halde speedPattern'li
  // withSequence gereksiz yere baştan başlar.
  const wasPausedRef = useRef(false);

  const targetRotation = useSharedValue(0);
  const rotationRef = useRef(0);
  const pinY = useSharedValue(PIN_Y_REST);
  const trainingBannerOpacity = useSharedValue(0);
  const trainingEndOpacity = useSharedValue(0);
  const pinFallX = useSharedValue(0);
  const pinFallRotation = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const targetShakeY = useSharedValue(0);
  const targetCompleteScale = useSharedValue(1);
  const targetGlowOpacity = useSharedValue(0);
  const hudHeartScale = useSharedValue(1);

  useEffect(() => {
    if (scoringEnabled) return;
    trainingBannerOpacity.value = withSequence(
      withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
      withDelay(1800, withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) })),
    );
  }, [scoringEnabled]);

  const trainingBannerStyle = useAnimatedStyle(() => ({
    opacity: trainingBannerOpacity.value,
  }));

  useEffect(() => {
    if (!trainingLimitReached) return;
    setTrainingEndVisible(true);
    trainingEndOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) });
  }, [trainingLimitReached]);

  const trainingEndStyle = useAnimatedStyle(() => ({
    opacity: trainingEndOpacity.value,
  }));

  function handleDismissTrainingEnd() {
    trainingEndOpacity.value = withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) });
    setTimeout(() => {
      setTrainingEndVisible(false);
      onGoToLevels?.();
    }, 300);
  }

  useEffect(() => {
    let mounted = true;

    getAppSettings().then((settings) => {
      if (!mounted) return;
      setHapticsEnabled(settings.hapticsEnabled);
      setScreenFlashEnabled(settings.screenFlashEnabled);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Uygulama arka plana/inaktif duruma geçince oyunu duraklat:
  // hedef rotasyonunu dondur, uçmakta olan oku iptal edip atış hakkını
  // kullanıcıya geri ver (rotasyon donduğundan yarıda kalan atışı donmuş
  // açıya göre "çözmek" yerine iptal etmek daha güvenli ve adil).
  // Geri dönüşte mevcut exit-confirm overlay'i açılır; kullanıcı "Continue"
  // ile dokunarak devam eder (aynı UI, ekstra state gerekmez).
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        // Sadece gerçekten duraklatılmışsa (pause dalında cancelAnimation
        // çalıştıysa) rotasyon effect'ini zorla tetikle; aksi halde
        // withSequence içeren speedPattern'ler gereksiz yere baştan başlar.
        if (wasPausedRef.current) {
          wasPausedRef.current = false;
          // gameOver true iken (örn. finishGame'in async saveHighScoreIfBetter
          // beklerken) rotasyonu tekrar başlatma; ekran birazdan game-over'a geçecek.
          if (!gameOver) {
            setResumeToken((token) => token + 1);
          }
        }
        return;
      }
      if (nextState !== 'background' && nextState !== 'inactive') return;
      if (gameOver || exitConfirmVisible) return;

      if (pinLaunchedRef.current) {
        throwIdRef.current += 1;
        pinLaunchedRef.current = false;
        cancelAnimation(pinY);
        pinFallX.value = 0;
        pinFallRotation.value = 0;
        pinY.value = PIN_Y_REST;
        setPinLaunched(false);
      }

      wasPausedRef.current = true;
      cancelAnimation(targetRotation);
      if (!isLevelingUp) {
        setExitConfirmVisible(true);
      }
    });

    return () => subscription.remove();
  }, [gameOver, exitConfirmVisible, isLevelingUp, pinY, pinFallX, pinFallRotation, targetRotation]);

  useEffect(() => {
    levelRef.current = LEVELS[levelIdx];
    levelLostLife.current = false;
    consumedSpecialsRef.current = new Set();
    setConsumedSpecials([]);
    setHasThrownOnce(false);
    setGameState((previous) => buildLevelState(LEVELS[levelIdx], previous));
  }, [levelIdx]);

  useEffect(() => {
    // exitConfirmVisible true olduğunda (manuel çıkış veya arka plana geçiş
    // sonrası) rotasyon donar; false olduğunda (Continue) rotationRef.current
    // (donma anındaki açı) başlangıç kabul edilip animasyon aynı yönde devam eder —
    // böylece arka plandan dönüşte hedef sıçramaz, kaldığı yerden döner.
    if (exitConfirmVisible) {
      cancelAnimation(targetRotation);
      return undefined;
    }

    const directionMultiplier = level.direction === 'clockwise' ? 1 : -1;
    const duration = level.rotationDuration;
    cancelAnimation(targetRotation);
    const startAngle = rotationRef.current;
    targetRotation.value = startAngle;

    const spinTo = (degrees: number, ms = duration, easing = Easing.linear) => (
      withTiming(startAngle + degrees * directionMultiplier, { duration: ms, easing })
    );

    const animation =
      level.speedPattern === 'switchDirection'
        ? withSequence(
            spinTo(360, duration, Easing.inOut(Easing.sin)),
            withTiming(startAngle, { duration, easing: Easing.inOut(Easing.sin) }),
          )
      : level.speedPattern === 'accelerating'
        ? withSequence(
            spinTo(180, Math.round(duration * 0.72), Easing.in(Easing.quad)),
            spinTo(360, Math.round(duration * 0.48), Easing.out(Easing.quad)),
          )
      : level.speedPattern === 'stopAndGo'
        ? withSequence(
            spinTo(120, Math.round(duration * 0.38), Easing.out(Easing.quad)),
            withDelay(520, spinTo(240, Math.round(duration * 0.32), Easing.out(Easing.quad))),
            withDelay(420, spinTo(360, Math.round(duration * 0.3), Easing.out(Easing.quad))),
          )
      : level.speedPattern === 'fakeReverse'
        ? withSequence(
            spinTo(135, Math.round(duration * 0.34), Easing.out(Easing.quad)),
            spinTo(95, 180, Easing.inOut(Easing.sin)),
            spinTo(360, Math.round(duration * 0.56), Easing.out(Easing.quad)),
          )
      : level.speedPattern === 'glitch'
        ? withSequence(
            spinTo(90, Math.round(duration * 0.18), Easing.linear),
            spinTo(70, 110, Easing.inOut(Easing.sin)),
            spinTo(210, Math.round(duration * 0.2), Easing.linear),
            withDelay(160, spinTo(360, Math.round(duration * 0.34), Easing.out(Easing.quad))),
          )
      : spinTo(360);

    targetRotation.value = withRepeat(animation, -1, false);

    return () => cancelAnimation(targetRotation);
  }, [exitConfirmVisible, levelIdx, level.direction, level.rotationDuration, level.speedPattern, resumeToken]);

  useEffect(() => {
    // NOT: Bu interval yalnızca görsel/kozmetik amaçlıdır (örn. kalp pickup
    // animasyonunun başlangıç ekran konumu). 16ms'lik JS thread polling'i
    // isabet/çarpışma kararı için KULLANILMAMALI — bayat değer döndürebilir.
    // Kesin isabet açısı `handleTap` içinde withTiming bitiş worklet'inde
    // UI thread'de okunup `resolveThrow`'a parametre olarak geçirilir.
    const interval = setInterval(() => {
      rotationRef.current = targetRotation.value % 360;
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const targetShakeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: targetShakeY.value },
      { scale: targetCompleteScale.value },
    ],
  }));

  const activePinStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: pinY.value - PIN_Y_REST },
      { translateX: pinFallX.value },
      { rotate: `${pinFallRotation.value}deg` },
    ],
  }));

  const rotatingPinsStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${targetRotation.value}deg` }],
  }));

  const targetGlowStyle = useAnimatedStyle(() => ({
    opacity: targetGlowOpacity.value,
    transform: [{ scale: 0.96 + targetGlowOpacity.value * 0.16 }],
  }));

  function triggerShake() {
    shakeX.value = withSequence(
      withTiming(-9, { duration: 55 }),
      withTiming(8, { duration: 55 }),
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 50 }),
      withTiming(-2, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
  }

  function triggerHaptic(type: 'error' | 'success' | 'medium' | 'light') {
    if (!hapticsEnabled) return;

    if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    Haptics.impactAsync(
      type === 'medium'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light,
    );
  }

  function triggerFlash(type: FlashType) {
    if (!screenFlashEnabled) return;

    setFlash(type);
    setTimeout(() => setFlash(null), 350);
  }

  function finishGame(finalScore: number) {
    setGameOver(true);
    throwIdRef.current += 1;
    cancelAnimation(targetRotation);
    triggerHaptic('error');
    sounds.gameover();
    if (!scoringEnabled) {
      onGameOver(finalScore, false, {
        isTraining: true,
        mistakes: trainingMistakesRef.current,
      });
      return;
    }

    saveHighScoreIfBetter(finalScore).then((isNew) => {
      onGameOver(finalScore, isNew);
    });
  }

  function commitLevelScore(score: number) {
    if (!scoringEnabled) return;

    levelStartScoreRef.current = score;
    if (score <= lastReportedScoreRef.current) return;

    lastReportedScoreRef.current = score;
    onScoreChanged?.(score);
  }

  function handleLevelUp(nextIdx: number) {
    const nextLevelId = LEVELS[nextIdx].id;
    if (!scoringEnabled && trainingMaxLevelId !== undefined && nextLevelId >= trainingMaxLevelId) {
      setTrainingLimitReached(true);
      return;
    }
    if (scoringEnabled) {
      onLevelUnlocked?.(nextLevelId);
    }
    triggerHaptic('success');
    sounds.levelup();
    // Ok'u rest konumuna hazırla; overlay bitene kadar yeni atış kilitli kalır.
    pinFallX.value = 0;
    pinFallRotation.value = 0;
    pinY.value = height + 100;
    pinY.value = withTiming(PIN_Y_REST, { duration: 200, easing: Easing.out(Easing.cubic) });
    setTransitionLevelId(nextLevelId);
    setIsLevelingUp(true);
    setLevelIdx(nextIdx);
    targetCompleteScale.value = withSequence(
      withTiming(1.08, { duration: 160, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) }),
    );
    targetGlowOpacity.value = withSequence(
      withTiming(0.75, { duration: 120, easing: Easing.out(Easing.cubic) }),
      withDelay(320, withTiming(0, { duration: 240, easing: Easing.in(Easing.cubic) })),
    );
  }

  function handleLevelTransitionDone() {
    setIsLevelingUp(false);
    setTransitionLevelId(null);
    targetCompleteScale.value = 1;
    targetGlowOpacity.value = 0;
    // Pin handleLevelUp'ta zaten rest konumuna animasyonlandı;
    // aktif atış yoksa state'i temizle
    if (!pinLaunchedRef.current) {
      setPinLaunched(false);
    }
  }

  function handleOpenExitConfirm() {
    if (gameOver) return;
    if (!scoringEnabled) {
      handleConfirmExit();
      return;
    }
    setExitConfirmVisible(true);
  }

  function handleContinueGame() {
    setExitConfirmVisible(false);
  }

  function handleConfirmExit() {
    throwIdRef.current += 1;
    pinLaunchedRef.current = false;
    cancelAnimation(targetRotation);
    onExit();
  }

  function specialKey(special: SpecialObjectConfig, index: number) {
    return `${special.type}-${special.angle}-${index}`;
  }

  // İsabet kararı `resolveThrow`'dan gelen kesin impactAngle ile alınır (rotationRef değil);
  // böylece yıldız/kalp isabeti de asıl çarpışma kontrolüyle aynı açıyı kullanır.
  function findHitSpecial(impactAngle: number) {
    const specials = levelRef.current.specialObjects ?? [];
    return specials
      .map((special, index) => ({ special, index, key: specialKey(special, index) }))
      .find(({ special, key }) => (
        !consumedSpecialsRef.current.has(key) &&
        angleDistance(impactAngle, special.angle) <= SPECIAL_OBJECT_TOLERANCE
      ));
  }

  function pushScoreFeedback(text: string, color = '#ffd84a') {
    const id = scoreFeedbackIdRef.current + 1;
    scoreFeedbackIdRef.current = id;
    setScoreFeedbacks((prev) => [...prev, { color, id, text }]);
  }

  function removeScoreFeedback(id: number) {
    setScoreFeedbacks((prev) => prev.filter((feedback) => feedback.id !== id));
  }

  function removeHeartPickup(id: number) {
    setHeartPickups((prev) => prev.filter((pickup) => pickup.id !== id));
  }

  // Sadece görsel: kalp pickup animasyonunun başlangıç ekran konumu.
  // İsabet kararı için kullanılmaz, o yüzden bayat rotationRef burada sorun değil.
  function getSpecialScreenPosition(angle: number) {
    const screenAngle = angle + rotationRef.current;
    const radians = ((screenAngle - 90) * Math.PI) / 180;
    const distance = TARGET_RADIUS - 7;

    return {
      x: TARGET_CX + Math.cos(radians) * distance,
      y: TARGET_CY + Math.sin(radians) * distance,
    };
  }

  function popHudHeart() {
    hudHeartScale.value = withSequence(
      withTiming(1.42, { duration: 130, easing: Easing.out(Easing.back(1.8)) }),
      withTiming(1, { duration: 230, easing: Easing.out(Easing.cubic) }),
    );
  }

  function triggerHeartPickup(angle: number) {
    const start = getSpecialScreenPosition(angle);
    const id = heartPickupIdRef.current + 1;
    heartPickupIdRef.current = id;
    setHeartPickups((prev) => [...prev, { id, startX: start.x, startY: start.y }]);
  }

  function getDifficultyBonus(levelId: number) {
    if (levelId >= 45) return 10;
    if (levelId >= 30) return 5;
    return 0;
  }

  function applyLevelCompletionScore(state: GameState, completedLevel: LevelConfig) {
    if (completedLevelScoreIds.current.has(completedLevel.id)) {
      return state;
    }

    completedLevelScoreIds.current.add(completedLevel.id);
    const difficultyBonus = getDifficultyBonus(completedLevel.id);

    if (difficultyBonus > 0) pushScoreFeedback(`+${difficultyBonus} HARD`, '#ff9a45');

    return {
      ...state,
      score: state.score + completedLevel.id + difficultyBonus,
    };
  }

  function applyPerfectStreakBonus(state: GameState) {
    if (state.streak === 0 || state.streak % PERFECT_STREAK_COUNT !== 0) {
      return state;
    }

    setPerfectLevelId(levelRef.current.id);
    setPerfectTrigger((k) => k + 1);
    setTimeout(() => sounds.coin(), 90);

    return {
      ...state,
      score: state.score + PERFECT_LEVEL_BONUS_SCORE,
    };
  }

  function applySpecialObject(state: GameState, special: SpecialObjectConfig) {
    if (special.type === 'heart') {
      return {
        ...state,
        lives: Math.min(MAX_LIVES, state.lives + 1),
      };
    }

    if (special.type === 'star') {
      return {
        ...state,
        score: state.score + STAR_BONUS_SCORE,
      };
    }

    return state;
  }

  function resolveThrow(throwId: number, exactRotation: number) {
    // throwId eşleşmezse bu atış zaten iptal edilmiş demektir (manuel çıkış ya da
    // uygulama arka plana geçtiği için throwIdRef artırıldı) — donmuş/bayat açıyla
    // isabet çözümlemeye çalışmadan sessizce çık.
    if (throwId !== throwIdRef.current || !pinLaunchedRef.current) return;

    const currentLevel = levelRef.current;
    // Kesin isabet açısı: withTiming bitiş worklet'inde UI thread'de okunan
    // targetRotation.value kullanılır (mod 360 normalizasyonu getImpactAngle içinde yapılır).
    const impactAngle = getImpactAngle(exactRotation);
    const collided = willCollideWithPins(
      impactAngle,
      gameStateRef.current.placedPins,
      currentLevel.collisionToleranceDeg,
    );

    if (collided) {
      levelLostLife.current = true;
      if (!scoringEnabled) {
        trainingMistakesRef.current += 1;
      }
      const hadProtection = gameStateRef.current.lives > 0;
      const newLives = hadProtection ? gameStateRef.current.lives - 1 : 0;
      const rollbackScore = levelStartScoreRef.current;
      triggerHaptic('error');
      sounds.wrong();
      triggerShake();
      triggerFlash('wrong');
      pinFallX.value = withTiming(34, { duration: 420, easing: Easing.out(Easing.cubic) });
      pinFallRotation.value = withTiming(118, { duration: 420, easing: Easing.out(Easing.cubic) });
      pinY.value = withTiming(height + PIN_H, { duration: 420, easing: Easing.in(Easing.cubic) });
      if (!hadProtection) {
        const finalScore = scoringEnabled ? rollbackScore : gameStateRef.current.score;
        setGameState((prev) => ({
          ...prev,
          score: finalScore,
          streak: 0,
        }));
        setTimeout(() => finishGame(finalScore), 620);
      } else {
        setGameState((prev) => ({
          ...prev,
          lives: newLives,
          streak: 0,
        }));
        setTimeout(() => {
          if (throwId !== throwIdRef.current) return;

          pinFallX.value = 0;
          pinFallRotation.value = 0;
          pinY.value = height + 100;
          pinY.value = withTiming(PIN_Y_REST, { duration: 230, easing: Easing.out(Easing.cubic) });
          pinLaunchedRef.current = false;
          setPinLaunched(false);
        }, 520);
      }
      return;
    }

    let newState = applySafeHit(gameStateRef.current, impactAngle);
    newState = applyPerfectStreakBonus(newState);
    const hitSpecial = findHitSpecial(impactAngle);
    if (hitSpecial) {
      consumedSpecialsRef.current.add(hitSpecial.key);
      setConsumedSpecials(Array.from(consumedSpecialsRef.current));
      newState = applySpecialObject(newState, hitSpecial.special);
      if (hitSpecial.special.type === 'star') {
        setTimeout(() => sounds.coin(), 90);
        const starColor = getStarColor(levelRef.current.id);
        pushScoreFeedback(`+${STAR_BONUS_SCORE} ★`, starColor);
      } else {
        sounds.heart();
        triggerHeartPickup(hitSpecial.special.angle);
      }
    }
    triggerHaptic('medium');
    sounds.correct();
    targetShakeY.value = withSequence(
      withTiming(-4, { duration: 40 }),
      withTiming(3,  { duration: 35 }),
      withTiming(-2, { duration: 30 }),
      withTiming(0,  { duration: 30 }),
    );

    // Saplanmış pin hedefe geçti; aktif pini anlık ekran altına gizle
    pinY.value = height + 100;

    const totalRequired = currentLevel.initialPins.length + currentLevel.requiredPins;
    if (isLevelComplete(newState.placedPins, totalRequired)) {
      pinLaunchedRef.current = false;
      newState = applyLevelCompletionScore(newState, currentLevel);
      commitLevelScore(newState.score);
      setGameState(newState);
      const nextIdx = levelIdx + 1;
      if (nextIdx < LEVELS.length) {
        setPinLaunched(false);
        handleLevelUp(nextIdx);
      } else {
        finishGame(newState.score);
      }
      return;
    }

    setGameState(newState);

    // Yeni pin alttan kayarak yükselir; kullanıcı hemen tekrar dokunabilir
    pinY.value = withTiming(PIN_Y_REST, {
      duration: 230,
      easing: Easing.out(Easing.cubic),
    });
    pinLaunchedRef.current = false;
    setPinLaunched(false);
  }

  const handleTap = useCallback(() => {
    if (pinLaunchedRef.current || gameOver || isLevelingUp || exitConfirmVisible || trainingLimitReached) return;

    const launchDuration = Math.max(40, 100 - levelIdx * 6);
    const throwId = throwIdRef.current + 1;
    throwIdRef.current = throwId;

    pinLaunchedRef.current = true;
    setPinLaunched(true);
    setHasThrownOnce(true);
    pinFallX.value = 0;
    pinFallRotation.value = 0;
    triggerHaptic('light');
    sounds.launch();

    pinY.value = withTiming(
      PIN_Y_HIT,
      {
        duration: launchDuration,
        easing: Easing.out(Easing.quad),
      },
      (finished) => {
        if (finished) {
          // Ok'un hedefe değdiği tam anda UI thread'de rotasyonu oku;
          // JS thread'deki 16ms polling'e güvenme (bayat değer verir).
          runOnJS(resolveThrow)(throwId, targetRotation.value);
        }
      },
    );
  }, [exitConfirmVisible, gameOver, hapticsEnabled, isLevelingUp, levelIdx, trainingLimitReached]);

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <SpaceBackground levelId={level.id} visualZone={visualZone} />
      </View>
      <Animated.View style={[styles.gameLayer, shakeStyle]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleTap}
          style={styles.container}
        >
          <HUD
            heartScale={hudHeartScale}
            lives={gameState.lives}
            level={level.id}
            score={gameState.score}
            streak={gameState.streak}
          />

          {/* Target + placed pins share shake wrapper so they move together */}
          <Animated.View pointerEvents="none" style={[styles.targetGroup, targetShakeStyle]}>
            <Target
              levelId={level.id}
              rotation={targetRotation}
              radius={TARGET_RADIUS}
              remainingPins={gameState.remainingPins}
              visualZone={visualZone}
            />
            <Animated.View pointerEvents="none" style={[styles.targetCompleteGlow, targetGlowStyle]} />

            {/* Saplanmış pinler — hedefle birlikte döner */}
            <Animated.View
              pointerEvents="none"
              style={[styles.pinOrbit, { left: 0, top: 0 }, rotatingPinsStyle]}
            >
              {(level.specialObjects ?? []).map((special, index) => {
                const key = specialKey(special, index);
                if (consumedSpecials.includes(key)) return null;

                return (
                  <SpecialObjectView
                    key={key}
                    angle={special.angle}
                    levelId={level.id}
                    rotation={targetRotation}
                    type={special.type}
                  />
                );
              })}
              {gameState.placedPins.map((angle, index) => (
                <Pin
                  key={`${angle}-${index}`}
                  mode="placed"
                  isObstacle={index < level.initialPins.length}
                  levelId={level.id}
                  style={pinPositionStyle(angle)}
                  visualZone={visualZone}
                />
              ))}
            </Animated.View>
          </Animated.View>

          {/* Aktif pin — tap ile yukarı fırlar */}
          <Animated.View
            pointerEvents="none"
            style={[styles.activePin, activePinStyle]}
          >
            <Pin
              launched={pinLaunched}
              levelId={level.id}
              mode="active"
              visualZone={visualZone}
            />
          </Animated.View>

          {!hasThrownOnce && !pinLaunched && !gameOver && !isLevelingUp && (
            <Text style={styles.hint}>{strings.tapToThrow}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.78}
          onPress={handleOpenExitConfirm}
          style={styles.exitButton}
        >
          <Text style={styles.exitButtonText}>‹</Text>
        </TouchableOpacity>
      </Animated.View>

      <LevelTransitionOverlay
        anchorX={TARGET_CX}
        anchorY={PIN_Y_REST - 20}
        level={transitionLevelId ?? level.id}
        onDone={handleLevelTransitionDone}
        visible={isLevelingUp}
      />

      <View pointerEvents="none" style={styles.scoreFeedbackLayer}>
        {scoreFeedbacks.map((feedback, index) => (
          <ScoreFeedbackText
            key={feedback.id}
            color={feedback.color}
            index={index}
            onDone={() => removeScoreFeedback(feedback.id)}
            text={feedback.text}
          />
        ))}
      </View>

      <View pointerEvents="none" style={styles.heartPickupLayer}>
        {heartPickups.map((pickup) => (
          <HeartPickupEffect
            key={pickup.id}
            onDone={() => removeHeartPickup(pickup.id)}
            onImpact={popHudHeart}
            pickup={pickup}
          />
        ))}
      </View>

      <PerfectEffect
        bonusScore={PERFECT_LEVEL_BONUS_SCORE}
        level={perfectLevelId}
        triggerKey={perfectTrigger}
      />

      {!scoringEnabled && (
        <Animated.View style={[styles.trainingBanner, trainingBannerStyle]} pointerEvents="none">
          <Text style={styles.trainingBannerText}>TRAINING MODE</Text>
          <Text style={styles.trainingBannerSub}>Practice score only</Text>
        </Animated.View>
      )}

      {trainingEndVisible && (
        <TouchableOpacity style={styles.trainingEndOverlay} onPress={handleDismissTrainingEnd} activeOpacity={1}>
          <Animated.View style={[styles.trainingEndCard, trainingEndStyle]}>
            <Text style={styles.trainingEndIcon}>🏁</Text>
            <Text style={styles.trainingEndTitle}>TRAINING COMPLETE</Text>
            <Text style={styles.trainingEndSub}>
              Ready for the real challenge?{'\n'}Level {trainingMaxLevelId} awaits!
            </Text>
            <Text style={styles.trainingEndDismiss}>TAP TO CONTINUE</Text>
          </Animated.View>
        </TouchableOpacity>
      )}

      {screenFlashEnabled && <ScreenFlash flashType={flash} />}

      {exitConfirmVisible && (
        <View style={styles.exitOverlay} pointerEvents="auto">
          <View style={styles.exitPanel}>
            <Text style={styles.exitTitle}>Exit game?</Text>
            <Text style={styles.exitText}>Current level progress will be lost.</Text>
            <View style={styles.exitActions}>
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={handleContinueGame}
                style={[styles.exitActionButton, styles.continueButton]}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={handleConfirmExit}
                style={[styles.exitActionButton, styles.homeButton]}
              >
                <Text style={styles.homeButtonText}>Levels</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// Saplanmış pinin pinOrbit içindeki mutlak konumu.
// isObstacle bilgisi Pin komponenti tarafından renk için ayrıca alınır.
function pinPositionStyle(angle: number) {
  const rad      = ((angle - 90) * Math.PI) / 180;
  const distance = PIN_CENTER_DISTANCE;
  const x        = TARGET_RADIUS + Math.cos(rad) * distance;
  const y        = TARGET_RADIUS + Math.sin(rad) * distance;
  return {
    position: 'absolute' as const,
    left:  x - PIN_W / 2,
    top:   y - PIN_H / 2,
    // +180: SVG'deki uç (y=0, üst) hedefe doğru döner
    transform: [{ rotate: `${angle + 180}deg` }],
  };
}

function specialPositionStyle(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  const distance = TARGET_RADIUS - 7;
  const x = TARGET_RADIUS + Math.cos(rad) * distance;
  const y = TARGET_RADIUS + Math.sin(rad) * distance;
  const size = 44;

  return {
    left: x - size / 2,
    top: y - size / 2,
  };
}

function SpecialObjectView({
  angle,
  levelId,
  rotation,
  type,
}: {
  angle: number;
  levelId: number;
  rotation: SharedValue<number>;
  type: SpecialObjectConfig['type'];
}) {
  const pulse = useSharedValue(1);
  const spin  = useSharedValue(0);
  const color = type === 'heart' ? '#ff3355' : getStarColor(levelId);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.32, { duration: 400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.88, { duration: 400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    if (type === 'star') {
      spin.value = withRepeat(
        withTiming(360, { duration: 2400, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [pulse, spin, type]);

  const counterRotateStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + (pulse.value - 0.88) * 0.7,
    transform: [
      { rotate: `${rotation.value * -1}deg` },
      { scale: pulse.value },
      ...(type === 'star' ? [{ rotate: `${spin.value}deg` }] : []),
    ],
  }));

  return (
    <View
      pointerEvents="none"
      style={[styles.specialObject, { shadowColor: color }, specialPositionStyle(angle)]}
    >
      <Animated.View style={[styles.specialIcon, { shadowColor: color }, counterRotateStyle]}>
        {type === 'heart'
          ? <HeartIcon size={30} color={color} />
          : <StarIcon size={32} color={color} />
        }
      </Animated.View>
    </View>
  );
}

function StarIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.2 14.9 8l6.4.9-4.6 4.5 1.1 6.4L12 16.8 6.2 19.8l1.1-6.4L2.7 8.9 9.1 8 12 2.2Z"
        fill={color}
      />
      <Path
        d="M12 5.8 13.8 9.5l4.1.6-3 2.9.7 4.1-3.6-1.9-3.6 1.9.7-4.1-3-2.9 4.1-.6L12 5.8Z"
        fill="rgba(255,255,255,0.36)"
      />
    </Svg>
  );
}

function HeartIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21C9.2 18.5 6.9 16.4 5.2 14.5 3.5 12.7 2.6 10.9 2.6 8.9c0-1.6.5-2.9 1.6-3.9C5.2 4 6.5 3.5 8 3.5c.9 0 1.7.2 2.4.7.7.4 1.2 1 1.6 1.7.4-.7.9-1.3 1.6-1.7.7-.5 1.5-.7 2.4-.7 1.5 0 2.8.5 3.8 1.5 1.1 1 1.6 2.3 1.6 3.9 0 2-.9 3.8-2.6 5.6-1.7 1.9-4 4-6.8 6.5Z"
        fill={color}
      />
    </Svg>
  );
}

function HeartPickupEffect({
  onDone,
  onImpact,
  pickup,
}: {
  onDone: () => void;
  onImpact: () => void;
  pickup: HeartPickup;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.72);
  const x = useSharedValue(pickup.startX - 18);
  const y = useSharedValue(pickup.startY - 18);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 80, easing: Easing.out(Easing.cubic) }),
      withDelay(540, withTiming(0, { duration: 110, easing: Easing.in(Easing.cubic) })),
    );
    scale.value = withSequence(
      withTiming(1.22, { duration: 140, easing: Easing.out(Easing.back(1.8)) }),
      withTiming(0.76, { duration: 540, easing: Easing.inOut(Easing.cubic) }),
    );
    x.value = withTiming(HUD_HEART_X - 18, { duration: 680, easing: Easing.inOut(Easing.cubic) });
    y.value = withTiming(
      HUD_HEART_Y - 18,
      { duration: 680, easing: Easing.inOut(Easing.cubic) },
      (finished) => {
        if (!finished) return;
        runOnJS(onImpact)();
        runOnJS(onDone)();
      },
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.heartPickup, animatedStyle]}>
      <HeartIcon color="#ff3355" size={36} />
    </Animated.View>
  );
}

function ScoreFeedbackText({
  color,
  index,
  onDone,
  text,
}: {
  color: string;
  index: number;
  onDone: () => void;
  text: string;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const x = useSharedValue((index % 3 - 1) * 42);
  const y = useSharedValue(0);
  const isStar = text.includes('★');

  useEffect(() => {
    if (isStar) {
      opacity.value = withSequence(
        withTiming(1, { duration: 80, easing: Easing.out(Easing.cubic) }),
        withDelay(420, withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) })),
      );
      scale.value = withSequence(
        withTiming(1.65, { duration: 220, easing: Easing.out(Easing.back(2.2)) }),
        withTiming(1.2, { duration: 180, easing: Easing.out(Easing.cubic) }),
      );
      x.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });
      y.value = withTiming(-72, { duration: 700, easing: Easing.out(Easing.cubic) });
    } else {
      opacity.value = withSequence(
        withTiming(1, { duration: 120, easing: Easing.out(Easing.cubic) }),
        withDelay(260, withTiming(0, { duration: 160, easing: Easing.in(Easing.cubic) })),
      );
      scale.value = withSequence(
        withTiming(1.15, { duration: 180, easing: Easing.out(Easing.back(1.4)) }),
        withTiming(1, { duration: 120, easing: Easing.out(Easing.cubic) }),
      );
      x.value = withTiming((index % 2 === 0 ? -8 : 8), { duration: 560, easing: Easing.out(Easing.cubic) });
      y.value = withTiming(-46 - index * 10, { duration: 560, easing: Easing.out(Easing.cubic) });
    }
    const timer = setTimeout(onDone, isStar ? 760 : 620);
    return () => clearTimeout(timer);
  }, [index, isStar, onDone, opacity, scale, x, y]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.Text
      style={[
        styles.scoreFeedbackText,
        isStar && { fontSize: 25, letterSpacing: 1.1, textShadowRadius: 7 },
        { color, textShadowColor: color },
        animatedStyle,
      ]}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFill,
  },
  gameLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
  },
  target: {
    left: TARGET_CX - TARGET_RADIUS,
    position: 'absolute',
    top: TARGET_CY - TARGET_RADIUS,
  },
  targetGroup: {
    left: TARGET_CX - TARGET_RADIUS,
    position: 'absolute',
    top: TARGET_CY - TARGET_RADIUS,
  },
  pinOrbit: {
    height: TARGET_RADIUS * 2,
    left: TARGET_CX - TARGET_RADIUS,
    position: 'absolute',
    top: TARGET_CY - TARGET_RADIUS,
    width: TARGET_RADIUS * 2,
  },
  placedPin: {
    borderColor: 'rgba(0,0,0,0.35)',
    borderRadius: 4,
    borderWidth: 1,
    height: 68,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    width: 5,
  },
  specialObject: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#ff3355',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    width: 44,
  },
  specialIcon: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    shadowColor: '#ff3355',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 14,
    width: 36,
  },
  targetCompleteGlow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: TARGET_RADIUS,
    borderWidth: 2,
    height: TARGET_RADIUS * 2,
    left: 0,
    position: 'absolute',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.62,
    shadowRadius: 24,
    top: 0,
    width: TARGET_RADIUS * 2,
  },
  activePin: {
    height: PIN_H,
    left: width / 2 - PIN_W / 2,
    position: 'absolute',
    top: PIN_Y_REST - 36,
    width: PIN_W,
  },
  exitButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 12, 28, 0.58)',
    borderColor: 'rgba(122, 231, 255, 0.42)',
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    left: 18,
    position: 'absolute',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    top: 51,
    width: 42,
    zIndex: 20,
  },
  exitButtonText: {
    color: '#dff8ff',
    fontSize: 35,
    fontWeight: '800',
    lineHeight: 38,
    marginTop: -3,
  },
  exitOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 18, 0.36)',
    justifyContent: 'center',
    zIndex: 80,
  },
  exitPanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(5, 14, 34, 0.94)',
    borderColor: 'rgba(122, 231, 255, 0.38)',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 20,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    width: Math.min(width - 48, 330),
  },
  exitTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 7,
  },
  exitText: {
    color: 'rgba(230,246,255,0.68)',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
  },
  exitActions: {
    flexDirection: 'row',
    gap: 10,
  },
  exitActionButton: {
    alignItems: 'center',
    borderRadius: 12,
    minWidth: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  continueButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
  },
  continueButtonText: {
    color: '#eaf8ff',
    fontSize: 14,
    fontWeight: '900',
  },
  homeButton: {
    backgroundColor: '#00d4ff',
  },
  homeButtonText: {
    color: '#031120',
    fontSize: 14,
    fontWeight: '900',
  },
  feedbackWrapper: {
    alignSelf: 'center',
    position: 'absolute',
    top: height * 0.62,
  },
  scoreFeedbackLayer: {
    alignItems: 'center',
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    top: TARGET_CY - TARGET_RADIUS + 16,
    zIndex: 30,
  },
  heartPickupLayer: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
    zIndex: 45,
  },
  heartPickup: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#ff3355',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: 12,
    width: 36,
  },
  scoreFeedbackText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    position: 'absolute',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  hint: {
    bottom: 48,
    color: 'rgba(255,255,255,0.48)',
    fontSize: 14,
    position: 'absolute',
  },
  trainingBanner: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(4,16,38,0.88)',
    borderColor: 'rgba(117,247,255,0.32)',
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 20,
    paddingVertical: 10,
    position: 'absolute',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    top: TARGET_CY + TARGET_RADIUS + 28,
    zIndex: 40,
  },
  trainingBannerText: {
    color: '#dffbff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  trainingBannerSub: {
    color: 'rgba(230,246,255,0.52)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  trainingEndOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2,6,21,0.88)',
    zIndex: 60,
  },
  trainingEndCard: {
    alignItems: 'center',
    gap: 14,
  },
  trainingEndIcon: {
    fontSize: 52,
  },
  trainingEndTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  trainingEndSub: {
    color: 'rgba(230,246,255,0.62)',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  trainingEndDismiss: {
    color: 'rgba(230,246,255,0.35)',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 8,
  },
});
