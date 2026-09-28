// Uygulama kök navigasyonu — home → game → gameover → home
// [2026-06-16] Agent 2: HomeScreen + GameOverScreen eklendi, ekran tipi genişletildi
// [2026-06-17] Aşama 2c: isNewRecord parametresi eklendi
import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { sounds } from './src/utils/sounds';
import { NativeModules, Platform, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import HomeScreen    from './src/screens/HomeScreen';
import GameScreen    from './src/screens/GameScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import LevelScreen from './src/screens/LevelScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import ScoreboardScreen from './src/screens/ScoreboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { LEVELS } from './src/data/levels';
import { strings } from './src/data/strings';
import { deleteOwnPlayerData, syncHighScoreToCloud, syncPlayerProfileToCloud } from './src/services/playerCloud';
import {
  PlayerProfile,
  clearAllLocalData,
  getAppSettings,
  getPlayerProfile,
  getHighScore,
  getHighestUnlockedLevel,
  saveHighScoreIfBetter,
  unlockLevelIfHigher,
  saveHighestUnlockedLevel,
} from './src/utils/storage';

type Screen = 'home' | 'levels' | 'game' | 'gameover' | 'profileSetup' | 'scoreboard' | 'settings';
type ProfileSetupReturnScreen = 'levels' | 'settings';
type GoogleMobileAdsModule = {
  BannerAd: React.ComponentType<{
    requestOptions?: { requestNonPersonalizedAdsOnly?: boolean };
    size: string;
    unitId: string;
  }>;
  BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: string };
  TestIds: { BANNER: string };
  default?: () => { initialize: () => Promise<unknown> };
};

declare const require: (name: string) => unknown;

// Test amaçlı: dev build'de tüm leveller açık; release'te otomatik kapalı.
// Sadece level seçim ekranındaki görünüm/seçilebilirlik bypass edilir;
// kayıtlı highestUnlockedLevel storage değeri değişmez.
const DEV_UNLOCK_ALL_LEVELS = __DEV__;

let cachedAdsModule: GoogleMobileAdsModule | null | undefined;

function getAdsModule() {
  if (Platform.OS === 'web') return null;
  if (cachedAdsModule !== undefined) return cachedAdsModule;
  if (!NativeModules.RNGoogleMobileAdsModule) {
    cachedAdsModule = null;
    return cachedAdsModule;
  }

  try {
    cachedAdsModule = require('react-native-google-mobile-ads') as GoogleMobileAdsModule;
  } catch {
    cachedAdsModule = null;
  }

  return cachedAdsModule;
}

