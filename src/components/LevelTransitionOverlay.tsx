import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type LevelTransitionOverlayProps = {
  level: number;
  onDone: () => void;
  visible: boolean;
  anchorY: number;
  anchorX: number;
};

const { height: SCREEN_H } = Dimensions.get('window');

const TOTAL_MS = 2250;
const CARD_W = 224;

export default function LevelTransitionOverlay({
  anchorX,
  anchorY,
  level,
  onDone,
  visible,
}: LevelTransitionOverlayProps) {
  const opacity    = useSharedValue(0);
  const scale      = useSharedValue(0.85);
  const translateY = useSharedValue(0);
  const tint       = getLevelTransitionColor(level);

  const timerRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (!visible) return;

    dismissedRef.current = false;
    opacity.value    = 0;
    scale.value      = 0.86;
    translateY.value = SCREEN_H - anchorY + 110;

    opacity.value = withSequence(
      withTiming(1,   { duration: 130, easing: Easing.out(Easing.cubic) }),
      withDelay(1850, withTiming(0,   { duration: 230, easing: Easing.in(Easing.cubic) })),
    );
    scale.value = withSequence(
      withTiming(1.05, { duration: 460, easing: Easing.out(Easing.back(1.35)) }),
      withTiming(1,    { duration: 180, easing: Easing.out(Easing.cubic) }),
    );
    translateY.value = withTiming(0, {
      duration: 560,
      easing: Easing.out(Easing.cubic),
    });

    timerRef.current = setTimeout(() => {
      if (!dismissedRef.current) runOnJS(onDone)();
    }, TOTAL_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorY, level, visible]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.titleWrap,
          {
            borderColor: tint.glow,
            left: anchorX - CARD_W / 2,
            shadowColor: tint.glow,
            top: anchorY - 42,
          },
          titleStyle,
        ]}
      >
        <Text style={[styles.title, { color: tint.text, textShadowColor: tint.glow }]}>LEVEL {level}</Text>
      </Animated.View>
    </View>
  );
}

function getLevelTransitionColor(level: number) {
  if (level <= 5)  return { text: '#f2fbff', glow: '#00d4ff', shadow: 'rgba(0,18,34,0.96)' };
  if (level <= 10) return { text: '#f7fff2', glow: '#00e87a', shadow: 'rgba(0,30,18,0.96)' };
  if (level <= 15) return { text: '#fff7ed', glow: '#ff8c00', shadow: 'rgba(42,18,0,0.96)' };
  if (level <= 20) return { text: '#fff5e8', glow: '#ffd35a', shadow: 'rgba(36,20,0,0.96)' };
  if (level <= 25) return { text: '#fff2ed', glow: '#ff4b24', shadow: 'rgba(42,8,0,0.96)' };
  if (level <= 35) return { text: '#fff2fb', glow: '#ff4fc8', shadow: 'rgba(34,0,28,0.96)' };
  if (level <= 45) return { text: '#f6fbff', glow: '#8bd6ff', shadow: 'rgba(3,12,24,0.96)' };
  return { text: '#fff4de', glow: '#ffd35a', shadow: 'rgba(4,4,8,0.98)' };
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 40,
  },
  titleWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 16, 38, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 76,
    paddingHorizontal: 18,
    paddingVertical: 13,
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.62,
    shadowRadius: 16,
    width: CARD_W,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
