// Pin / ok komponenti — alttan fırlayan ve hedefe saplanan pin görseli.
// İki mod:
//   'active'  → alttan yukarı fırlatılacak pin; GameScreen Animated.View ile sarar.
//   'placed'  → hedefe saplanmış pin; GameScreen mutlak konumu hesaplayıp style ile iletir.
// Bounding box sabitleri (PIN_W, PIN_H) GameScreen pozisyon hesabında kullanılır.
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Defs, LinearGradient, Path, Rect, Stop, Svg } from 'react-native-svg';
import { VisualZone } from '../theme/colors';

// Bounding box — tüm pin görseli bu kutu içine sığar
export const PIN_W = 24;
export const PIN_H = 92;

// SVG renkleri
const METAL_LIGHT = '#f4fbff';
const METAL_MID   = '#9fc9e8';
const METAL_DARK  = '#182b42';
const OBS_LIGHT   = '#ffc0d4';
const OBS_DARK    = '#8d1631';

type ArrowPalette = {
  accent: string;
  fin: string;
  glow: string;
  tipMid: string;
};

function getArrowPalette(levelId: number, visualZone: VisualZone): ArrowPalette {
  if (levelId <= 5) return { accent: '#00d4ff', fin: '#6d40ff', glow: '#00d4ff', tipMid: '#7bdfff' };
  if (levelId <= 10) return { accent: '#c8ff3d', fin: '#ffd84a', glow: '#b8ff3d', tipMid: '#e5ff93' };
  if (levelId <= 15) return { accent: '#ff7a00', fin: '#ff3300', glow: '#ff7a00', tipMid: '#ffb25c' };
  if (levelId <= 20) return { accent: '#8cecff', fin: '#3a8cff', glow: '#8cecff', tipMid: '#d9fbff' };
  if (levelId <= 25) return { accent: '#cc5cff', fin: '#00d4ff', glow: '#cc5cff', tipMid: '#e5a2ff' };
  if (levelId <= 30) return { accent: '#2aa8ff', fin: '#00eaff', glow: '#2aa8ff', tipMid: '#8ed7ff' };
  if (levelId <= 35) return { accent: '#ff3bbf', fin: '#bf5fff', glow: '#ff3bbf', tipMid: '#ff9be4' };
  if (levelId <= 40) return { accent: '#ffd35a', fin: '#ff8c00', glow: '#ffd35a', tipMid: '#ffe9a4' };
  if (levelId <= 45) return { accent: '#ff3355', fin: '#ff7a00', glow: '#ff3355', tipMid: '#ff92a3' };
  if (levelId <= 50) return { accent: '#ff8c00', fin: '#8b5cff', glow: '#ff8c00', tipMid: '#ffc06e' };

  return visualZone === 'prestige'
    ? { accent: '#ffd700', fin: '#ff8c00', glow: '#ffd700', tipMid: '#ffe69a' }
    : { accent: '#00d4ff', fin: '#6d40ff', glow: '#00d4ff', tipMid: '#7bdfff' };
}

