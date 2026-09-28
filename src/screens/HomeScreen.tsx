import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ImageBackground,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import Pin, { PIN_H, PIN_W } from '../components/Pin';
import { strings } from '../data/strings';
import { sounds } from '../utils/sounds';
import { getAppSettings, saveAppSettings } from '../utils/storage';

const HOME_BACKGROUND_LAYER = require('../../assets/ui/homepage-background.jpg');
const HOME_TARGET = require('../../assets/ui/homepage-target.png');
const HOME_TARGET_ROTATION_MS = 18000;
const HOME_ARROW_IMPACT_MS = 680;
const HOME_ARROW_DELAYS = [0, 900, 1800] as const;
const HOME_ARROW_SCALE = 1.22;
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

type HomeScreenProps = {
  bestScore: number;
  highestLevel: number;
  onPlay: () => void;
  onScoreboard: () => void;
  onSettings: () => void;
};

export default function HomeScreen({
  bestScore,
  highestLevel,
  onPlay,
  onScoreboard,
  onSettings,
}: HomeScreenProps) {
  const { height, width } = useWindowDimensions();
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());
  const soundEnabledRef = useRef(soundEnabled);
  const compact = height < 760;
  const isTablet = width >= 768;
  const playSize = isTablet ? Math.min(width * 0.195, 154) : Math.min(width * 0.285, 126);
  const targetSize = isTablet
    ? Math.min(width * 0.52, height * 0.46, 430)
    : Math.min(width * 0.78, height * 0.36);
  const targetRimSize = targetSize * 0.82;
  const targetCenterX = width / 2;
  const targetCenterY = isTablet ? height * 0.43 : height * (compact ? 0.455 : 0.47);
  const playCenterX = targetCenterX;
  const playCenterY = targetCenterY;
  const controlSize = isTablet ? 56 : 42;
  const controlRadius = controlSize / 2;
  const menuIconSize = isTablet ? 42 : 34;
  const socialIconSize = isTablet ? 31 : 25;
  const shortcutPanelWidth = isTablet ? Math.min(width * 0.45, 430) : Math.min(width - 42, 338);
  const socialTop = Math.min(
    targetCenterY + targetSize * (isTablet ? 0.53 : 0.58),
    height - (compact ? 190 : isTablet ? 250 : 226),
  );
  const socialOffset = isTablet ? Math.min(width * 0.26, 220) : Math.min(width * 0.43, 168);
  const statsWidth = isTablet ? Math.min(width * 0.3, 300) : Math.min(width - 118, 230);
  const statsTop = socialTop + 1;
  const targetRotation = useSharedValue(0);
  const arrowOneProgress = useSharedValue(0);
  const arrowTwoProgress = useSharedValue(0);
  const arrowThreeProgress = useSharedValue(0);
  const playPressScale = useSharedValue(1);

  useEffect(() => {
    let mounted = true;

    // Ses ayarının tek kaynağı storage'daki AppSettings — açılışta oradan okunur.
    getAppSettings().then((settings) => {
      if (!mounted) return;
      soundEnabledRef.current = settings.soundEnabled;
      setSoundEnabled(settings.soundEnabled);
      sounds.setEnabled(settings.soundEnabled);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    targetRotation.value = 0;
    targetRotation.value = withRepeat(
      withTiming(360, { duration: HOME_TARGET_ROTATION_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }, [targetRotation]);

  useEffect(() => {
    const animateArrow = (progress: SharedValue<number>, delay: number) => {
      progress.value = withDelay(
        delay,
        withSequence(
          withTiming(0.24, { duration: 680, easing: Easing.out(Easing.cubic) }),
          withTiming(0.36, { duration: 260, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 0 }),
        ),
      );
    };

    animateArrow(arrowOneProgress, HOME_ARROW_DELAYS[0]);
    animateArrow(arrowTwoProgress, HOME_ARROW_DELAYS[1]);
    animateArrow(arrowThreeProgress, HOME_ARROW_DELAYS[2]);
    const timers = HOME_ARROW_DELAYS.map((delay) => (
      setTimeout(() => {
        if (soundEnabledRef.current) {
          sounds.correct();
        }
      }, delay + HOME_ARROW_IMPACT_MS)
    ));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [
    arrowOneProgress,
    arrowThreeProgress,
    arrowTwoProgress,
  ]);

  const targetMotionStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${targetRotation.value}deg` }],
  }));

  const playButtonMotionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playPressScale.value }],
  }));

  function handleToggleSound() {
    setSoundEnabled((enabled) => {
      const next = !enabled;
      soundEnabledRef.current = next;
      sounds.setEnabled(next);

      getAppSettings().then((settings) => {
        saveAppSettings({ ...settings, soundEnabled: next });
      });

      if (next) {
        sounds.button();
      }

      return next;
    });
  }

  function handleShareGame() {
    if (soundEnabledRef.current) {
      sounds.button();
    }

    Share.share({
      message: strings.shareMessage,
      title: strings.brandTitle,
    }).catch(() => {
      // Paylaşım iptal edilirse ana sayfayı bölme.
    });
  }

  function handleRateGame() {
    if (soundEnabledRef.current) {
      sounds.button();
    }

    Alert.alert(strings.brandTitle, strings.comingSoon);
  }

  function handlePlayPressIn() {
    sounds.button();
    playPressScale.value = withTiming(0.93, {
      duration: 90,
      easing: Easing.out(Easing.quad),
    });
  }

  function handlePlayPressOut() {
    playPressScale.value = withTiming(1, {
      duration: 210,
      easing: Easing.out(Easing.back(1.8)),
    });
  }

  return (
    <View style={styles.root}>
      <ImageBackground
        resizeMode="cover"
        source={HOME_BACKGROUND_LAYER}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.targetNeonBorder,
              {
                height: targetRimSize,
                left: width / 2 - targetRimSize / 2,
                top: targetCenterY - targetRimSize / 2,
                width: targetRimSize,
              },
              targetMotionStyle,
            ]}
          >
            <TargetNeonBorder size={targetRimSize} />
          </Animated.View>

          <Animated.Image
            resizeMode="contain"
            source={HOME_TARGET}
            style={[
              styles.homeTarget,
              {
                height: targetSize,
                left: width / 2 - targetSize / 2,
                top: targetCenterY - targetSize / 2,
                width: targetSize,
              },
              targetMotionStyle,
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.playerStatsPanel,
              {
                left: width / 2 - statsWidth / 2,
                top: statsTop,
                width: statsWidth,
              },
            ]}
          >
            <View
              style={[
                styles.playerStatItem,
                styles.playerStatLeft,
                isTablet ? styles.playerStatItemTablet : null,
              ]}
            >
              <View style={styles.playerStatTextBlock}>
                <Text style={[styles.statLabel, isTablet ? styles.statLabelTablet : null]}>LEVEL</Text>
                <Text style={[styles.statValue, isTablet ? styles.statValueTablet : null]}>{highestLevel}</Text>
              </View>
            </View>
            <View
              style={[
                styles.playerStatItem,
                styles.playerStatRight,
                isTablet ? styles.playerStatItemTablet : null,
              ]}
            >
              <View style={styles.playerStatTextBlock}>
                <Text style={[styles.statLabel, isTablet ? styles.statLabelTablet : null]}>BEST</Text>
                <Text style={[styles.statValue, isTablet ? styles.statValueTablet : null]}>{bestScore}</Text>
              </View>
            </View>
          </View>

          <AnimatedTouchableOpacity
            accessibilityLabel={strings.oyna}
            accessibilityRole="button"
            activeOpacity={0.9}
            onPress={onPlay}
            onPressIn={handlePlayPressIn}
            onPressOut={handlePlayPressOut}
            style={[
              styles.targetPlayButton,
              {
                height: playSize,
                left: playCenterX - playSize / 2,
                top: playCenterY - playSize / 2,
                width: playSize,
              },
              playButtonMotionStyle,
            ]}
          >
            <BlinkPlayIcon size={playSize} />
          </AnimatedTouchableOpacity>

          <HomeFlyingArrow
            delay={HOME_ARROW_DELAYS[0]}
            impactAngle={28}
            levelId={1}
            progress={arrowOneProgress}
            targetRotation={targetRotation}
            targetCenterX={targetCenterX}
            targetCenterY={targetCenterY}
            targetRadius={targetSize * 0.47}
            travel={targetSize * 0.86}
          />
          <HomeFlyingArrow
            delay={HOME_ARROW_DELAYS[1]}
            impactAngle={308}
            levelId={15}
            progress={arrowTwoProgress}
            targetRotation={targetRotation}
            targetCenterX={targetCenterX}
            targetCenterY={targetCenterY}
            targetRadius={targetSize * 0.47}
            travel={targetSize * 0.84}
          />
          <HomeFlyingArrow
            delay={HOME_ARROW_DELAYS[2]}
            impactAngle={132}
            levelId={31}
            progress={arrowThreeProgress}
            targetRotation={targetRotation}
            targetCenterX={targetCenterX}
            targetCenterY={targetCenterY}
            targetRadius={targetSize * 0.47}
            travel={targetSize * 0.84}
          />

          <TouchableOpacity
            accessibilityLabel="Rate game"
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={handleRateGame}
            style={[
              styles.socialButton,
              {
                borderRadius: controlRadius,
                height: controlSize,
                left: width / 2 - socialOffset - controlRadius,
                top: socialTop,
                width: controlSize,
              },
            ]}
          >
            <QuickActionIcon size={socialIconSize} type="rate" />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Share game"
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={handleShareGame}
            style={[
              styles.socialButton,
              {
                borderRadius: controlRadius,
                height: controlSize,
                left: width / 2 + socialOffset - controlRadius,
                top: socialTop,
                width: controlSize,
              },
            ]}
          >
            <QuickActionIcon size={socialIconSize} type="share" />
          </TouchableOpacity>

          <View
            style={[
              styles.shortcutPanel,
              {
                left: width / 2 - shortcutPanelWidth / 2,
                marginBottom: compact ? 92 : isTablet ? 112 : 122,
                width: shortcutPanelWidth,
              },
            ]}
          >
            <View style={styles.secondaryRow}>
              <HomeShortcut
                buttonSize={controlSize}
                icon={<HomeMenuIcon size={menuIconSize} type="scores" />}
                label="SCORES"
                onPress={onScoreboard}
              />
              <HomeShortcut
                buttonSize={controlSize}
                icon={<HomeMenuIcon size={menuIconSize} type={soundEnabled ? 'soundOn' : 'soundOff'} />}
                label="SOUND"
                onPress={handleToggleSound}
              />
              <HomeShortcut
                buttonSize={controlSize}
                icon={<HomeMenuIcon size={menuIconSize} type="settings" />}
                label="SETTINGS"
                onPress={onSettings}
              />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

function QuickActionIcon({ size = 25, type }: { size?: number; type: 'rate' | 'share' }) {
  return (
    <Svg height={size} viewBox="0 0 32 32" width={size}>
      <Defs>
        <LinearGradient id={`quickIcon-${type}`} x1="4" x2="28" y1="5" y2="27">
          <Stop offset="0" stopColor="#b7ffff" />
          <Stop offset="0.5" stopColor="#19e5ff" />
          <Stop offset="1" stopColor={type === 'share' ? '#8b4dff' : '#ff9a28'} />
        </LinearGradient>
      </Defs>
      {type === 'share' ? (
        <>
          <Circle cx="10" cy="16" fill="none" r="3.5" stroke="url(#quickIcon-share)" strokeWidth="2.3" />
          <Circle cx="23" cy="9" fill="none" r="3.5" stroke="url(#quickIcon-share)" strokeWidth="2.3" />
          <Circle cx="23" cy="23" fill="none" r="3.5" stroke="url(#quickIcon-share)" strokeWidth="2.3" />
          <Path d="M13.2 14.4 L19.8 10.8" stroke="url(#quickIcon-share)" strokeLinecap="round" strokeWidth="2.3" />
          <Path d="M13.2 17.6 L19.8 21.2" stroke="url(#quickIcon-share)" strokeLinecap="round" strokeWidth="2.3" />
        </>
      ) : (
        <Path
          d="M16 4.8 L19.3 12 L27.1 12.8 L21.2 18 L22.9 25.7 L16 21.7 L9.1 25.7 L10.8 18 L4.9 12.8 L12.7 12 Z"
          fill="rgba(255,216,74,0.16)"
          stroke="url(#quickIcon-rate)"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      )}
    </Svg>
  );
}

function TargetNeonBorder({ size }: { size: number }) {
  return (
    <Svg height={size} viewBox="0 0 100 100" width={size}>
      <Defs>
        <RadialGradient cx="50%" cy="50%" id="targetHaloGlow" r="50%">
          <Stop offset="0.84" stopColor="#00d4ff" stopOpacity="0" />
          <Stop offset="0.93" stopColor="#00d4ff" stopOpacity="0.18" />
          <Stop offset="0.98" stopColor="#8b4dff" stopOpacity="0.18" />
          <Stop offset="1" stopColor="#ff9a28" stopOpacity="0.06" />
        </RadialGradient>
        <LinearGradient id="targetHaloBlue" x1="18" x2="82" y1="12" y2="88">
          <Stop offset="0" stopColor="#8ffcff" />
          <Stop offset="0.45" stopColor="#00d4ff" />
          <Stop offset="1" stopColor="#2a8cff" />
        </LinearGradient>
        <LinearGradient id="targetHaloWarm" x1="26" x2="86" y1="88" y2="20">
          <Stop offset="0" stopColor="#9d4dff" />
          <Stop offset="0.45" stopColor="#ff9a28" />
          <Stop offset="1" stopColor="#ffd84a" />
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="50" fill="none" r="49" stroke="#00d4ff" strokeOpacity="0.16" strokeWidth="0.75" />
      <Path
        d="M 50 1 A 49 49 0 0 1 97.8 39.8"
        fill="none"
        stroke="url(#targetHaloBlue)"
        strokeLinecap="round"
        strokeOpacity="0.86"
        strokeWidth="1.35"
      />
      <Path
        d="M 97.5 58.4 A 49 49 0 0 1 58.4 97.5"
        fill="none"
        stroke="url(#targetHaloWarm)"
        strokeLinecap="round"
        strokeOpacity="0.8"
        strokeWidth="1.35"
      />
      <Path
        d="M 39 98 A 49 49 0 0 1 2 60"
        fill="none"
        stroke="#8b4dff"
        strokeLinecap="round"
        strokeOpacity="0.68"
        strokeWidth="1.25"
      />
      <Path
        d="M 3 39 A 49 49 0 0 1 38 3"
        fill="none"
        stroke="#00d4ff"
        strokeLinecap="round"
        strokeOpacity="0.68"
        strokeWidth="1.2"
      />
    </Svg>
  );
}

function HomeMenuIcon({
  size = 34,
  type,
}: {
  size?: number;
  type: 'scores' | 'settings' | 'soundOff' | 'soundOn';
}) {
  const accent = type === 'scores'
    ? '#ffd84a'
    : type === 'settings'
      ? '#8ffcff'
      : type === 'soundOn'
        ? '#8ffcff'
        : '#ff6b8f';
  const end = type === 'scores'
    ? '#ff9a28'
    : type === 'settings'
      ? '#00d4ff'
      : type === 'soundOn'
        ? '#00d4ff'
        : '#8b4dff';
  const gradientId = `homeMenuIcon-${type}`;
  const glowId = `homeMenuGlow-${type}`;

  return (
    <Svg height={size} viewBox="0 0 64 64" width={size}>
      <Defs>
        <RadialGradient cx="50%" cy="45%" id={glowId} r="56%">
          <Stop offset="0" stopColor={accent} stopOpacity="0.3" />
          <Stop offset="0.62" stopColor={end} stopOpacity="0.12" />
          <Stop offset="1" stopColor={end} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={gradientId} x1="12" x2="52" y1="10" y2="54">
          <Stop offset="0" stopColor="#f4ffff" />
          <Stop offset="0.36" stopColor={accent} />
          <Stop offset="1" stopColor={end} />
        </LinearGradient>
      </Defs>
      <Circle cx="32" cy="32" fill={`url(#${glowId})`} r="31" />
      {type === 'scores' ? (
        <>
          <Path
            d="M22 15h20v8.7c0 8.6-3.5 13.4-10 15.1-6.5-1.7-10-6.5-10-15.1Z"
            fill="rgba(255,216,74,0.18)"
            stroke={`url(#${gradientId})`}
            strokeLinejoin="round"
            strokeWidth="3.4"
          />
          <Path
            d="M22 20h-7.1c.2 8 3.1 12.5 8.7 13.5M42 20h7.1c-.2 8-3.1 12.5-8.7 13.5M32 38.8v7.6M24.5 50.5h15"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.4"
          />
          <Path d="M28 20h8" stroke="#fff7ba" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="2" />
        </>
      ) : null}
      {type === 'settings' ? (
        <>
          <Path
            d="M36.5 10.5 38.6 16a20 20 0 0 1 4.1 2.4l5.8-1.1 4.4 7.8-4 4.4a20 20 0 0 1 0 5l4 4.4-4.4 7.8-5.8-1.1a20 20 0 0 1-4.1 2.4l-2.1 5.5h-9L25.4 48a20 20 0 0 1-4.1-2.4l-5.8 1.1-4.4-7.8 4-4.4a20 20 0 0 1 0-5l-4-4.4 4.4-7.8 5.8 1.1a20 20 0 0 1 4.1-2.4l2.1-5.5Z"
            fill="rgba(117,247,255,0.1)"
            stroke={`url(#${gradientId})`}
            strokeLinejoin="round"
            strokeWidth="3.1"
          />
          <Circle cx="32" cy="32" fill="rgba(244,255,255,0.2)" r="7.2" />
          <Circle cx="32" cy="32" fill={accent} fillOpacity="0.42" r="3" />
        </>
      ) : null}
      {type === 'soundOn' || type === 'soundOff' ? (
        <>
          <Path
            d="M13 26h8l12-10v32L21 38h-8Z"
            fill="rgba(117,247,255,0.16)"
            stroke={`url(#${gradientId})`}
            strokeLinejoin="round"
            strokeWidth="3.2"
          />
          {type === 'soundOn' ? (
            <>
              <Path d="M39 24c4.2 4.3 4.2 11.7 0 16" fill="none" stroke={`url(#${gradientId})`} strokeLinecap="round" strokeWidth="3" />
              <Path d="M44.5 18c7.2 7.6 7.2 20.4 0 28" fill="none" stroke={`url(#${gradientId})`} strokeLinecap="round" strokeOpacity="0.72" strokeWidth="2.5" />
            </>
          ) : (
            <Path d="M40 24 52 40M52 24 40 40" stroke={`url(#${gradientId})`} strokeLinecap="round" strokeWidth="3.5" />
          )}
        </>
      ) : null}
    </Svg>
  );
}

function HomeFlyingArrow({
  delay,
  impactAngle,
  levelId,
  progress,
  targetRotation,
  targetCenterX,
  targetCenterY,
  targetRadius,
  travel,
}: {
  delay: number;
  impactAngle: number;
  levelId: number;
  progress: SharedValue<number>;
  targetRotation: SharedValue<number>;
  targetCenterX: number;
  targetCenterY: number;
  targetRadius: number;
  travel: number;
}) {
  const radians = (impactAngle * Math.PI) / 180;
  const outwardX = Math.sin(radians);
  const outwardY = -Math.cos(radians);
  const rotationAtImpact = ((delay + HOME_ARROW_IMPACT_MS) / HOME_TARGET_ROTATION_MS) * 360;
  const targetLocalImpactAngle = impactAngle - rotationAtImpact;
  const localImpactRad = ((targetLocalImpactAngle - 90) * Math.PI) / 180;
  const stuckPinX = targetRadius + Math.cos(localImpactRad) * targetRadius;
  const stuckPinY = targetRadius + Math.sin(localImpactRad) * targetRadius;
  const stuckPinStyle = {
    left: stuckPinX - PIN_W / 2,
    position: 'absolute' as const,
    top: stuckPinY - PIN_H / 2,
    transform: [
      { rotate: `${targetLocalImpactAngle + 180}deg` },
      { scale: HOME_ARROW_SCALE },
    ],
  };

  const flyingArrowStyle = useAnimatedStyle(() => {
    const activeTipOffset = (PIN_H / 2) * HOME_ARROW_SCALE;
    const activeCenterRadius = targetRadius + activeTipOffset;
    const hitX = targetCenterX + outwardX * activeCenterRadius - PIN_W / 2;
    const hitY = targetCenterY + outwardY * activeCenterRadius - PIN_H / 2;
    const startX = hitX + outwardX * travel;
    const startY = hitY + outwardY * travel;
    const flight = Math.min(progress.value / 0.24, 1);
    const opacity = progress.value >= 0.238 || progress.value <= 0.01
      ? 0
      : interpolate(progress.value, [0.01, 0.04, 0.238], [0, 1, 1]);

    return {
      opacity,
      transform: [
        { translateX: startX + (hitX - startX) * flight },
        { translateY: startY + (hitY - startY) * flight },
        { scale: HOME_ARROW_SCALE },
        { rotate: `${impactAngle + 180}deg` },
      ],
    };
  });

  const stuckOrbitStyle = useAnimatedStyle(() => {
    const opacity = progress.value < 0.238 ? 0 : 1;

    return {
      opacity,
      transform: [
        { rotate: `${targetRotation.value}deg` },
      ],
    };
  });

  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.homeArrow, flyingArrowStyle]}>
        <Pin launched levelId={levelId} mode="active" visualZone="learning" />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.homePinOrbit,
          {
            height: targetRadius * 2,
            left: targetCenterX - targetRadius,
            top: targetCenterY - targetRadius,
            width: targetRadius * 2,
          },
          stuckOrbitStyle,
        ]}
      >
        <Pin levelId={levelId} mode="placed" style={stuckPinStyle} visualZone="learning" />
      </Animated.View>
    </>
  );
}

