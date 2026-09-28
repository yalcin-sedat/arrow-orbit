import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { strings } from '../data/strings';
import { getHighScore } from '../utils/storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { sounds } from '../utils/sounds';
import SpaceBackground from '../components/SpaceBackground';

const { width } = Dimensions.get('window');

type GameOverScreenProps = {
  finalScore: number;
  isTraining?: boolean;
  isNewRecord?: boolean;
  levelReached?: number;
  mistakes?: number;
  streak?: number;
  onRestart: () => void;
  onHome: () => void;
  onAdWatched?: () => void;
  onStreakRollback?: () => void;
};

export default function GameOverScreen({ finalScore, isTraining = false, isNewRecord = false, levelReached, mistakes = 0, streak, onRestart, onHome, onAdWatched, onStreakRollback }: GameOverScreenProps) {
  const [highScore, setHighScore] = useState(0);
  const [offerVisible, setOfferVisible] = useState(!isTraining && Boolean(onAdWatched));
  const [countdown, setCountdown] = useState(12);
  const [adPlaying, setAdPlaying] = useState(false);
  const [adProgress, setAdProgress] = useState(3);
  const protectedLevels = Math.min(streak ?? 0, 5);

  useEffect(() => {
    getHighScore().then(setHighScore);
  }, []);

  useEffect(() => {
    if (!offerVisible) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setOfferVisible(false);
          if (protectedLevels > 0) {
            onStreakRollback?.();
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [offerVisible]);

  function handleWatchAd() {
    setAdPlaying(true);
    setAdProgress(3);
    let t = 3;
    const interval = setInterval(() => {
      t -= 1;
      setAdProgress(t);
      if (t <= 0) {
        clearInterval(interval);
        setAdPlaying(false);
        setOfferVisible(false);
        onAdWatched?.();
      }
    }, 1000);
  }

  function handleGiveUp() {
    setOfferVisible(false);
    if (protectedLevels > 0) {
      onStreakRollback?.();
    }
  }

  const titleOpacity  = useSharedValue(0);
  const titleY        = useSharedValue(-24);
  const scoreOpacity  = useSharedValue(0);
  const scoreScale    = useSharedValue(0.6);
  const btnOpacity    = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
    titleY.value       = withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) });
    scoreOpacity.value = withDelay(350,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }),
    );
    scoreScale.value = withDelay(350,
      withSequence(
        withTiming(1.15, { duration: 300, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1,    { duration: 200, easing: Easing.in(Easing.quad) }),
      ),
    );
    btnOpacity.value = withDelay(700,
      withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) }),
    );
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ scale: scoreScale.value }],
  }));
  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
  }));

  const cardWidth = width * 0.82;

  return (
    <View style={styles.container}>
      <SpaceBackground />

      {/* Ad overlay */}
      {offerVisible && (
        <View style={styles.adOverlay}>
          <View style={styles.adCard}>
            {adPlaying ? (
              <>
                <View style={styles.mockAdBox}>
                  <Text style={styles.mockAdLabel}>{strings.adBadge}</Text>
                  <Text style={styles.mockAdSkip}>{adProgress}s</Text>
                </View>
                <Text style={styles.adSubtitle}>{strings.adPlayingLabel}</Text>
              </>
            ) : (
              <>
                <Text style={styles.adCountdown}>{countdown}</Text>
                <Text style={styles.adTitle}>{protectedLevels > 0 ? strings.protectStreakTitle : strings.bonusChanceTitle}</Text>
                <Text style={styles.adSubtitle}>
                  {protectedLevels > 0
                    ? strings.protectStreakBody(protectedLevels)
                    : strings.bonusChanceBody}
                </Text>
                <TouchableOpacity style={styles.adWatchBtn} onPress={handleWatchAd} activeOpacity={0.82}>
                  <Text style={styles.adWatchText}>{protectedLevels > 0 ? strings.watchAdProtect : strings.watchAd}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.adGiveUpBtn} onPress={handleGiveUp} activeOpacity={0.75}>
                  <Text style={styles.adGiveUpText}>
                    {protectedLevels > 0
                      ? strings.skipRiskLosing(protectedLevels)
                      : strings.skip}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      {/* Ana içerik */}
      <View style={styles.content}>
        {/* Başlık */}
        <Animated.View style={[styles.titleWrapper, titleStyle]}>
          <Text style={styles.title}>{strings.oyunBitti}</Text>
        </Animated.View>

        {/* Skor kartı */}
        <Animated.View style={[{ width: cardWidth }, styles.scoreCard, scoreStyle]}>
          {/* Köşe süsleri */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {isTraining && (
            <View style={styles.trainingBadge}>
              <Text style={styles.trainingBadgeText}>{strings.trainingRunTag}</Text>
            </View>
          )}

          {!isTraining && isNewRecord && (
            <View style={styles.newRecordBadge}>
              <Text style={styles.newRecordText}>{strings.newRecordBadge}</Text>
            </View>
          )}

          <Text style={styles.scoreLabel}>{isTraining ? strings.trainingScoreLabel : strings.finalScoreLabel}</Text>

          <View style={[styles.scoreBox, { width: cardWidth * 0.9 }]}>
            <Text style={styles.scoreValue}>{finalScore}</Text>
            {!isTraining && !isNewRecord && highScore > 0 && (
              <Text style={styles.highScoreText}>{strings.enYuksek(highScore)}</Text>
            )}
          </View>

          {isTraining && (
            <View style={styles.trainingStatsRow}>
              <View style={styles.trainingStatPill}>
                <Text style={styles.trainingStatLabel}>{strings.mistakesLabel}</Text>
                <Text style={styles.trainingStatValue}>{mistakes}</Text>
              </View>
              <View style={styles.trainingStatPill}>
                <Text style={styles.trainingStatLabel}>{strings.savedLabel}</Text>
                <Text style={styles.trainingStatValue}>{strings.savedNo}</Text>
              </View>
            </View>
          )}

          {levelReached !== undefined && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{strings.reachedLevel(levelReached)}</Text>
            </View>
          )}

          <Text style={styles.cardBottomDeco}>»»</Text>
        </Animated.View>

        {/* Butonlar */}
        <Animated.View style={[{ width: cardWidth }, styles.buttons, btnStyle]}>
          {/* PLAY AGAIN */}
          <View style={styles.btnRow}>
            <Text style={styles.btnDecoLeft}>≫</Text>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => { sounds.button(); onRestart(); }}
              activeOpacity={0.82}
            >
              <Text style={styles.btnPrimaryText}>{strings.playAgainDeco}</Text>
            </TouchableOpacity>
            <Text style={styles.btnDecoRightGold}>≫</Text>
          </View>

          {/* MAIN MENU */}
          <View style={styles.btnRow}>
            <Text style={styles.btnDecoBlue}>«</Text>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => { sounds.button(); onHome(); }}
              activeOpacity={0.75}
            >
              <Text style={styles.btnSecondaryText}>{strings.mainMenuDeco}</Text>
            </TouchableOpacity>
            <Text style={styles.btnDecoBlue}>»</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020615',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    zIndex: 2,
    paddingBottom: 80,
  },
  moonIcon: {
    position: 'absolute',
    top: 60,
    right: 24,
    fontSize: 32,
  },

  // --- Başlık ---
  titleWrapper: {
    alignItems: 'center',
  },
  title: {
    color: '#ff2255',
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-condensed',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 5,
    textShadowColor: '#ff2255',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 28,
  },

  // --- Skor kartı ---
  scoreCard: {
    backgroundColor: 'rgba(2,8,28,0.92)',
    borderWidth: 2,
    borderColor: '#d4a017',
    borderRadius: 6,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 14,
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#ffd700',
    borderWidth: 2,
  },
  cornerTL: {
    top: 6,
    left: 6,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: 6,
    right: 6,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: 6,
    left: 6,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: 6,
    right: 6,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  newRecordBadge: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderColor: '#ffd700',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  newRecordText: {
    color: '#ffd700',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  trainingBadge: {
    backgroundColor: 'rgba(0,212,255,0.14)',
    borderColor: colors.neonBlue,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  trainingBadgeText: {
    color: colors.neonBlue,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scoreLabel: {
    color: 'rgba(100,180,255,0.7)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
  },
  scoreBox: {
    borderWidth: 1,
    borderColor: 'rgba(100,180,255,0.35)',
    borderRadius: 4,
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  scoreValue: {
    color: '#ffd700',
    fontSize: 52,
    fontWeight: '900',
  },
  highScoreText: {
    color: 'rgba(180,220,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  trainingStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  trainingStatPill: {
    alignItems: 'center',
    borderColor: 'rgba(0,212,255,0.38)',
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 96,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trainingStatLabel: {
    color: 'rgba(180,220,255,0.58)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  trainingStatValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  levelBadge: {
    marginTop: 4,
  },
  levelBadgeText: {
    color: colors.neonBlue,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  cardBottomDeco: {
    color: '#ffd700',
    fontSize: 12,
    opacity: 0.6,
    letterSpacing: 2,
  },

  // --- Butonlar ---
  buttons: {
    gap: 12,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#22bb44',
    borderRadius: 12,
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ff66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  btnPrimaryText: {
    color: '#021108',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  btnDecoLeft: {
    fontSize: 28,
    color: '#22cc44',
    fontWeight: '900',
  },
  btnDecoRightGold: {
    fontSize: 28,
    color: '#ffd700',
    fontWeight: '900',
  },
  btnDecoBlue: {
    fontSize: 22,
    color: '#4488ff',
    fontWeight: '900',
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(0,40,80,0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(80,180,255,0.35)',
    borderRadius: 12,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: '#c0e8ff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // --- Alt dekor ---
  bottomDecor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  targetBase: {
    position: 'absolute',
    bottom: 14,
    width: 60,
    height: 14,
    borderRadius: 30,
    backgroundColor: 'rgba(0,100,200,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(0,150,255,0.3)',
    alignSelf: 'center',
  },
  arrowStick: {
    position: 'absolute',
    alignItems: 'center',
  },
  arrowLeft: {
    bottom: 18,
    left: '15%',
    transform: [{ rotate: '-12deg' }],
  },
  arrowCenter: {
    bottom: 14,
    left: '50%',
    transform: [{ translateX: -1.5 }],
  },
  arrowRight: {
    bottom: 18,
    right: '15%',
    transform: [{ rotate: '15deg' }],
  },
  arrowTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -1,
  },
  arrowTipRed: {
    borderBottomColor: '#cc2244',
  },
  arrowTipWhite: {
    borderBottomColor: '#ddeeff',
  },
  arrowTipBlue: {
    borderBottomColor: '#2266cc',
  },
  arrowStickBodyRed: {
    width: 4,
    height: 44,
    backgroundColor: '#cc2244',
    borderRadius: 2,
  },
  arrowStickBodyWhite: {
    width: 3,
    height: 52,
    backgroundColor: '#ddeeff',
    borderRadius: 2,
  },
  arrowStickBodyBlue: {
    width: 4,
    height: 40,
    backgroundColor: '#2266cc',
    borderRadius: 2,
  },

  // --- Ad overlay ---
  adOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2,6,21,0.92)',
    zIndex: 50,
  },
  adCard: {
    width: width * 0.85,
    backgroundColor: 'rgba(4,16,38,0.95)',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#d4a017',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: colors.neonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
  },
  adCountdown: {
    color: colors.neonGold,
    fontSize: 42,
    fontWeight: '900',
    textShadowColor: colors.neonGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  adTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  adSubtitle: {
    color: 'rgba(230,246,255,0.65)',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  adWatchBtn: {
    alignSelf: 'stretch',
    backgroundColor: colors.neonGold,
    borderRadius: 16,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  adWatchText: {
    color: '#031120',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  adGiveUpBtn: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderColor: 'rgba(230,246,255,0.18)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  adGiveUpText: {
    color: 'rgba(230,246,255,0.45)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  mockAdBox: {
    alignSelf: 'stretch',
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 8,
  },
  mockAdLabel: {
    color: 'rgba(230,246,255,0.4)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  mockAdSkip: {
    color: colors.neonGold,
    fontSize: 36,
    fontWeight: '900',
  },
});
