import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';
import { PlayerAvatarId } from '../utils/storage';

type PlayerAvatarBadgeProps = {
  accent: string;
  selected?: boolean;
  size: number;
  symbol: PlayerAvatarId;
};

export default function PlayerAvatarBadge({
  accent,
  selected = true,
  size,
  symbol,
}: PlayerAvatarBadgeProps) {
  const gradientId = `playerAvatar-${symbol}`;
  const glowId = `playerAvatarGlow-${symbol}`;
  const dimStroke = selected ? 1 : 0.5;

  return (
    <View style={{ height: size, width: size }}>
      <Svg height={size} viewBox="0 0 64 64" width={size}>
        <Defs>
          <LinearGradient id={glowId} x1="6" x2="58" y1="8" y2="56">
            <Stop offset="0" stopColor={accent} stopOpacity={selected ? 0.6 : 0.18} />
            <Stop offset="0.55" stopColor="#ffffff" stopOpacity={selected ? 0.16 : 0.06} />
            <Stop offset="1" stopColor="#8b4dff" stopOpacity={selected ? 0.48 : 0.12} />
          </LinearGradient>
          <LinearGradient id={gradientId} x1="9" x2="55" y1="7" y2="57">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
            <Stop offset="0.46" stopColor={accent} stopOpacity="0.95" />
            <Stop offset="1" stopColor="#8b4dff" stopOpacity="0.95" />
          </LinearGradient>
        </Defs>
        <Circle
          cx="32"
          cy="32"
          fill={`url(#${glowId})`}
          r="29"
          stroke={`url(#${gradientId})`}
          strokeOpacity={selected ? 1 : 0.44}
          strokeWidth={selected ? 3.2 : 2}
        />
        <Circle
          cx="32"
          cy="32"
          fill="rgba(2,6,21,0.7)"
          r="22"
          stroke="#ffffff"
          strokeOpacity={0.16 * dimStroke}
          strokeWidth="1"
        />
        <AvatarSymbol accent={accent} gradientId={gradientId} selected={selected} symbol={symbol} />
      </Svg>
    </View>
  );
}

function AvatarSymbol({
  accent,
  gradientId,
  selected,
  symbol,
}: {
  accent: string;
  gradientId: string;
  selected: boolean;
  symbol: PlayerAvatarId;
}) {
  const opacity = selected ? 1 : 0.72;

  if (symbol === 'nova') {
    return (
      <>
        <Path d="M32 10 36.4 27.6 54 32 36.4 36.4 32 54 27.6 36.4 10 32 27.6 27.6Z" fill={`${accent}46`} stroke="#ffffff" strokeLinejoin="round" strokeOpacity={opacity} strokeWidth="2.7" />
        <Circle cx="32" cy="32" fill={accent} r="4.4" />
      </>
    );
  }

  if (symbol === 'bolt') {
    return (
      <Path d="M36.8 8.8 17.4 34.1h12.1l-3 21.1 19.9-27.5H34.8Z" fill={`${accent}55`} stroke="#ffffff" strokeLinejoin="round" strokeOpacity={opacity} strokeWidth="3.2" />
    );
  }

  if (symbol === 'pulse') {
    return (
      <>
        <Circle cx="32" cy="32" fill={`${accent}28`} r="16.5" stroke={accent} strokeOpacity={opacity} strokeWidth="3.2" />
        <Path d="M12 34h10.2l4-12.2 6.4 22.2 4.9-14h14.5" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeOpacity={selected ? 0.96 : 0.76} strokeWidth="3" />
      </>
    );
  }

  if (symbol === 'flare') {
    return (
      <>
        <Path d="M35.4 8.5c.9 8.8 9 11.4 9 22.3 0 10.2-7.4 17.2-12.5 17.2-5.7 0-12.4-4.6-12.4-13.8 0-7.2 5.2-13 8.3-18.4.8 5 3.4 8.2 6.9 10.2-.4-6 1.3-11.5.7-17.5Z" fill={`${accent}46`} stroke="#ffffff" strokeLinejoin="round" strokeOpacity={opacity} strokeWidth="2.8" />
        <Path d="M32.2 29.5c3.3 4.4 5.1 7.3 2.4 11.2-2.3 3.3-8.2 1.5-8.2-3.6 0-3.1 2.5-5.5 5.8-7.6Z" fill={accent} fillOpacity={selected ? 0.92 : 0.66} />
      </>
    );
  }

  if (symbol === 'comet') {
    return (
      <>
        <Path d="M12 39.8c11.9-15.2 25.5-21 40-19.5-10 4.1-17.3 11.2-22.8 22.3C24.2 42.7 18.4 41.9 12 39.8Z" fill={`${accent}3d`} stroke="#ffffff" strokeLinejoin="round" strokeOpacity={opacity} strokeWidth="2.5" />
        <Circle cx="43.5" cy="24.5" fill={accent} r="6.3" stroke="#ffffff" strokeWidth="2" />
        <Path d="M12.5 25.5c6.5 1.1 12.1.3 17.1-2.4M9.5 33.2c5 1.5 9.9 1.7 14.8.5" stroke={accent} strokeLinecap="round" strokeOpacity={selected ? 0.82 : 0.58} strokeWidth="2.4" />
      </>
    );
  }

  return (
    <>
      <Circle cx="32" cy="32" fill={`${accent}28`} r="12.8" stroke="#ffffff" strokeOpacity={opacity} strokeWidth="3" />
      <Ellipse cx="32" cy="32" fill="none" rx="21" ry="7.5" stroke={accent} strokeOpacity={selected ? 0.94 : 0.68} strokeWidth="2.4" transform="rotate(-18 32 32)" />
      <Circle cx="38" cy="27" fill="#020615" r="11.6" />
    </>
  );
}
