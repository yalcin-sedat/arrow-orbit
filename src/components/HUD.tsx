// HUD — lives hearts (left) + level (center)
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { Svg, Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { strings } from '../data/strings';

type HUDProps = {
  heartScale?: SharedValue<number>;
  lives: number;       // 1 = protected, 0 = next mistake ends the game
  level?: number;
  score?: number;
  streak?: number;     // accepted but not displayed
};

function Hearts({ heartScale, lives }: { heartScale?: SharedValue<number>; lives: number }) {
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale?.value ?? 1 }],
  }));

  return (
    <View style={styles.heartsRow}>
      <Animated.View style={heartStyle}>
        <HeartIcon color={lives > 0 ? colors.heartFull : colors.heartEmpty} size={22} />
      </Animated.View>
    </View>
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

function StarIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.2 14.9 8l6.4.9-4.6 4.5 1.1 6.4L12 16.8 6.2 19.8l1.1-6.4L2.7 8.9 9.1 8 12 2.2Z"
        fill={colors.neonGold}
      />
      <Path
        d="M12 5.7 13.8 9.5l4.1.6-3 2.9.7 4.1-3.6-1.9-3.6 1.9.7-4.1-3-2.9 4.1-.6L12 5.7Z"
        fill="rgba(255,255,255,0.32)"
      />
    </Svg>
  );
}

export default function HUD({ heartScale, lives, level = 1, score = 0 }: HUDProps) {
  return (
    <View style={styles.container}>
      <View style={styles.block} />

      {/* Center: level */}
      <View style={[styles.block, styles.center]}>
        <Text style={styles.levelText}>{strings.levelLabel(level)}</Text>
        <Hearts heartScale={heartScale} lives={lives} />
        <View style={styles.scoreRow}>
          <View style={styles.scoreStar}>
            <StarIcon size={24} />
          </View>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      <View style={styles.block} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 8,
  },
  block: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    alignItems: 'center',
    transform: [{ translateY: 2 }],
  },
  heartsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  levelText: {
    color: colors.neonBlue,
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-condensed',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 3.5,
    marginTop: 10,
  },
  scoreText: {
    color: '#fff8d8',
    fontSize: 30,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 206, 76, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 6,
  },
  scoreStar: {
    shadowColor: colors.neonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.78,
    shadowRadius: 8,
  },
});