// Tek ok SVG şekli: metal uç + koyu gövde + arka kanatlar.
// 'active' modda uç yukarıya (hedefe doğru) bakar.
// 'placed' modda GameScreen `rotate(angle+180)` uygular → uç hedefe doğru döner.
function PinSVG({
  isObstacle,
  launched,
  levelId,
  mode,
  visualZone,
}: {
  isObstacle: boolean;
  launched: boolean;
  levelId: number;
  mode: 'active' | 'placed';
  visualZone: VisualZone;
}) {
  const W = PIN_W;
  const H = PIN_H;
  const cx = W / 2;
  const palette = getArrowPalette(levelId, visualZone);
  const glowColor = isObstacle ? '#ff3355' : palette.glow;
  const accentColor = isObstacle ? OBS_LIGHT : palette.accent;
  const finColor = isObstacle ? OBS_DARK : palette.fin;
  const trailVisible = mode === 'active' && launched;

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <LinearGradient id="tipGrad" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor={isObstacle ? OBS_LIGHT : METAL_LIGHT} />
          <Stop offset="0.48" stopColor={isObstacle ? '#ff6b8f' : palette.tipMid} />
          <Stop offset="1" stopColor={isObstacle ? OBS_DARK : METAL_DARK} />
        </LinearGradient>
        <LinearGradient id="bodyGrad" x1="0" x2="1" y1="0" y2="0">
          <Stop offset="0" stopColor="#06111f" />
          <Stop offset="0.42" stopColor="#263f5f" />
          <Stop offset="0.68" stopColor="#102236" />
          <Stop offset="1" stopColor="#030814" />
        </LinearGradient>
        <LinearGradient id="trailGrad" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor={glowColor} stopOpacity="0.72" />
          <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {trailVisible && (
        <>
          <Path
            d={`M ${cx - 5} 46 C ${cx - 16} 60 ${cx - 13} 78 ${cx - 4} ${H} L ${cx + 4} ${H} C ${cx + 13} 78 ${cx + 16} 60 ${cx + 5} 46 Z`}
            fill="url(#trailGrad)"
            opacity={0.95}
          />
          <Path
            d={`M ${cx - 11} 55 C ${cx - 20} 66 ${cx - 18} 79 ${cx - 9} 91`}
            fill="none"
            opacity={0.62}
            stroke={glowColor}
            strokeLinecap="round"
            strokeWidth={2.2}
          />
          <Path
            d={`M ${cx + 11} 55 C ${cx + 20} 66 ${cx + 18} 79 ${cx + 9} 91`}
            fill="none"
            opacity={0.62}
            stroke={glowColor}
            strokeLinecap="round"
            strokeWidth={2.2}
          />
          <Path
            d={`M ${cx - 6} 64 C ${cx - 13} 75 ${cx - 11} 84 ${cx - 6} ${H}`}
            fill="none"
            opacity={0.42}
            stroke="#ffffff"
            strokeLinecap="round"
            strokeWidth={1.4}
          />
          <Path
            d={`M ${cx + 6} 64 C ${cx + 13} 75 ${cx + 11} 84 ${cx + 6} ${H}`}
            fill="none"
            opacity={0.42}
            stroke="#ffffff"
            strokeLinecap="round"
            strokeWidth={1.4}
          />
          <Path
            d={`M ${cx} 48 C ${cx - 3} 66 ${cx - 2} 78 ${cx} ${H} C ${cx + 2} 78 ${cx + 3} 66 ${cx} 48 Z`}
            fill={glowColor}
            opacity={0.64}
          />
        </>
      )}

      {/* Arka kanatlar */}
      <Path d={`M ${cx - 3} 58 L 0 74 L ${cx - 6} 70 L ${cx - 2} 61 Z`} fill={finColor} opacity={0.95} />
      <Path d={`M ${cx + 3} 58 L ${W} 74 L ${cx + 6} 70 L ${cx + 2} 61 Z`} fill={finColor} opacity={0.9} />
      <Path d={`M ${cx - 1.5} 62 L 5 84 L ${cx - 4} 79 Z`} fill={accentColor} opacity={0.78} />
      <Path d={`M ${cx + 1.5} 62 L ${W - 5} 84 L ${cx + 4} 79 Z`} fill={accentColor} opacity={0.78} />

      {/* Gövde */}
      <Rect x={cx - 4.2} y={22} width={8.4} height={45} rx={4.2} fill="url(#bodyGrad)" />
      <Rect x={cx - 2.8} y={25} width={2.2} height={36} rx={1.1} fill="rgba(255,255,255,0.34)" />
      <Rect x={cx - 5.2} y={33} width={10.4} height={2.2} rx={1.1} fill={accentColor} opacity={0.82} />

      {/* Metal uç sadece fırlatılan okta görünür; saplanmış okta hedefin içinde kalmış kabul edilir. */}
      {mode === 'active' && (
        <>
          <Path
            d={`M ${cx} 0 L ${W - 2} 24 L ${cx + 4.8} 31 L ${cx} 26 L ${cx - 4.8} 31 L 2 24 Z`}
            fill="url(#tipGrad)"
          />
          <Path
            d={`M ${cx} 2 L ${cx + 2.4} 24 L ${cx} 26 L ${cx - 2.4} 24 Z`}
            fill="rgba(255,255,255,0.52)"
          />
          <Path
            d={`M 4 23 L ${cx - 4.8} 31 L ${cx - 1.8} 29 L ${cx - 2.8} 22 Z`}
            fill="rgba(255,255,255,0.35)"
          />
          <Path d={`M ${W - 4} 23 L ${cx + 4.8} 31 L ${cx + 1.8} 29 L ${cx + 2.8} 22 Z`} fill="rgba(0,0,0,0.2)" />
        </>
      )}
    </Svg>
  );
}

type PinProps = {
  mode: 'active' | 'placed';
  isObstacle?: boolean;
  launched?: boolean;
  levelId?: number;
  visualZone?: VisualZone;
  // 'placed' modda GameScreen mutlak konum + rotasyon hesaplayıp buraya iletir
  style?: StyleProp<ViewStyle>;
};

export default function Pin({
  mode,
  isObstacle = false,
  launched = false,
  levelId = 1,
  visualZone = 'learning',
  style,
}: PinProps) {
  // Her iki modda da aynı görsel; fark konum ve rotasyondadır (GameScreen yönetir).
  return (
    <View style={[{ width: PIN_W, height: PIN_H }, style]}>
      <PinSVG
        isObstacle={isObstacle}
        launched={launched}
        levelId={levelId}
        mode={mode}
        visualZone={visualZone}
      />
    </View>
  );
}
