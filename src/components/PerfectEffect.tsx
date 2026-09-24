import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

const TARGET_BOTTOM_Y = height * 0.38 + 115;
const PIN_LAUNCH_Y = height * 0.78;
const EFFECT_Y = TARGET_BOTTOM_Y + (PIN_LAUNCH_Y - TARGET_BOTTOM_Y) * 0.24;
const HUD_SCORE_Y = 132;
const HUD_SCORE_X_OFFSET = 18;
const BONUS_TOP = 57;
const BONUS_TEXT_CENTER_OFFSET = 12;

export default function PerfectEffect({
  bonusScore,
  level,
  triggerKey,
}: {
  bonusScore: number;
  level: number;
  triggerKey: number;
}) {
  const tint = getPerfectTint(level);
  const scale = useSharedValue(0.72);
  const opacity = useSharedValue(0);
  const bonusOpacity = useSharedValue(1);
  const bonusScale = useSharedValue(1);
  const bonusX = useSharedValue(0);
  const bonusY = useSharedValue(0);

  useEffect(() => {
    if (triggerKey === 0) return;
    scale.value = 0.72;
    opacity.value = 0;
    bonusOpacity.value = 1;
    bonusScale.value = 1;
    bonusX.value = 0;
    bonusY.value = 0;

    scale.value = withSequence(
      withTiming(1.06, { duration: 180, easing: Easing.out(Easing.back(1.35)) }),
      withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }),
      withTiming(1.03, { duration: 360, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: 360, easing: Easing.inOut(Easing.sin) }),
      withDelay(420, withTiming(0.98, { duration: 260, easing: Easing.in(Easing.cubic) })),
    );

    opacity.value = withSequence(
      withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) }),
      withTiming(0.62, { duration: 180, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: 200, easing: Easing.inOut(Easing.sin) }),
      withDelay(1780, withTiming(0, { duration: 360, easing: Easing.in(Easing.cubic) })),
    );

    bonusX.value = withDelay(
      1120,
      withTiming(HUD_SCORE_X_OFFSET, { duration: 620, easing: Easing.inOut(Easing.cubic) }),
    );
    bonusY.value = withDelay(
      1120,
      withTiming(
        HUD_SCORE_Y - EFFECT_Y - BONUS_TOP - BONUS_TEXT_CENTER_OFFSET,
        { duration: 620, easing: Easing.inOut(Easing.cubic) },
      ),
    );
    bonusScale.value = withDelay(
      1120,
      withTiming(0.72, { duration: 620, easing: Easing.inOut(Easing.cubic) }),
    );
    bonusOpacity.value = withSequence(
      withDelay(1540, withTiming(1, { duration: 1 })),
      withTiming(0, { duration: 260, easing: Easing.in(Easing.cubic) }),
    );
  }, [triggerKey]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const bonusStyle = useAnimatedStyle(() => ({
    opacity: bonusOpacity.value,
    transform: [
      { translateX: bonusX.value },
      { translateY: bonusY.value },
      { scale: bonusScale.value },
    ],
  }));

  return (
    <View pointerEvents="none" style={styles.wrapper}>
      <Animated.View style={[styles.anchor, textStyle]}>
        <View style={styles.textWrapper}>
          <Text
            style={[
              styles.text,
              styles.glowText,
              {
                color: tint.glow,
                textShadowColor: tint.glow,
              },
            ]}
          >
            PERFECT!
          </Text>
          <Text
            style={[
              styles.text,
              styles.mainText,
              {
                color: tint.text,
                textShadowColor: tint.glow,
              },
            ]}
          >
            PERFECT!
          </Text>
          <Animated.Text
            style={[
              styles.bonusText,
              {
                color: '#ffd84a',
                textShadowColor: '#ffd84a',
              },
              bonusStyle,
            ]}
          >
            +{bonusScore} ★
          </Animated.Text>
        </View>
      </Animated.View>
    </View>
  );
}

function getPerfectTint(level: number) {
  if (level <= 5) return { text: '#f7fdff', glow: '#00d4ff' };
  if (level <= 10) return { text: '#f6fff8', glow: '#00ff88' };
  if (level <= 15) return { text: '#fff7ef', glow: '#ff8c00' };
  if (level <= 20) return { text: '#fffbe9', glow: '#ffd84a' };
  if (level <= 25) return { text: '#fff1ed', glow: '#ff4b24' };
  if (level <= 30) return { text: '#f8f0ff', glow: '#b455ff' };
  if (level <= 40) return { text: '#fff0f8', glow: '#ff3366' };
  if (level <= 45) return { text: '#f6fbff', glow: '#8bd6ff' };
  return { text: '#fff4de', glow: '#ffd35a' };
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: EFFECT_Y,
    zIndex: 40,
  },
  anchor: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 92,
    minWidth: 230,
  },
  text: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2.4,
  },
  glowText: {
    color: '#ffffff',
    opacity: 0.65,
    position: 'absolute',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  mainText: {
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  bonusText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
    position: 'absolute',
    top: BONUS_TOP,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
