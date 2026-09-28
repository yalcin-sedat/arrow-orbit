// Yerel kalıcı veri — AsyncStorage tabanlı; hatalar sessizce atlanır
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_HIGH_SCORE = '@arrow_orbit:high_score';
const KEY_HIGHEST_UNLOCKED_LEVEL = '@arrow_orbit:highest_unlocked_level_v2';
const KEY_APP_SETTINGS = '@arrow_orbit:app_settings';
const KEY_PLAYER_PROFILE = '@arrow_orbit:player_profile';

export type PlayerAvatarId = 'nova' | 'bolt' | 'pulse' | 'flare' | 'comet' | 'void';

export type PlayerProfile = {
  avatarId: PlayerAvatarId;
  username: string;
};

export type AppSettings = {
  hapticsEnabled: boolean;
  reducedMotionEnabled: boolean;
  screenFlashEnabled: boolean;
  soundEnabled: boolean;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  hapticsEnabled: true,
  reducedMotionEnabled: false,
  screenFlashEnabled: true,
  soundEnabled: true,
};

export async function getHighScore(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(KEY_HIGH_SCORE);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

// Yeni skor eskisinden yüksekse kaydeder; yeni rekor ise true döner
export async function saveHighScoreIfBetter(score: number): Promise<boolean> {
  try {
    const current = await getHighScore();
    if (score > current) {
      await AsyncStorage.setItem(KEY_HIGH_SCORE, String(score));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function getHighestUnlockedLevel(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(KEY_HIGHEST_UNLOCKED_LEVEL);
    const parsed = val ? parseInt(val, 10) : 1;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  } catch {
    return 1;
  }
}

export async function unlockLevelIfHigher(level: number): Promise<number> {
  try {
    const current = await getHighestUnlockedLevel();
    const next = Math.max(current, level);
    await AsyncStorage.setItem(KEY_HIGHEST_UNLOCKED_LEVEL, String(next));
    return next;
  } catch {
    return level;
  }
}

export async function saveHighestUnlockedLevel(level: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_HIGHEST_UNLOCKED_LEVEL, String(Math.max(1, level)));
  } catch {}
}

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const val = await AsyncStorage.getItem(KEY_APP_SETTINGS);
    if (!val) return DEFAULT_APP_SETTINGS;

    const parsed = JSON.parse(val) as Partial<AppSettings>;
    return {
      ...DEFAULT_APP_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_APP_SETTINGS, JSON.stringify(settings));
  } catch {
    // Ayar kaydı başarısız olursa oyun akışını bozma.
  }
}

export async function getPlayerProfile(): Promise<PlayerProfile | null> {
  try {
    const val = await AsyncStorage.getItem(KEY_PLAYER_PROFILE);
    if (!val) return null;

    const parsed = JSON.parse(val) as Partial<PlayerProfile>;
    if (!parsed.username || !parsed.avatarId) return null;

    return {
      avatarId: parsed.avatarId,
      username: parsed.username,
    };
  } catch {
    return null;
  }
}

export async function savePlayerProfile(profile: PlayerProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_PLAYER_PROFILE, JSON.stringify(profile));
  } catch {
    // Profil kaydı başarısız olursa oyun akışını bozma.
  }
}

// "Verilerimi sil" akışı (AUDIT 6.8): oyuncuya özel veriler (skor, ilerleme,
// profil) silinir. AppSettings (ses/haptic/flash) kişisel veri değil, cihaz
// tercihi olduğu için kasıtlı olarak silinmez.
export async function clearAllLocalData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEY_HIGH_SCORE,
      KEY_HIGHEST_UNLOCKED_LEVEL,
      KEY_PLAYER_PROFILE,
    ]);
  } catch {
    // Yerel silme başarısız olursa çağıran taraf (App.tsx) state'i zaten sıfırlar.
  }
}