export default function App() {
  const [screen, setScreen]           = useState<Screen>('home');
  const [finalScore, setFinalScore]   = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [gameOverIsTraining, setGameOverIsTraining] = useState(false);
  const [gameOverMistakes, setGameOverMistakes] = useState(0);
  const [selectedLevelId, setSelectedLevelId] = useState(1);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [runScoringEnabled, setRunScoringEnabled] = useState(true);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [profileSetupReturnScreen, setProfileSetupReturnScreen] = useState<ProfileSetupReturnScreen>('levels');
  const [sessionStreak, setSessionStreak] = useState(0);
  const [streakAtDeath, setStreakAtDeath] = useState(0);
  const gameSessionHadNewRecord = React.useRef(false);

  React.useEffect(() => {
    getHighestUnlockedLevel().then(setHighestUnlockedLevel);
    getHighScore().then(setHighScore);
  }, []);

  // Açılışta kayıtlı ses ayarını uygula — tek kaynak storage'daki AppSettings.
  React.useEffect(() => {
    let mounted = true;

    getAppSettings().then((settings) => {
      if (!mounted) return;
      sounds.setEnabled(settings.soundEnabled);
    });

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (Platform.OS === 'web') return;

    const adsModule = getAdsModule();
    const mobileAds = adsModule?.default;
    if (!mobileAds) return;

    mobileAds().initialize().catch(() => {
      // Reklam SDK baslatma hatasi oyun akisini bozmasin.
    });
  }, []);

  React.useEffect(() => {
    getPlayerProfile().then(setPlayerProfile);
  }, []);

  function handlePlay()                                         {
    if (playerProfile) {
      setScreen('levels');
      return;
    }

    setProfileSetupReturnScreen('levels');
    setScreen('profileSetup');
  }
  function handleScoreboard()                                   { setScreen('scoreboard'); }
  function handleSettings()                                     { setScreen('settings'); }
  function handleSelectLevel(levelId: number)                  {
    gameSessionHadNewRecord.current = false;
    setRunScoringEnabled(levelId === highestUnlockedLevel);
    setSelectedLevelId(levelId);
    setScreen('game');
  }
  function handleEditProfile()                                  { setProfileSetupReturnScreen('settings'); setScreen('profileSetup'); }
  function handleProfileDone(profile: PlayerProfile)           {
    setPlayerProfile(profile);
    setScreen(profileSetupReturnScreen);
    getHighScore()
      .then((score) => syncPlayerProfileToCloud(profile, {
        highScore: score,
        highestUnlockedLevel,
      }))
      .catch(() => {
        // Cloud sync başarısızsa local oyun akışını bozma.
      });
  }
  function handleLevelUnlocked(levelId: number)                {
    setSessionStreak((s) => s + 1);
    unlockLevelIfHigher(levelId).then((nextLevel) => {
      setHighestUnlockedLevel(nextLevel);
      if (!playerProfile) return;

      getHighScore()
        .then((score) => {
          setHighScore(score);
          return syncPlayerProfileToCloud(playerProfile, {
            highScore: score,
            highestUnlockedLevel: nextLevel,
          });
        })
        .catch(() => {
          // Cloud sync başarısızsa local oyun akışını bozma.
        });
    });
  }
  function handleScoreChanged(score: number) {
    saveHighScoreIfBetter(score).then((isNew) => {
      if (!isNew) return;

      gameSessionHadNewRecord.current = true;
      setHighScore(score);
      syncHighScoreToCloud(playerProfile, {
        highScore: score,
        highestUnlockedLevel,
      }).catch(() => {
        // Cloud sync başarısızsa local oyun akışını bozma.
      });
    });
  }
  function handleGameOver(score: number, newRecord: boolean, meta?: { isTraining: boolean; mistakes: number })   {
    const isTraining = meta?.isTraining ?? false;
    const wasNewRecord = newRecord || gameSessionHadNewRecord.current;
    const streakSnapshot = sessionStreak;
    setStreakAtDeath(streakSnapshot);
    setSessionStreak(0);
    setFinalScore(score);
    setIsNewRecord(isTraining ? false : wasNewRecord);
    setGameOverIsTraining(isTraining);
    setGameOverMistakes(meta?.mistakes ?? 0);
    setScreen('gameover');

    if (!isTraining && wasNewRecord) {
      setHighScore((current) => Math.max(current, score));
      syncHighScoreToCloud(playerProfile, {
        highScore: score,
        highestUnlockedLevel,
      }).catch(() => {
        // Cloud sync başarısızsa local oyun akışını bozma.
      });
    }
  }
  function handleAdWatched() {
    // Reklam izlendi — level kaybı yok, gameover ekranında devam
  }

  function handleStreakRollback() {
    const rollback = Math.min(streakAtDeath, 5);
    const newHighest = Math.max(1, highestUnlockedLevel - rollback);
    setHighestUnlockedLevel(newHighest);
    saveHighestUnlockedLevel(newHighest);
    if (playerProfile) {
      getHighScore().then((score) => {
        syncPlayerProfileToCloud(playerProfile, {
          highScore: score,
          highestUnlockedLevel: newHighest,
        }).catch(() => {});
      });
    }
  }

  function handleRestart()               { setScreen('levels'); }
  function handleHome()                  { setScreen('home'); }
  function handleExitGame()              { setScreen('levels'); }

  // "Verilerimi sil" (AUDIT 6.8): buluttaki players/{uid} dokümanı ve anonim
  // hesap silinir, başarılıysa yerel veri de silinir ve state ilk açılış
  // durumuna sıfırlanır. Başarısızsa yerel veriye hiç dokunulmaz.
  async function handleDeleteMyData(): Promise<boolean> {
    const result = await deleteOwnPlayerData().catch(() => ({ skipped: false, success: false }));
    if (!result.success) return false;

    await clearAllLocalData();
    setPlayerProfile(null);
    setHighScore(0);
    setHighestUnlockedLevel(1);
    setSessionStreak(0);
    setStreakAtDeath(0);
    setScreen('home');
    return true;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider style={styles.root}>
      <StatusBar style="light" />

      {screen === 'home' && (
        <HomeScreen
          bestScore={highScore}
          highestLevel={highestUnlockedLevel}
          onPlay={handlePlay}
          onScoreboard={handleScoreboard}
          onSettings={handleSettings}
        />
      )}

      {screen === 'scoreboard' && (
        <ScoreboardScreen
          highScore={highScore}
          highestUnlockedLevel={highestUnlockedLevel}
          onBack={handleHome}
          playerProfile={playerProfile}
        />
      )}

      {screen === 'profileSetup' && (
        <ProfileSetupScreen
          initialProfile={playerProfile}
          onBack={profileSetupReturnScreen === 'settings' ? handleSettings : undefined}
          onDone={handleProfileDone}
          submitLabel={playerProfile ? strings.saveLabel : strings.continueLabel}
          subtitle={playerProfile ? strings.editOrbitSubtitle : undefined}
          title={playerProfile ? strings.editOrbitTitle : undefined}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          onBack={handleHome}
          onDeleteData={handleDeleteMyData}
          onEditProfile={handleEditProfile}
          playerProfile={playerProfile}
        />
      )}

      {screen === 'levels' && (
        <LevelScreen
          focusedLevelId={runScoringEnabled ? highestUnlockedLevel : selectedLevelId}
          highestUnlockedLevel={
            DEV_UNLOCK_ALL_LEVELS ? LEVELS[LEVELS.length - 1].id : highestUnlockedLevel
          }
          onBack={handleHome}
          onSelectLevel={handleSelectLevel}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          initialLevelId={selectedLevelId}
          initialScore={runScoringEnabled ? highScore : 0}
          onExit={handleExitGame}
          onGoToLevels={() => setScreen('levels')}
          onGameOver={handleGameOver}
          onLevelUnlocked={handleLevelUnlocked}
          onScoreChanged={handleScoreChanged}
          scoringEnabled={runScoringEnabled}
          trainingMaxLevelId={runScoringEnabled ? undefined : highestUnlockedLevel}
        />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          finalScore={finalScore}
          isTraining={gameOverIsTraining}
          isNewRecord={isNewRecord}
          mistakes={gameOverMistakes}
          streak={streakAtDeath}
          onRestart={handleRestart}
          onHome={handleHome}
          onAdWatched={handleAdWatched}
          onStreakRollback={handleStreakRollback}
        />
      )}
      <AdMobBanner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AdMobBanner() {
  if (Platform.OS === 'web') return null;
  const adsModule = getAdsModule();

  if (!adsModule) {
    return (
      <View pointerEvents="auto" style={styles.bannerAdWrap}>
        <View style={styles.bannerFallback}>
          <Text style={styles.bannerFallbackLabel}>AD SDK</Text>
          <Text style={styles.bannerFallbackText}>Dev build required</Text>
        </View>
      </View>
    );
  }

  const { BannerAd, BannerAdSize, TestIds } = adsModule;

  return (
    <View pointerEvents="auto" style={styles.bannerAdWrap}>
      <BannerAd
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        unitId={TestIds.BANNER}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#0d0d1a',
    flex: 1,
  },
  bannerAdWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 18, 0.96)',
    borderColor: 'rgba(117, 247, 255, 0.3)',
    borderTopWidth: 1,
    bottom: 0,
    minHeight: 58,
    justifyContent: 'center',
    left: 0,
    paddingBottom: 4,
    paddingTop: 4,
    position: 'absolute',
    right: 0,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    zIndex: 999,
  },
  bannerFallback: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderColor: 'rgba(0, 212, 255, 0.28)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    height: 44,
    justifyContent: 'center',
    maxWidth: 360,
    width: '100%',
  },
  bannerFallbackLabel: {
    color: '#00d4ff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  bannerFallbackText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