function BlinkPlayIcon({ size }: { size: number }) {
  const pulse = useSharedValue(1);
  const glowOpacity = useSharedValue(0.28);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.035, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.99, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.42, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.22, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [glowOpacity, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View pointerEvents="none" style={styles.blinkPlayIcon}>
      <Animated.View style={[styles.playGlowLayer, glowStyle]}>
        <Svg height={size} viewBox="0 0 100 100" width={size}>
          <Defs>
            <RadialGradient cx="50%" cy="50%" id="playGlowOnly" r="50%">
              <Stop offset="0" stopColor="#b7ffff" stopOpacity="0.46" />
              <Stop offset="0.34" stopColor="#19e5ff" stopOpacity="0.28" />
              <Stop offset="0.72" stopColor="#2a8cff" stopOpacity="0.12" />
              <Stop offset="1" stopColor="#00aaff" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" fill="url(#playGlowOnly)" r="48" />
        </Svg>
      </Animated.View>
      <Svg height={size} viewBox="0 0 100 100" width={size}>
        <Defs>
          <LinearGradient id="playInnerGradient" x1="18" x2="82" y1="18" y2="82">
            <Stop offset="0" stopColor="#f4ffff" />
            <Stop offset="0.34" stopColor="#75f7ff" />
            <Stop offset="0.7" stopColor="#19e5ff" />
            <Stop offset="1" stopColor="#2a8cff" />
          </LinearGradient>
          <LinearGradient id="playGlassSurface" x1="24" x2="76" y1="14" y2="86">
            <Stop offset="0" stopColor="#163b52" stopOpacity="0.96" />
            <Stop offset="0.48" stopColor="#061a2b" stopOpacity="0.98" />
            <Stop offset="1" stopColor="#010712" stopOpacity="0.98" />
          </LinearGradient>
          <RadialGradient cx="48%" cy="43%" id="playCoreBloom" r="58%">
            <Stop offset="0" stopColor="#1adfff" stopOpacity="0.24" />
            <Stop offset="0.52" stopColor="#083456" stopOpacity="0.48" />
            <Stop offset="1" stopColor="#010714" stopOpacity="1" />
          </RadialGradient>
          <LinearGradient id="playArrowFace" x1="35" x2="74" y1="28" y2="69">
            <Stop offset="0" stopColor="#ffffff" />
            <Stop offset="0.58" stopColor="#eaffff" />
            <Stop offset="1" stopColor="#8ffcff" />
          </LinearGradient>
        </Defs>
        <Circle cx="50" cy="50" fill="url(#playCoreBloom)" r="42" />
        <Circle cx="50" cy="50" fill="url(#playGlassSurface)" r="36.5" />
        <Circle cx="50" cy="50" fill="none" r="37" stroke="#d8ffff" strokeOpacity="0.54" strokeWidth="1.8" />
        <Circle cx="50" cy="50" fill="none" r="31" stroke="url(#playInnerGradient)" strokeOpacity="0.72" strokeWidth="2.1" />
        <Circle cx="50" cy="50" fill="none" r="23.5" stroke="#f4ffff" strokeOpacity="0.1" strokeWidth="1" />
        <Path
          d="M 50 13 A 37 37 0 0 1 84 36"
          fill="none"
          stroke="#8ffcff"
          strokeLinecap="round"
          strokeOpacity="0.7"
          strokeWidth="3"
        />
        <Path
          d="M 84 65 A 37 37 0 0 1 61 84"
          fill="none"
          stroke="#ff9a28"
          strokeLinecap="round"
          strokeOpacity="0.72"
          strokeWidth="3"
        />
        <Path
          d="M 35 84 A 37 37 0 0 1 16 60"
          fill="none"
          stroke="#9d4dff"
          strokeLinecap="round"
          strokeOpacity="0.64"
          strokeWidth="3"
        />
        <Path
          d="M 18 41 A 37 37 0 0 1 38 16"
          fill="none"
          stroke="#2a8cff"
          strokeLinecap="round"
          strokeOpacity="0.5"
          strokeWidth="2.4"
        />
        <Path
          d="M40 31.5 69.5 50 40 68.5Z"
          fill="url(#playArrowFace)"
          stroke="#ffffff"
          strokeLinejoin="round"
          strokeWidth="3.4"
        />
        <Path
          d="M40 31.5 69.5 50 40 68.5Z"
          fill="none"
          stroke="#45ecff"
          strokeLinejoin="round"
          strokeOpacity="0.74"
          strokeWidth="1.5"
        />
        <Path
          d="M40 31.5 69.5 50 40 50Z"
          fill="#ffffff"
          opacity="0.16"
        />
        <Path
          d="M31 31 C39 24 53 21 65 27"
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeOpacity="0.16"
          strokeWidth="1.7"
        />
      </Svg>
    </View>
  );
}

function HomeShortcut({
  buttonSize,
  icon,
  label,
  onPress,
}: {
  buttonSize?: number;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  function handlePress() {
    sounds.button();
    onPress();
  }

  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      activeOpacity={0.82}
      onPress={handlePress}
      style={[
        styles.shortcutButton,
        buttonSize
          ? { borderRadius: buttonSize / 2, height: buttonSize, width: buttonSize }
          : null,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  homeTarget: {
    position: 'absolute',
  },
  homeArrow: {
    height: PIN_H,
    left: 0,
    position: 'absolute',
    top: 0,
    width: PIN_W,
  },
  homePinOrbit: {
    position: 'absolute',
  },
  playerStatsPanel: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    zIndex: 20,
  },
  playerStatItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 18, 42, 0.44)',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 92,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
  },
  playerStatItemTablet: {
    borderRadius: 20,
    minWidth: 128,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  playerStatLeft: {
    transform: [{ translateX: -4 }],
  },
  playerStatRight: {
    transform: [{ translateX: 4 }],
  },
  playerStatTextBlock: {
    alignItems: 'center',
    minWidth: 58,
  },
  quickIconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 18, 42, 0.72)',
    borderColor: 'rgba(117, 247, 255, 0.42)',
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    width: 42,
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 18, 42, 0.7)',
    borderColor: 'rgba(117, 247, 255, 0.38)',
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    width: 42,
    zIndex: 20,
  },
  shortcutPanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 18, 42, 0.38)',
    borderColor: 'rgba(117, 247, 255, 0.22)',
    borderRadius: 24,
    borderWidth: 1,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 13,
    paddingVertical: 9,
    position: 'absolute',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  blinkPlayIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
  },
  playGlowLayer: {
    position: 'absolute',
  },
  playRingLayer: {
    position: 'absolute',
  },
  targetPlayButton: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#8ffcff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: 18,
    zIndex: 30,
  },
  targetNeonBorder: {
    position: 'absolute',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
  },
  root: {
    backgroundColor: '#020615',
    flex: 1,
  },
  secondaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
    justifyContent: 'space-between',
    width: '100%',
  },
  safeArea: {
    flex: 1,
  },
  shortcutButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 18, 42, 0.72)',
    borderColor: 'rgba(117, 247, 255, 0.42)',
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    width: 42,
  },
  statLabel: {
    color: '#8ffcff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 212, 255, 0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statLabelTablet: {
    fontSize: 13,
  },
  statValue: {
    color: '#f4ffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 26,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 212, 255, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 9,
  },
  statValueTablet: {
    fontSize: 30,
    lineHeight: 32,
  },
});
