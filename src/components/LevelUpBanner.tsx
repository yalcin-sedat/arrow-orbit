import React, { useEffect } from 'react';
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
import { colors } from '../theme/colors';

type LevelUpBannerProps = {
  level: number;
  visible: boolean;
  onDone: () => void;
};

const { width, height } = Dimensions.get('window');
const BANNER_H = 96;
const TOTAL_MS = 1380;
const RISE_PX = 44;

export default function LevelUpBanner({ level, visible, onDone }: LevelUpBannerProps) {
  const translateY = useSharedValue(RISE_PX);
  const opacity    = useSharedValue(0);
  const scale      = useSharedValue(0.94);

  useEffect(() => {
    if (!visible) return;

    translateY.value = withSequence(
      withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }),
      withDelay(900,
        withTiming(RISE_PX, { duration: 260, easing: Easing.in(Easing.cubic) }),
      ),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 170 }),
      withDelay(930,
        withTiming(0, { duration: 260 }),
      ),
    );
    scale.value = withSequence(
      withTiming(1.03, { duration: 180, easing: Easing.out(Easing.back(1.4)) }),
      withTiming(1, { duration: 130, easing: Easing.out(Easing.cubic) }),
      withDelay(820, withTiming(0.96, { duration: 220, easing: Easing.in(Easing.cubic) })),
    );

    const timer = setTimeout(() => runOnJS(onDone)(), TOTAL_MS);
    return () => clearTimeout(timer);
  }, [visible, level]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity:   opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.banner, animStyle]}>
      <View style={styles.rule} />
      <Text style={styles.complete}>LEVEL COMPLETE</Text>
      <Text style={styles.next}>
        NEXT <Text style={styles.num}>LEVEL {level + 1}</Text>
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(4, 8, 24, 0.9)',
    borderColor: 'rgba(255, 215, 0, 0.72)',
    borderRadius: 18,
    borderWidth: 1.5,
    height: BANNER_H,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: colors.neonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.68,
    shadowRadius: 18,
    top: height * 0.62 - BANNER_H,
    width: Math.min(width * 0.78, 330),
    elevation: 14,
    zIndex: 50,
  },
  complete: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    textShadowColor: colors.neonGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    textTransform: 'uppercase',
  },
  next: {
    color: 'rgba(223, 251, 255, 0.74)',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 7,
  },
  num: {
    color: '#ffd75a',
    fontWeight: '900',
    textShadowColor: colors.neonGold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  rule: {
    backgroundColor: colors.neonGold,
    borderRadius: 3,
    height: 4,
    marginBottom: 10,
    shadowColor: colors.neonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    width: 124,
  },
});
