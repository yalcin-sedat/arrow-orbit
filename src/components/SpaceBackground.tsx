import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';
import { Svg, Path } from 'react-native-svg';
import { VisualZone } from '../theme/colors';

const bandBackgrounds = [
  { maxLevel: 5, base: '#061728', wash: '#00d4ff', glow: '#5528ff' },
  { maxLevel: 10, base: '#071c17', wash: '#b8ff3d', glow: '#ffd45a' },
  { maxLevel: 15, base: '#170d08', wash: '#ff7a00', glow: '#ff3300' },
  { maxLevel: 20, base: '#071724', wash: '#8cecff', glow: '#3a8cff' },
  { maxLevel: 25, base: '#12091f', wash: '#cc5cff', glow: '#00d4ff' },
  { maxLevel: 30, base: '#06182a', wash: '#2aa8ff', glow: '#00eaff' },
  { maxLevel: 35, base: '#1b0718', wash: '#ff3bbf', glow: '#bf5fff' },
  { maxLevel: 40, base: '#1a1206', wash: '#ffd35a', glow: '#ff8c00' },
  { maxLevel: 45, base: '#18080d', wash: '#ff3355', glow: '#ff7a00' },
  { maxLevel: 50, base: '#070812', wash: '#8b5cff', glow: '#ff8c00' },
] as const;

// --- Yıldız verileri (render'da değişmez) ---

type StarDef = {
  x: number;
  y: number;
  size: number;
  color: string;
  twinkleIdx: number | null; // hangi opacity SV kullanacak (null = statik)
  driftIdx: number | null;   // hangi translateY SV kullanacak
};

function buildStars(width: number, height: number): StarDef[] {
  // Deterministic pseudo-random (LCG) — her çağrıda aynı seriyi üretir
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  const stars: StarDef[] = [];
  const twinkleSlots = 5;
  const driftSlots   = 3;
  let twinkleCount = 0;
  let driftCount   = 0;

  for (let i = 0; i < 68; i++) {
    const x    = rand() * width;
    const y    = rand() * height;
    const size = 1.5 + rand() * 1.5; // 1.5-3px
    const blue = rand() > 0.6;
    const color = blue ? '#a8d8ff' : '#ffffff';

    const canTwinkle = twinkleCount < twinkleSlots && rand() > 0.75;
    const canDrift   = !canTwinkle && driftCount < driftSlots && rand() > 0.85;

    stars.push({
      x, y, size, color,
      twinkleIdx: canTwinkle ? twinkleCount++ : null,
      driftIdx:   canDrift   ? driftCount++   : null,
    });
  }
  return stars;
}

// --- Twinkle hook: 5 shared values ---
function useTwinkle() {
  const v0 = useSharedValue(1);
  const v1 = useSharedValue(1);
  const v2 = useSharedValue(1);
  const v3 = useSharedValue(1);
  const v4 = useSharedValue(1);

  const svs = [v0, v1, v2, v3, v4];

  React.useEffect(() => {
    const durations = [2200, 3100, 2700, 3800, 2500];
    svs.forEach((sv, i) => {
      sv.value = withRepeat(
        withSequence(
          withTiming(0.25, { duration: durations[i] / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(1,    { duration: durations[i] / 2, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    });
  }, []);

  return svs;
}

// --- Drift hook: 3 shared values ---
function useDrift(height: number) {
  const v0 = useSharedValue(0);
  const v1 = useSharedValue(0);
  const v2 = useSharedValue(0);

  const svs = [v0, v1, v2];
  const durations = [9000, 11500, 8200];

  React.useEffect(() => {
    svs.forEach((sv, i) => {
      sv.value = withRepeat(
        withTiming(height, { duration: durations[i], easing: Easing.linear }),
        -1,
        false,
      );
    });
  }, []);

  return svs;
}

// --- Star component ---
type StarProps = {
  def: StarDef;
  height: number;
  twinkleSVs: SharedValue<number>[];
  driftSVs: SharedValue<number>[];
};

function Star({ def, height, twinkleSVs, driftSVs }: StarProps) {
  const twinkleSV = def.twinkleIdx !== null ? twinkleSVs[def.twinkleIdx] : null;
  const driftSV   = def.driftIdx   !== null ? driftSVs[def.driftIdx]     : null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const style = useAnimatedStyle(() => {
    return {
      opacity:   twinkleSV ? twinkleSV.value : 0.7,
      transform: driftSV
        ? [{ translateY: driftSV.value % height }]
        : [],
    };
  });

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left:         def.x - def.size / 2,
          top:          def.y - def.size / 2,
          width:        def.size,
          height:       def.size,
          borderRadius: def.size / 2,
          backgroundColor: def.color,
        },
        style,
      ]}
    />
  );
}

// --- Ana component ---
type SpaceBackgroundProps = {
  levelId?: number;
  visualZone?: VisualZone;
};

export default function SpaceBackground({ levelId = 1, visualZone = 'learning' }: SpaceBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const stars      = useMemo(() => buildStars(width, height), [height, width]);
  const twinkleSVs = useTwinkle();
  const driftSVs   = useDrift(height);
  const background = getBandBackground(levelId);

  return (
    <View style={[styles.root, { backgroundColor: background.base }]} pointerEvents="none">
      <View style={[styles.zoneWash, { backgroundColor: background.wash }]} />
      <View style={[styles.bottomGlow, { backgroundColor: background.glow }]} />
      <View style={styles.moon}>
        <Svg width={56} height={56} viewBox="0 0 56 56">
          <Path
            d="M34 8C22 12 14 23 16 35c2 11 12 18 23 16-8-4-13-12-13-21 0-9 3-17 8-22Z"
            fill="#fff3b0"
            opacity={0.95}
          />
        </Svg>
      </View>
      {stars.map((def, i) => (
        <Star key={i} def={def} height={height} twinkleSVs={twinkleSVs} driftSVs={driftSVs} />
      ))}
    </View>
  );
}

function getBandBackground(levelId: number) {
  return bandBackgrounds.find((band) => levelId <= band.maxLevel) ?? bandBackgrounds[bandBackgrounds.length - 1];
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
  },
  moon: {
    opacity: 0.86,
    position: 'absolute',
    right: 24,
    shadowColor: '#fff3b0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    top: 76,
  },
  zoneWash: {
    bottom: 0,
    left: 0,
    opacity: 0.08,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  bottomGlow: {
    borderRadius: 260,
    bottom: -180,
    height: 310,
    left: -70,
    opacity: 0.1,
    position: 'absolute',
    right: -70,
  },
});
