import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LEVELS } from '../data/levels';
import { strings } from '../data/strings';
import { colors } from '../theme/colors';

type LevelScreenProps = {
  focusedLevelId?: number;
  highestUnlockedLevel: number;
  onBack: () => void;
  onSelectLevel: (levelId: number) => void;
};

const COLUMNS = 4;
const TILE_SIZE_REFERENCE_COLUMNS = 5;
const SECTOR_SIZE = 10;
const SECTOR_COLORS = [
  colors.neonGreen,
  colors.neonBlue,
  colors.neonPurple,
  '#ff3366',
  '#ff7a00',
] as const;

function getSectorAccent(levelId: number) {
  const sectorIndex = Math.floor((levelId - 1) / SECTOR_SIZE);
  return SECTOR_COLORS[sectorIndex % SECTOR_COLORS.length];
}

export default function LevelScreen({
  focusedLevelId,
  highestUnlockedLevel,
  onBack,
  onSelectLevel,
}: LevelScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [scrollContentHeight, setScrollContentHeight] = useState(0);
  const [scrollViewportHeight, setScrollViewportHeight] = useState(0);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 28, 430);
  const gap = 10;
  const tileSize = Math.floor((contentWidth - gap * (TILE_SIZE_REFERENCE_COLUMNS - 1)) / TILE_SIZE_REFERENCE_COLUMNS);
  const columnGap = Math.floor((contentWidth - tileSize * COLUMNS) / (COLUMNS - 1));
  const rowGap = Math.round(tileSize * 0.62);
  const activeLevelId = Math.min(
    LEVELS.length,
    Math.max(1, focusedLevelId ?? highestUnlockedLevel),
  );

  const rows = useMemo(() => {
    const grouped = [];

    for (let index = 0; index < LEVELS.length; index += COLUMNS) {
      const chunk = LEVELS.slice(index, index + COLUMNS);
      const rowIndex = index / COLUMNS;
      grouped.push(rowIndex % 2 === 0 ? chunk : [...chunk].reverse());
    }

    return grouped;
  }, []);

  useEffect(() => {
    if (scrollViewportHeight <= 0 || scrollContentHeight <= 0) return undefined;

    const rowIndex = Math.floor((activeLevelId - 1) / COLUMNS);
    const gridTopPadding = 4;
    const rowStride = tileSize + rowGap;
    const tileCenterY = gridTopPadding + rowIndex * rowStride + tileSize / 2;
    const maxScrollY = Math.max(0, scrollContentHeight - scrollViewportHeight);
    const targetY = Math.min(
      maxScrollY,
      Math.max(0, tileCenterY - scrollViewportHeight / 2),
    );
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ animated: false, y: targetY });
    }, 40);

    return () => clearTimeout(timer);
  }, [activeLevelId, rowGap, scrollContentHeight, scrollViewportHeight, tileSize]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { width: contentWidth }]}>
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={onBack}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{strings.levelsTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.subtitle}>
          {strings.levelLabel(activeLevelId)}
        </Text>

        <ScrollView
          ref={scrollRef}
          alwaysBounceVertical
          contentContainerStyle={[styles.grid, { rowGap, width: contentWidth }]}
          onContentSizeChange={(_, contentHeight) => setScrollContentHeight(contentHeight)}
          onLayout={(event) => setScrollViewportHeight(event.nativeEvent.layout.height)}
          style={[styles.scrollArea, { width: contentWidth }]}
          showsVerticalScrollIndicator={false}
        >
          {rows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={[styles.levelRow, { gap: columnGap }]}>
              {row.map((level, columnIndex) => {
                const isUnlocked = level.id <= highestUnlockedLevel;
                const isCompleted = level.id < highestUnlockedLevel;
                const isCurrent = level.id === activeLevelId;
                const sectorAccent = getSectorAccent(level.id);
                const hasHorizontalConnector = columnIndex < row.length - 1;
                const nextVisualLevel = row[columnIndex + 1];
                const isHorizontalLinked = Boolean(
                  nextVisualLevel && Math.max(level.id, nextVisualLevel.id) <= highestUnlockedLevel,
                );
                const isRowTurn = rowIndex % 2 === 0
                  ? columnIndex === row.length - 1
                  : columnIndex === 0;
                const hasNextRow = rowIndex < rows.length - 1;
                const isVerticalLinked = level.id + 1 <= highestUnlockedLevel;

                return (
                  <View
                    key={level.id}
                    style={[
                      styles.tileSlot,
                      {
                        height: tileSize,
                        width: tileSize,
                      },
                    ]}
                  >
                    {hasHorizontalConnector && (
                      <ChainConnector
                        active={isHorizontalLinked}
                        activeColor={sectorAccent}
                        direction="right"
                        fromId={level.id}
                        highestUnlocked={highestUnlockedLevel}
                        offset={columnGap}
                        phaseOffset={(level.id * 137) % 900}
                        toId={nextVisualLevel?.id ?? level.id + 1}
                      />
                    )}
                    {isRowTurn && hasNextRow && (
                      <VerticalConnector
                        active={isCompleted && isVerticalLinked}
                        activeColor={sectorAccent}
                        highestUnlocked={highestUnlockedLevel}
                        offset={rowGap}
                        phaseOffset={(level.id * 137 + 450) % 900}
                        targetId={level.id + 1}
                      />
                    )}
                    <TouchableOpacity
                      activeOpacity={isUnlocked ? 0.78 : 1}
                      disabled={!isUnlocked}
                      onPress={() => onSelectLevel(level.id)}
                      style={[
                        styles.tile,
                        {
                          height: tileSize,
                          width: tileSize,
                        },
                        isUnlocked ? styles.tileUnlocked : styles.tileLocked,
                        isCompleted && {
                          backgroundColor: `${sectorAccent}20`,
                          borderColor: `${sectorAccent}99`,
                          shadowColor: sectorAccent,
                          shadowOpacity: 0.34,
                          shadowRadius: 10,
                        },
                        isCurrent && styles.tileCurrent,
                        isCurrent && {
                          backgroundColor: `${colors.neonGold}20`,
                          borderColor: colors.neonGold,
                          shadowColor: colors.neonGold,
                        },
                      ]}
                    >
                      {isCurrent && (
                        <View
                          pointerEvents="none"
                          style={[
                            styles.currentGlow,
                            {
                              backgroundColor: `${colors.neonGold}14`,
                              shadowColor: colors.neonGold,
                            },
                          ]}
                        />
                      )}
                      <Text
                        style={[
                          styles.tileNumber,
                          !isUnlocked && styles.tileNumberLocked,
                          isCompleted && { color: '#f4ffff' },
                        ]}
                      >
                        {level.id}
                      </Text>
                      {!isUnlocked && (
                        <View style={styles.lockBadge}>
                          <LockIcon color="rgba(230,246,255,0.34)" size={20} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ChainConnector({
  active,
  activeColor,
  direction,
  fromId,
  highestUnlocked,
  offset,
  phaseOffset,
  toId,
}: {
  active: boolean;
  activeColor: string;
  direction: 'left' | 'right';
  fromId: number;
  highestUnlocked: number;
  offset: number;
  phaseOffset: number;
  toId: number;
}) {
  const isForward     = fromId < toId;
  const shouldAnimate = active && Math.max(fromId, toId) < highestUnlocked;

  const progress = useSharedValue(phaseOffset);

  useEffect(() => {
    cancelAnimation(progress);
    if (shouldAnimate) {
      progress.value = phaseOffset;
      progress.value = withRepeat(
        withTiming(phaseOffset + 900, { duration: 900, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      progress.value = 450; // cycle%900=450 → merkez konumu
    }
  }, [shouldAnimate, phaseOffset]);

  const span = offset + 16; // -8 → offset+8 aralığı, her iki uç overflow:hidden ile kırpılır

  const dotAnimStyle = useAnimatedStyle(() => {
    const cycle = progress.value % 900;
    const x = isForward
      ? (cycle / 900) * span - 8
      : offset + 8 - (cycle / 900) * span;
    return { transform: [{ translateX: x }] };
  });

  const lineColor = active ? `${activeColor}8f` : 'rgba(230,246,255,0.1)';
  const dotColor  = active ? activeColor : 'rgba(230,246,255,0.18)';

  return (
    <View
      pointerEvents="none"
      style={[
        styles.chainConnector,
        { [direction]: -offset, width: offset, overflow: 'hidden' },
      ]}
    >
      <View style={[styles.orbitLine, { backgroundColor: lineColor, shadowColor: dotColor }]} />
      <Animated.View
        style={[
          styles.orbitDot,
          { backgroundColor: dotColor, shadowColor: dotColor, left: 0, top: 5, opacity: active ? 1 : 0.18 },
          dotAnimStyle,
        ]}
      />
    </View>
  );
}

function VerticalConnector({
  active,
  activeColor,
  highestUnlocked,
  offset,
  phaseOffset,
  targetId,
}: {
  active: boolean;
  activeColor: string;
  highestUnlocked: number;
  offset: number;
  phaseOffset: number;
  targetId: number;
}) {
  const shouldAnimate = active && targetId < highestUnlocked;

  const progress = useSharedValue(phaseOffset);

  useEffect(() => {
    cancelAnimation(progress);
    if (shouldAnimate) {
      progress.value = phaseOffset;
      progress.value = withRepeat(
        withTiming(phaseOffset + 900, { duration: 900, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      progress.value = 450;
    }
  }, [shouldAnimate, phaseOffset]);

  const span = offset + 16;

  const dotAnimStyle = useAnimatedStyle(() => {
    const cycle = progress.value % 900;
    return { transform: [{ translateY: (cycle / 900) * span - 8 }] };
  });

  const lineColor = active ? `${activeColor}8f` : 'rgba(230,246,255,0.1)';
  const dotColor  = active ? activeColor : 'rgba(230,246,255,0.18)';

  return (
    <View
      pointerEvents="none"
      style={[
        styles.verticalConnector,
        { bottom: -offset, height: offset, overflow: 'hidden' },
      ]}
    >
      <View style={[styles.verticalOrbitLine, { backgroundColor: lineColor, shadowColor: dotColor }]} />
      <Animated.View
        style={[
          styles.orbitDot,
          { backgroundColor: dotColor, shadowColor: dotColor, top: 0, left: 0, opacity: active ? 1 : 0.18 },
          dotAnimStyle,
        ]}
      />
    </View>
  );
}

function LockIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M7.5 10V8.2C7.5 5.7 9.4 4 12 4s4.5 1.7 4.5 4.2V10"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2.3"
      />
      <Path
        d="M6.8 10h10.4c.8 0 1.4.6 1.4 1.4v6c0 .8-.6 1.4-1.4 1.4H6.8c-.8 0-1.4-.6-1.4-1.4v-6c0-.8.6-1.4 1.4-1.4Z"
        fill="rgba(230,246,255,0.05)"
        stroke={color}
        strokeWidth="2.1"
      />
      <Circle cx="12" cy="14.6" fill={color} r="1.3" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#020615',
    flex: 1,
  },
  safe: {
    alignItems: 'center',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,212,255,0.12)',
    borderColor: 'rgba(117,247,255,0.32)',
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backText: {
    color: '#dffbff',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 36,
    marginTop: -3,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  subtitle: {
    color: colors.neonGold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
    marginTop: 6,
  },
  grid: {
    flexDirection: 'column',
    paddingBottom: 42,
    paddingTop: 4,
  },
  levelRow: {
    flexDirection: 'row',
  },
  scrollArea: {
    flex: 1,
  },
  chainConnector: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -9 }],
    zIndex: 0,
  },
  orbitDot: {
    borderRadius: 4,
    height: 8,
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 6,
    width: 8,
  },
  orbitLine: {
    borderRadius: 2,
    height: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 5,
    width: '100%',
  },
  verticalConnector: {
    alignItems: 'center',
    justifyContent: 'center',
    left: '50%',
    position: 'absolute',
    transform: [{ translateX: -4 }],
    width: 8,
    zIndex: 0,
  },
  verticalOrbitLine: {
    borderRadius: 2,
    height: '100%',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 5,
    width: 3,
  },
  currentGlow: {
    backgroundColor: 'rgba(255,216,74,0.08)',
    borderRadius: 999,
    bottom: -12,
    left: -12,
    position: 'absolute',
    right: -12,
    shadowColor: colors.neonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    top: -12,
  },
  lockBadge: {
    alignItems: 'center',
    bottom: 11,
    height: 22,
    justifyContent: 'center',
    position: 'absolute',
    width: 22,
  },
  tile: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 1,
  },
  tileSlot: {
    overflow: 'visible',
  },
  tileUnlocked: {
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderColor: 'rgba(117,247,255,0.5)',
    shadowColor: colors.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  tileLocked: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: 'rgba(230,246,255,0.1)',
  },
  tileCompleted: {
    backgroundColor: 'rgba(0,255,136,0.13)',
    borderColor: 'rgba(0,255,136,0.52)',
  },
  tileCurrent: {
    borderColor: colors.neonGold,
    shadowColor: colors.neonGold,
    shadowOpacity: 0.62,
    shadowRadius: 16,
  },
  tileNumber: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  tileNumberLocked: {
    color: 'rgba(230,246,255,0.18)',
    fontSize: 22,
    transform: [{ translateY: -10 }],
  },
  tileNumberCompleted: {
    color: '#d7ffe8',
  },
});
