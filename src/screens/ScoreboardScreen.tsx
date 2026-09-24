import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import PlayerAvatarBadge from '../components/PlayerAvatarBadge';
import { TrophyIcon } from '../components/icons/GameIcons';
import { getPlayerAvatarOption } from '../data/playerAvatars';
import { strings } from '../data/strings';
import { LeaderboardEntry, fetchGlobalLeaderboard } from '../services/playerCloud';
import { colors } from '../theme/colors';
import { PlayerProfile } from '../utils/storage';

type ScoreboardScreenProps = {
  highScore: number;
  highestUnlockedLevel: number;
  onBack: () => void;
  playerProfile: PlayerProfile | null;
};

export default function ScoreboardScreen({
  highScore,
  highestUnlockedLevel,
  onBack,
  playerProfile,
}: ScoreboardScreenProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const avatar = getPlayerAvatarOption(playerProfile?.avatarId ?? 'nova');
  const playerName = playerProfile?.username?.toUpperCase() ?? 'YOU';

  useEffect(() => {
    let mounted = true;

    fetchGlobalLeaderboard(20)
      .then((entries) => {
        if (!mounted) return;
        setLeaderboard(entries);
      })
      .catch(() => {
        // Global liste alınamazsa local oyuncu fallback'i gösterilir.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const podiumEntries = leaderboard.length > 0
    ? leaderboard.slice(0, 3)
    : [{
      avatarId: avatar.id,
      highScore,
      highestUnlockedLevel,
      uid: 'local-player',
      username: playerName,
    }];
  const firstPlace = podiumEntries[0];
  const secondPlace = podiumEntries[1];
  const thirdPlace = podiumEntries[2];
  const topTenEntries = leaderboard.length > 0 ? leaderboard.slice(0, 10) : podiumEntries;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <Header title={strings.leaderboardTitle} onBack={onBack} />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.podiumPanel}>
            <View style={styles.podiumHeader}>
              <Text style={styles.panelTitle}>GLOBAL RANKING</Text>
              <Text style={styles.panelMeta}>BEST RUN</Text>
            </View>

            <View style={styles.podiumRow}>
              <PodiumSlot entry={secondPlace} fallbackAccent="#c0c0c0" place="2" rankAccent={colors.neonBlue} size="side" />
              <PodiumSlot entry={firstPlace} fallbackAccent={colors.neonGold} place="1" rankAccent={colors.neonGold} size="center" />
              <PodiumSlot entry={thirdPlace} fallbackAccent={colors.neonPurple} place="3" rankAccent={colors.neonPurple} size="side" />
            </View>
          </View>

          <MetricCard
            accent={colors.neonGold}
            icon={<TrophyIcon color={colors.neonGold} size={34} />}
            label={strings.topScore}
            tag="YOUR BEST"
            value={String(highScore)}
          />
          <TopTenList entries={topTenEntries} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity activeOpacity={0.78} onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>
      <View style={styles.titleGroup}>
        <ScoreboardHeaderIcon />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function ScoreboardHeaderIcon() {
  return (
    <Svg height={26} viewBox="0 0 32 32" width={26}>
      <Path
        d="M10 5h12v5.5c0 5.2-2.1 8.2-6 9.2-3.9-1-6-4-6-9.2Z"
        fill="rgba(255,215,0,0.12)"
        stroke={colors.neonGold}
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
      <Path d="M10 8H5.8c0 5 1.8 7.7 5.2 8.2M22 8h4.2c0 5-1.8 7.7-5.2 8.2M16 20v4.5M11.5 27h9" stroke="#dffbff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
    </Svg>
  );
}

function MetricCard({
  accent,
  icon,
  label,
  tag,
  value,
}: {
  accent: string;
  icon: React.ReactNode;
  label: string;
  tag: string;
  value: string;
}) {
  return (
    <View style={[styles.metricCard, { borderColor: accent }]}>
      <View style={[styles.metricIcon, { backgroundColor: `${accent}22` }]}>
        {icon}
      </View>
      <View style={styles.metricInfo}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricTag}>{tag}</Text>
      </View>
      <View style={[styles.metricValuePill, { backgroundColor: accent }]}>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

function PodiumSlot({
  entry,
  fallbackAccent,
  place,
  rankAccent,
  size,
}: {
  entry?: LeaderboardEntry;
  fallbackAccent: string;
  place: string;
  rankAccent: string;
  size: 'center' | 'side';
}) {
  const isCenter = size === 'center';
  const avatar = entry ? getPlayerAvatarOption(entry.avatarId) : null;
  const avatarAccent = avatar?.accent ?? fallbackAccent;
  const label = entry?.username.toUpperCase() ?? 'EMPTY';
  const score = entry ? String(entry.highScore) : '---';

  return (
    <View style={[styles.podiumSlot, isCenter ? styles.podiumSlotCenter : styles.podiumSlotSide]}>
      <View style={[styles.podiumAvatar, { borderColor: avatarAccent, backgroundColor: `${avatarAccent}22` }]}>
        {avatar ? (
          <PlayerAvatarBadge accent={avatarAccent} size={42} symbol={avatar.id} />
        ) : (
          <Text style={styles.podiumEmptyInitial}>--</Text>
        )}
      </View>
      <View style={[styles.podiumBlock, { borderColor: rankAccent }, isCenter ? styles.podiumBlockCenter : styles.podiumBlockSide]}>
        <Text style={styles.podiumLabel}>{label}</Text>
        <Text style={styles.podiumScore}>{score}</Text>
        <Text style={[styles.podiumPlace, { color: rankAccent }]}>{place}</Text>
      </View>
    </View>
  );
}

function TopTenList({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <View style={styles.topTenPanel}>
      <View style={styles.topTenHeader}>
        <Text style={styles.panelTitle}>TOP 10 PLAYERS</Text>
        <Text style={styles.panelMeta}>GLOBAL</Text>
      </View>

      {entries.slice(0, 10).map((entry, index) => {
        const avatar = getPlayerAvatarOption(entry.avatarId);
        const rank = index + 1;
        const rankAccent = rank === 1
          ? colors.neonGold
          : rank === 2
            ? colors.neonBlue
            : rank === 3
              ? colors.neonPurple
              : 'rgba(230,246,255,0.56)';

        return (
          <View key={entry.uid} style={styles.topTenRow}>
            <Text style={[styles.topTenRank, { color: rankAccent }]}>{rank}</Text>
            <PlayerAvatarBadge accent={avatar.accent} size={32} symbol={avatar.id} />
            <View style={styles.topTenNameBlock}>
              <Text numberOfLines={1} style={styles.topTenName}>
                {entry.username.toUpperCase()}
              </Text>
              <Text style={styles.topTenLevel}>LEVEL {entry.highestUnlockedLevel}</Text>
            </View>
            <Text style={styles.topTenScore}>{entry.highScore}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
  content: {
    gap: 14,
    padding: 20,
    paddingTop: 24,
    paddingBottom: 34,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  headerSpacer: {
    width: 40,
  },
  metricCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 16, 38, 0.82)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 86,
    padding: 14,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  metricTag: {
    color: 'rgba(230,246,255,0.52)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginTop: 4,
  },
  metricValue: {
    color: '#031120',
    fontSize: 18,
    fontWeight: '900',
  },
  metricValuePill: {
    alignItems: 'center',
    borderRadius: 14,
    minWidth: 86,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  panelTitle: {
    color: colors.neonBlue,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  panelMeta: {
    color: 'rgba(230,246,255,0.46)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  podiumAvatar: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    marginBottom: 10,
    width: 44,
  },
  podiumBlock: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 16, 38, 0.82)',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'flex-start',
    paddingBottom: 56,
    paddingHorizontal: 8,
    paddingTop: 20,
    width: '100%',
  },
  podiumBlockCenter: {
    minHeight: 148,
  },
  podiumBlockSide: {
    minHeight: 120,
  },
  podiumHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  podiumEmptyInitial: {
    color: 'rgba(230,246,255,0.38)',
    fontSize: 18,
    fontWeight: '900',
  },
  podiumLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    maxWidth: '100%',
    textAlign: 'center',
  },
  podiumPanel: {
    backgroundColor: 'rgba(4, 16, 38, 0.82)',
    borderColor: colors.neonBlue,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  podiumPlace: {
    bottom: 11,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
    position: 'absolute',
  },
  podiumRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
  },
  podiumScore: {
    color: 'rgba(230,246,255,0.62)',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 5,
  },
  podiumSlot: {
    alignItems: 'center',
    flex: 1,
  },
  podiumSlotCenter: {
    flex: 1.18,
  },
  podiumSlotSide: {
    opacity: 0.88,
  },
  root: {
    backgroundColor: '#020615',
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  titleGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  topTenHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  topTenLevel: {
    color: 'rgba(230,246,255,0.42)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
  topTenName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  topTenNameBlock: {
    flex: 1,
    minWidth: 0,
  },
  topTenPanel: {
    backgroundColor: 'rgba(4, 16, 38, 0.82)',
    borderColor: 'rgba(0,212,255,0.82)',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  topTenRank: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    width: 24,
  },
  topTenRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: 'rgba(117,247,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
  topTenScore: {
    color: colors.neonGold,
    fontSize: 15,
    fontWeight: '900',
    minWidth: 50,
    textAlign: 'right',
  },
});
