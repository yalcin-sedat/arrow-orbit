import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { PlayerAvatarId, PlayerProfile } from '../utils/storage';
import { ensureAnonymousUserId, getFirebaseRuntime } from './firebase';

export type LeaderboardEntry = {
  avatarId: PlayerAvatarId;
  highScore: number;
  highestUnlockedLevel: number;
  uid: string;
  username: string;
};

type PlayerCloudStats = {
  highScore: number;
  highestUnlockedLevel: number;
};

const LEADERBOARD_CACHE_TTL_MS = 60_000;
let cachedLeaderboard: {
  entries: LeaderboardEntry[];
  fetchedAt: number;
  limit: number;
} | null = null;

function isPlayerAvatarId(value: unknown): value is PlayerAvatarId {
  return (
    value === 'nova' ||
    value === 'bolt' ||
    value === 'pulse' ||
    value === 'flare' ||
    value === 'comet' ||
    value === 'void'
  );
}

function parseNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export async function syncPlayerProfileToCloud(
  profile: PlayerProfile,
  stats: PlayerCloudStats,
): Promise<void> {
  const firebase = getFirebaseRuntime();
  if (!firebase) return;

  const uid = await ensureAnonymousUserId();
  if (!uid) return;

  await setDoc(
    doc(firebase.db, 'players', uid),
    {
      avatarId: profile.avatarId,
      highScore: stats.highScore,
      highestUnlockedLevel: stats.highestUnlockedLevel,
      uid,
      updatedAt: serverTimestamp(),
      username: profile.username,
    },
    { merge: true },
  );
  cachedLeaderboard = null;
}

export async function syncHighScoreToCloud(
  profile: PlayerProfile | null,
  stats: PlayerCloudStats,
): Promise<void> {
  if (!profile || stats.highScore <= 0) return;
  await syncPlayerProfileToCloud(profile, stats);
}

export async function fetchGlobalLeaderboard(entryLimit = 20): Promise<LeaderboardEntry[]> {
  const now = Date.now();
  if (
    cachedLeaderboard &&
    cachedLeaderboard.limit >= entryLimit &&
    now - cachedLeaderboard.fetchedAt < LEADERBOARD_CACHE_TTL_MS
  ) {
    return cachedLeaderboard.entries.slice(0, entryLimit);
  }

  const firebase = getFirebaseRuntime();
  if (!firebase) return [];

  const snapshot = await getDocs(
    query(
      collection(firebase.db, 'players'),
      orderBy('highScore', 'desc'),
      limit(entryLimit),
    ),
  );

  const entries = snapshot.docs.map((item) => {
    const data = item.data();
    const avatarId = isPlayerAvatarId(data.avatarId) ? data.avatarId : 'nova';

    return {
      avatarId,
      highScore: parseNumber(data.highScore),
      highestUnlockedLevel: parseNumber(data.highestUnlockedLevel),
      uid: typeof data.uid === 'string' ? data.uid : item.id,
      username: typeof data.username === 'string' && data.username.trim()
        ? data.username.trim()
        : 'PLAYER',
    };
  });

  cachedLeaderboard = {
    entries,
    fetchedAt: now,
    limit: entryLimit,
  };

  return entries;
}
