import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import PlayerAvatarBadge from '../components/PlayerAvatarBadge';
import { getPlayerAvatarOption } from '../data/playerAvatars';
import { strings } from '../data/strings';
import { colors } from '../theme/colors';
import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
  PlayerProfile,
  getAppSettings,
  saveAppSettings,
} from '../utils/storage';
import { sounds } from '../utils/sounds';

type SettingsScreenProps = {
  onEditProfile: () => void;
  onBack: () => void;
  playerProfile: PlayerProfile | null;
};

export default function SettingsScreen({ onBack, onEditProfile, playerProfile }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  useEffect(() => {
    let mounted = true;

    getAppSettings().then((storedSettings) => {
      if (!mounted) return;
      setSettings(storedSettings);
      sounds.setEnabled(storedSettings.soundEnabled);
    });

    return () => {
      mounted = false;
    };
  }, []);

  function updateSetting(key: keyof AppSettings, value: boolean) {
    const next = {
      ...settings,
      [key]: value,
    };

    setSettings(next);
    saveAppSettings(next);

    if (key === 'soundEnabled') {
      sounds.setEnabled(value);
      if (value) {
        sounds.button();
      }
    }
  }

  function showInfo(title: string) {
    Alert.alert('Arrow Orbit', `${title} bağlantısı yayın hazırlığında eklenecek.`);
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <Header title={strings.ayarlar.toUpperCase()} onBack={onBack} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ProfileRow profile={playerProfile} onEditProfile={onEditProfile} />

          <SettingRow
            accent={colors.neonBlue}
            icon="sound"
            label={strings.sound}
            tag="AUDIO"
            value={settings.soundEnabled}
            onValueChange={(value) => updateSetting('soundEnabled', value)}
          />
          <SettingRow
            accent={colors.neonGreen}
            icon="haptics"
            label={strings.haptics}
            tag="FEEDBACK"
            value={settings.hapticsEnabled}
            onValueChange={(value) => updateSetting('hapticsEnabled', value)}
          />
          <SettingRow
            accent={colors.neonBlue}
            icon="screenFlash"
            label={strings.screenFlash}
            tag="VISUAL"
            value={settings.screenFlashEnabled}
            onValueChange={(value) => updateSetting('screenFlashEnabled', value)}
          />

          <View style={styles.linkRow}>
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={() => showInfo(strings.privacy)}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>{strings.privacy.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={() => showInfo(strings.terms)}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>{strings.terms.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ProfileRow({
  onEditProfile,
  profile,
}: {
  onEditProfile: () => void;
  profile: PlayerProfile | null;
}) {
  const avatar = getPlayerAvatarOption(profile?.avatarId ?? 'nova');
  const playerName = profile?.username ?? 'PLAYER';

  return (
    <View style={[styles.profileRow, { borderColor: avatar.accent }]}>
      <View style={styles.settingInfo}>
        <View style={[styles.profileAvatar, { backgroundColor: `${avatar.accent}22`, borderColor: avatar.accent }]}>
          <PlayerAvatarBadge accent={avatar.accent} size={46} symbol={avatar.id} />
        </View>
        <View style={styles.settingCopy}>
          <Text style={styles.settingLabel}>{playerName}</Text>
          <Text style={styles.settingTag}>{avatar.label.toUpperCase()} PROFILE</Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.78} onPress={onEditProfile} style={styles.editProfileButton}>
        <Text style={styles.editProfileText}>EDIT</Text>
      </TouchableOpacity>
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
        <SettingHeaderIcon />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function SettingHeaderIcon() {
  return (
    <Svg height={26} viewBox="0 0 32 32" width={26}>
      <Path
        d="M18.8 3 20 6.2a11.1 11.1 0 0 1 2.1 1.2l3.3-.6 2.8 4.8-2.3 2.5a10.7 10.7 0 0 1 0 2.4l2.3 2.5-2.8 4.8-3.3-.6a11.1 11.1 0 0 1-2.1 1.2L18.8 29h-5.6L12 25.8a11.1 11.1 0 0 1-2.1-1.2l-3.3.6L3.8 20.4l2.3-2.5a10.7 10.7 0 0 1 0-2.4l-2.3-2.5 2.8-4.8 3.3.6A11.1 11.1 0 0 1 12 6.2L13.2 3Z"
        fill="rgba(0,212,255,0.12)"
        stroke={colors.neonBlue}
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <Circle cx="16" cy="16" fill="none" r="4.1" stroke="#dffbff" strokeWidth="2.4" />
    </Svg>
  );
}

function SettingRow({
  accent,
  icon,
  label,
  onValueChange,
  tag,
  value,
}: {
  accent: string;
  icon: SettingIconType;
  label: string;
  onValueChange: (value: boolean) => void;
  tag: string;
  value: boolean;
}) {
  return (
    <View style={[styles.settingRow, { borderColor: accent }]}>
      <View style={styles.settingInfo}>
        <View style={[styles.settingIconFrame, { backgroundColor: `${accent}22` }]}>
          <SettingOptionIcon color={accent} type={icon} />
        </View>
        <View style={styles.settingCopy}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingTag}>{tag}</Text>
        </View>
      </View>
      <PremiumToggle accent={accent} onValueChange={onValueChange} value={value} />
    </View>
  );
}

function PremiumToggle({
  accent,
  onValueChange,
  value,
}: {
  accent: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      activeOpacity={0.82}
      onPress={() => onValueChange(!value)}
      style={[
        styles.toggleTrack,
        {
          backgroundColor: value ? accent : 'rgba(255,255,255,0.1)',
          borderColor: value ? accent : 'rgba(230,246,255,0.16)',
        },
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          value ? styles.toggleThumbOn : styles.toggleThumbOff,
        ]}
      />
      <Text style={[styles.toggleText, value ? styles.toggleTextOn : styles.toggleTextOff]}>
        {value ? 'ON' : 'OFF'}
      </Text>
    </TouchableOpacity>
  );
}

type SettingIconType = 'haptics' | 'screenFlash' | 'sound';

function SettingOptionIcon({ color, type }: { color: string; type: SettingIconType }) {
  return (
    <Svg height={32} viewBox="0 0 32 32" width={32}>
      {type === 'sound' ? (
        <>
          <Path
            d="M5 13h6l8-6v18l-8-6H5Z"
            fill="rgba(0,212,255,0.12)"
            stroke={color}
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
          <Path d="M22 12c2.2 2.4 2.2 5.6 0 8" fill="none" stroke="#dffbff" strokeLinecap="round" strokeWidth="2.1" />
          <Path d="M25.8 8.5c4.3 4.6 4.3 10.4 0 15" fill="none" stroke={color} strokeLinecap="round" strokeOpacity="0.7" strokeWidth="1.8" />
        </>
      ) : null}

      {type === 'haptics' ? (
        <>
          <Path
            d="M12 5h8a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"
            fill="rgba(0,212,255,0.1)"
            stroke={color}
            strokeWidth="2.3"
          />
          <Path d="M14 23h4M5.5 11.5 3.5 9M5.5 20.5 3.5 23M26.5 11.5 28.5 9M26.5 20.5 28.5 23" stroke="#dffbff" strokeLinecap="round" strokeWidth="2" />
        </>
      ) : null}

      {type === 'screenFlash' ? (
        <Path
          d="M17.5 3 8 18h7l-1.5 11L24 14h-7Z"
          fill="rgba(0,212,255,0.16)"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      ) : null}

    </Svg>
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
  linkButton: {
    alignItems: 'center',
    borderColor: 'rgba(117,247,255,0.35)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 12,
  },
  linkRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  linkText: {
    color: colors.neonBlue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  editProfileButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,216,74,0.38)',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 70,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editProfileText: {
    color: colors.neonGold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  profileAvatar: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  profileRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 16, 38, 0.82)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 86,
    padding: 14,
  },
  root: {
    backgroundColor: '#020615',
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  settingLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  settingIconFrame: {
    alignItems: 'center',
    borderRadius: 20,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  settingInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 14,
  },
  settingCopy: {
    flexShrink: 1,
  },
  settingRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 16, 38, 0.82)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 86,
    padding: 14,
  },
  settingTag: {
    color: 'rgba(230,246,255,0.52)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginTop: 4,
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
  toggleText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    position: 'absolute',
  },
  toggleTextOff: {
    color: 'rgba(230,246,255,0.48)',
    right: 10,
  },
  toggleTextOn: {
    color: '#031120',
    left: 12,
  },
  toggleThumb: {
    borderRadius: 14,
    height: 28,
    position: 'absolute',
    top: 3,
    width: 28,
  },
  toggleThumbOff: {
    backgroundColor: 'rgba(230,246,255,0.72)',
    left: 3,
  },
  toggleThumbOn: {
    backgroundColor: '#ffffff',
    right: 3,
  },
  toggleTrack: {
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    minWidth: 78,
    position: 'relative',
  },
});
