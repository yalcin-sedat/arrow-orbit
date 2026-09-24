// Dönen hedef diski — sade arcade SVG, ülke dilimi yok
// rotation: GameScreen'den gelen SharedValue; GameScreen rotasyonu yönetir.
import React, { useEffect } from 'react';
import { ImageSourcePropType, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Svg, Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { VisualZone, zoneColors } from '../theme/colors';

const TARGET_IMAGE_SCALE = 1.18;

const TARGET_IMAGE_LEVEL_01 = require('../../assets/target_assets/level_variants_simple_bright_preview/level_01.png');
const TARGET_IMAGE_LEVEL_02 = require('../../assets/target_assets/level_variants_simple_bright_preview/level_02.png');
const TARGET_IMAGE_LEVEL_03 = require('../../assets/target_assets/level_variants_simple_bright_preview/level_03.png');
const TARGET_IMAGE_LEVEL_04 = require('../../assets/target_assets/level_variants_simple_bright_preview/level_04.png');
const TARGET_IMAGE_LEVEL_05 = require('../../assets/target_assets/level_variants_simple_bright_preview/level_05.png');
const TARGET_IMAGE_LEVEL_06 = require('../../assets/target_assets/level_variants_simple_bright_preview/level_06.png');
const TARGET_IMAGE_LEVEL_07 = require('../../assets/target_assets/level_variants_simple_bright_preview/level_07.png');
const TARGET_IMAGE_LEVEL_08 = require('../../assets/target_assets/level_variants_simple_bright_preview/level_08.png');
const TARGET_IMAGE_LEVEL_09 = require('../../assets/target_assets/level_variants_simple_bright_preview/level_09.png');
const TARGET_IMAGE_LEVEL_10 = require('../../assets/target_assets/level_variants_simple_bright_preview/level_10.png');
const TARGET_IMAGE_LEVEL_11_15 = require('../../assets/target_assets/generated_targets/generated_target_03.png');
const TARGET_IMAGE_LEVEL_16_20 = require('../../assets/target_assets/generated_targets/generated_target_04.png');
const TARGET_IMAGE_LEVEL_21_25 = require('../../assets/target_assets/generated_targets/generated_target_05.png');
const TARGET_IMAGE_LEVEL_26_30 = require('../../assets/target_assets/generated_targets/generated_target_06.png');
const TARGET_IMAGE_LEVEL_31_35 = require('../../assets/target_assets/generated_targets/generated_target_07.png');
const TARGET_IMAGE_LEVEL_36_40 = require('../../assets/target_assets/generated_targets/generated_target_08.png');
const TARGET_IMAGE_LEVEL_41_45 = require('../../assets/target_assets/generated_targets/generated_target_09.png');
const TARGET_IMAGE_LEVEL_46_50 = require('../../assets/target_assets/generated_targets/generated_target_10.png');

type TargetProps = {
  rotation: SharedValue<number>;
  radius?: number;
  remainingPins?: number;
  levelId?: number;
  visualZone?: VisualZone;
  style?: StyleProp<ViewStyle>;
};

export default function Target({
  rotation,
  radius = 130,
  remainingPins,
  levelId = 1,
  visualZone = 'learning',
  style,
}: TargetProps) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // rotation.value * -1 ile negatif değerlerde "--180deg" hatası önlenir
  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * -1}deg` }],
  }));

  // İsabetli atışta sayıya kısa pulse
  const numScale = useSharedValue(1);
  useEffect(() => {
    if (remainingPins === undefined) return;
    numScale.value = withSequence(
      withTiming(1.5, { duration: 80,  easing: Easing.out(Easing.quad) }),
      withTiming(1,   { duration: 160, easing: Easing.in(Easing.quad) }),
    );
  }, [remainingPins]);

  const numScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numScale.value }],
  }));

  const size    = radius * 2;
  const c       = radius;
  const r       = radius - 4;
  const centerR = Math.round(r * 0.38); // iç yardımcı halkayla aynı yarıçap
  const targetImage = getTargetImage(levelId);
  const zone = zoneColors[visualZone];
  const counterTheme = getCounterTheme(levelId);
  const isBossShape = levelId >= 41;
  const shapeBand = levelId <= 10
    ? 'disk'
    : levelId <= 20
      ? 'ring'
      : levelId <= 30
        ? 'badge'
        : levelId <= 40
          ? 'doubleRing'
          : 'arena';

  const badgePoints = Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 8 - Math.PI / 8;
    const pr = i % 2 === 0 ? r : r * 0.88;
    return `${c + Math.cos(angle) * pr},${c + Math.sin(angle) * pr}`;
  }).join(' ');

  const ticks = Array.from({ length: 24 }, (_, i) => {
    const angleDeg = i * 15 - 90;
    const rad = (angleDeg * Math.PI) / 180;
    const isMajor = i % 2 === 0;
    const r1 = r - 2;
    const r2 = r - (isMajor ? 14 : 7);
    return {
      x1: c + r1 * Math.cos(rad),
      y1: c + r1 * Math.sin(rad),
      x2: c + r2 * Math.cos(rad),
      y2: c + r2 * Math.sin(rad),
      stroke: isMajor ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.18)',
      strokeWidth: isMajor ? 2 : 1,
    };
  });

  if (targetImage) {
    return (
      <Animated.View style={[{ width: size, height: size }, animStyle, style]}>
        <Animated.Image
          resizeMode="contain"
          source={targetImage}
          style={styles.targetImage}
        />

        {/* Sayı: disk dönüşünü iptal eden katman + isabetli atışta pulse */}
        {remainingPins !== undefined && (
          <Animated.View
            pointerEvents="none"
            style={[{
              position: 'absolute',
              width: size,
              height: size,
              alignItems: 'center',
              justifyContent: 'center',
            }, counterStyle]}
          >
            <Animated.View style={numScaleStyle}>
              <CounterNumber
                glowColor={remainingPins === 0 ? '#00ffcc' : counterTheme.glow}
                textColor={remainingPins === 0 ? '#f2fffb' : counterTheme.text}
                fontSize={remainingPins >= 10 ? centerR * 0.72 : centerR * 0.88}
                size={centerR * 1.55}
                value={remainingPins}
              />
            </Animated.View>
          </Animated.View>
        )}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ width: size, height: size }, animStyle, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {shapeBand === 'badge' ? (
          <Polygon
            points={badgePoints}
            fill={visualZone === 'prestige' ? '#101010' : '#141428'}
            stroke={zone.primary}
            strokeWidth={2.8}
            opacity={0.95}
          />
        ) : (
          <Circle
            cx={c}
            cy={c}
            r={r}
            fill={shapeBand === 'ring' ? 'rgba(13,13,26,0.32)' : visualZone === 'prestige' ? '#101010' : '#141428'}
          />
        )}
        <Circle cx={c} cy={c} r={r}
          fill="none" stroke={zone.primary} strokeWidth={isBossShape ? 4 : 2.5} opacity={0.9} />
        {shapeBand === 'ring' && (
          <Circle cx={c} cy={c} r={r * 0.44} fill="#0d0d1a" stroke={zone.primary} strokeWidth={1.4} opacity={0.95} />
        )}
        {shapeBand === 'doubleRing' && (
          <Circle cx={c} cy={c} r={r * 0.84} fill="none" stroke={zone.accent} strokeWidth={2} opacity={0.45} />
        )}
        {shapeBand === 'arena' && (
          <>
            <Circle cx={c} cy={c} r={r * 0.9} fill="none" stroke={zone.accent} strokeWidth={2.4} opacity={0.55} />
            <Circle cx={c} cy={c} r={r * 0.76} fill="none" stroke={zone.primary} strokeWidth={1.4} opacity={0.4} />
          </>
        )}
        <Circle cx={c} cy={c} r={r * 0.68}
          fill="none" stroke={zone.primary} strokeWidth={1.5} opacity={0.18} />
        <Circle cx={c} cy={c} r={centerR}
          fill="none" stroke={zone.primary} strokeWidth={1.5} opacity={0.28} />
        {ticks.map((t, i) => (
          <Line
            key={i}
            x1={t.x1} y1={t.y1}
            x2={t.x2} y2={t.y2}
            stroke={t.stroke}
            strokeWidth={t.strokeWidth}
          />
        ))}
        <Circle cx={c} cy={c} r={centerR} fill={visualZone === 'prestige' ? '#090909' : '#0d1133'} />
        <Circle cx={c} cy={c} r={centerR}
          fill="none" stroke={zone.primary} strokeWidth={1.5} opacity={0.75} />
      </Svg>

      {/* Sayı: disk dönüşünü iptal eden katman + isabetli atışta pulse */}
      {remainingPins !== undefined && (
        <Animated.View
          pointerEvents="none"
          style={[{
            position: 'absolute',
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          }, counterStyle]}
        >
          <Animated.View style={numScaleStyle}>
            <CounterNumber
              glowColor={remainingPins === 0 ? '#00ffcc' : counterTheme.glow}
              textColor={remainingPins === 0 ? '#f2fffb' : counterTheme.text}
              fontSize={remainingPins >= 10 ? centerR * 0.72 : centerR * 0.88}
              size={centerR * 1.55}
              value={remainingPins}
            />
          </Animated.View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function getTargetImage(levelId: number): ImageSourcePropType | null {
  if (levelId === 1) return TARGET_IMAGE_LEVEL_01;
  if (levelId === 2) return TARGET_IMAGE_LEVEL_02;
  if (levelId === 3) return TARGET_IMAGE_LEVEL_03;
  if (levelId === 4) return TARGET_IMAGE_LEVEL_04;
  if (levelId === 5) return TARGET_IMAGE_LEVEL_05;
  if (levelId === 6) return TARGET_IMAGE_LEVEL_06;
  if (levelId === 7) return TARGET_IMAGE_LEVEL_07;
  if (levelId === 8) return TARGET_IMAGE_LEVEL_08;
  if (levelId === 9) return TARGET_IMAGE_LEVEL_09;
  if (levelId === 10) return TARGET_IMAGE_LEVEL_10;
  if (levelId >= 11 && levelId <= 15) return TARGET_IMAGE_LEVEL_11_15;
  if (levelId >= 16 && levelId <= 20) return TARGET_IMAGE_LEVEL_16_20;
  if (levelId >= 21 && levelId <= 25) return TARGET_IMAGE_LEVEL_21_25;
  if (levelId >= 26 && levelId <= 30) return TARGET_IMAGE_LEVEL_26_30;
  if (levelId >= 31 && levelId <= 35) return TARGET_IMAGE_LEVEL_31_35;
  if (levelId >= 36 && levelId <= 40) return TARGET_IMAGE_LEVEL_36_40;
  if (levelId >= 41 && levelId <= 45) return TARGET_IMAGE_LEVEL_41_45;
  if (levelId >= 46 && levelId <= 50) return TARGET_IMAGE_LEVEL_46_50;
  return null;
}

function getCounterTheme(levelId: number): { text: string; glow: string } {
  if (levelId <= 5) return { text: '#f8fdff', glow: '#36dfff' };
  if (levelId <= 10) return { text: '#fbfff6', glow: '#d6ff5c' };
  if (levelId <= 15) return { text: '#fff8f0', glow: '#ff9f32' };
  if (levelId <= 20) return { text: '#f8fdff', glow: '#7feaff' };
  if (levelId <= 25) return { text: '#fff7ff', glow: '#d86cff' };
  if (levelId <= 30) return { text: '#f7fcff', glow: '#45b8ff' };
  if (levelId <= 35) return { text: '#fff5fb', glow: '#ff5ec8' };
  if (levelId <= 40) return { text: '#fff9ef', glow: '#ffd45f' };
  if (levelId <= 45) return { text: '#fff5f6', glow: '#ff5b72' };
  return { text: '#fff6ed', glow: '#ff9b28' };
}

function CounterNumber({
  fontSize,
  glowColor,
  size,
  textColor,
  value,
}: {
  fontSize: number;
  glowColor: string;
  size: number;
  textColor: string;
  value: number;
}) {
  const text = `${value}`;
  const center = size / 2;
  const badgeR = size * 0.38;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={center} cy={center} r={badgeR + 5} fill={glowColor} opacity={0.22} />
      <Circle cx={center} cy={center} r={badgeR} fill="rgba(3,8,20,0.86)" />
      <Circle cx={center} cy={center} r={badgeR} fill="none" stroke="rgba(255,255,255,0.82)" strokeWidth={2.4} />
      <Circle cx={center} cy={center} r={badgeR - 5} fill="none" stroke={glowColor} strokeWidth={1.5} opacity={0.7} />
      <SvgText
        fill="none"
        fontSize={fontSize}
        fontWeight="900"
        stroke="rgba(0,0,0,0.9)"
        strokeLinejoin="round"
        strokeWidth={fontSize * 0.26}
        textAnchor="middle"
        x={center}
        y={center + fontSize * 0.34}
      >
        {text}
      </SvgText>
      <SvgText
        fill="rgba(255,255,255,0.28)"
        fontSize={fontSize}
        fontWeight="900"
        textAnchor="middle"
        x={center - 1.4}
        y={center + fontSize * 0.34 - 1.4}
      >
        {text}
      </SvgText>
      <SvgText
        fill="none"
        fontSize={fontSize}
        fontWeight="900"
        stroke={glowColor}
        strokeLinejoin="round"
        strokeWidth={fontSize * 0.06}
        textAnchor="middle"
        x={center}
        y={center + fontSize * 0.34}
      >
        {text}
      </SvgText>
      <SvgText
        fill={textColor}
        fontSize={fontSize}
        fontWeight="900"
        textAnchor="middle"
        x={center}
        y={center + fontSize * 0.34}
      >
        {text}
      </SvgText>
    </Svg>
  );
}

const styles = StyleSheet.create({
  targetImage: {
    height: '100%',
    transform: [{ scale: TARGET_IMAGE_SCALE }],
    width: '100%',
  },
});
