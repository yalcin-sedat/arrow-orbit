import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import PlayerAvatarBadge from '../components/PlayerAvatarBadge';
import { PLAYER_AVATARS } from '../data/playerAvatars';
import { strings } from '../data/strings';
import { colors } from '../theme/colors';
import {
  PlayerAvatarId,
  PlayerProfile,
  savePlayerProfile,
} from '../utils/storage';

type ProfileSetupScreenProps = {
  initialProfile?: PlayerProfile | null;
  onBack?: () => void;
  onDone: (profile: PlayerProfile) => void;
  submitLabel?: string;
  subtitle?: string;
  title?: string;
};

export default function ProfileSetupScreen({
  initialProfile = null,
  onBack,
  onDone,
  submitLabel = strings.continueLabel,
  subtitle = strings.chooseOrbitSubtitle,
  title = strings.chooseOrbitTitle,
}: ProfileSetupScreenProps) {
  const { width } = useWindowDimensions();
  const [selectedAvatarId, setSelectedAvatarId] = useState<PlayerAvatarId>(initialProfile?.avatarId ?? 'nova');
  const [username, setUsername] = useState(initialProfile?.username ?? '');
  const [saving, setSaving] = useState(false);
  const contentWidth = Math.min(width - 28, 430);
  const cleanedName = useMemo(() => username.trim().replace(/\s+/g, ' '), [username]);
  const canContinue = cleanedName.length >= 3 && !saving;
  const selectedAvatar = PLAYER_AVATARS.find((avatar) => avatar.id === selectedAvatarId) ?? PLAYER_AVATARS[0];
  const inputWidth = Math.min(contentWidth, Math.max(168, 104 + Math.max(username.length, 3) * 19));

  async function handleContinue() {
    if (!canContinue) return;

    const profile: PlayerProfile = {
      avatarId: selectedAvatarId,
      username: cleanedName.slice(0, 14),
    };

    setSaving(true);
    await savePlayerProfile(profile);
    onDone(profile);
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <ScrollView
            contentContainerStyle={[styles.content, { width: contentWidth }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topBar}>
              {onBack ? (
                <TouchableOpacity
                  activeOpacity={0.78}
                  onPress={onBack}
                  style={styles.backButton}
                >
                  <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>
              ) : null}
              <View style={styles.kickerGroup}>
                <PlayerCardIcon />
                <Text style={styles.kicker}>{strings.profileCardTag}</Text>
              </View>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <View style={styles.selectedPill}>
              <PlayerAvatarBadge
                accent={selectedAvatar.accent}
                selected
                size={54}
                symbol={selectedAvatar.id}
              />
              <View style={styles.selectedCopy}>
                <Text style={styles.selectedLabel}>{strings.selectedTag}</Text>
                <Text style={[styles.selectedName, { color: selectedAvatar.accent }]}>
                  {selectedAvatar.label}
                </Text>
              </View>
            </View>

            <View style={styles.avatarGrid}>
              {PLAYER_AVATARS.map((avatar) => {
                const selected = avatar.id === selectedAvatarId;

                return (
                  <TouchableOpacity
                    activeOpacity={0.82}
                    key={avatar.id}
                    onPress={() => setSelectedAvatarId(avatar.id)}
                    style={[
                      styles.avatarButton,
                      selected && {
                        shadowColor: avatar.accent,
                        shadowOpacity: 0.34,
                      },
                    ]}
                  >
                    <View style={[styles.avatarCircleWrap, selected && { borderColor: avatar.accent }]}>
                      <PlayerAvatarBadge
                        accent={avatar.accent}
                        selected={selected}
                        size={66}
                        symbol={avatar.id}
                      />
                      {selected ? (
                        <View style={[styles.selectedDot, { backgroundColor: avatar.accent }]}>
                          <Text style={styles.selectedDotText}>✓</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.avatarLabel, selected && { color: avatar.accent }]}>
                      {avatar.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>{strings.playerNameLabel}</Text>
              <TextInput
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={14}
                onChangeText={setUsername}
                placeholder={strings.playerNamePlaceholder}
                placeholderTextColor="rgba(255,255,255,0.25)"
                returnKeyType="done"
                style={[styles.input, { width: inputWidth }]}
                value={username}
              />
              <Text style={styles.helperText}>{strings.playerNameHelper}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={canContinue ? 0.82 : 1}
              disabled={!canContinue}
              onPress={handleContinue}
              style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
            >
              <Text style={[styles.continueText, !canContinue && styles.continueTextDisabled]}>
                {submitLabel}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function PlayerCardIcon() {
  return (
    <Svg height={25} viewBox="0 0 32 32" width={25}>
      <Path
        d="M16 3.8 18.6 11.5 26.8 12.1 20.6 17.3 22.6 25.2 16 20.9 9.4 25.2 11.4 17.3 5.2 12.1 13.4 11.5Z"
        fill="rgba(255,216,74,0.18)"
        stroke={colors.neonGold}
        strokeLinejoin="round"
        strokeWidth="2.1"
      />
      <Circle
        cx="16"
        cy="16"
        fill="rgba(2,6,21,0.78)"
        r="7"
        stroke="#dffbff"
        strokeOpacity="0.9"
        strokeWidth="2"
      />
      <Path
        d="M16 10.2 17.7 14.3 22 16 17.7 17.7 16 21.8 14.3 17.7 10 16 14.3 14.3Z"
        fill={colors.neonGold}
        stroke={colors.neonGold}
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,212,255,0.12)',
    borderColor: 'rgba(117,247,255,0.32)',
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
    width: 42,
  },
  backText: {
    color: '#dffbff',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: -3,
  },
  root: {
    backgroundColor: '#020615',
    flex: 1,
  },
  safe: {
    alignItems: 'center',
    flex: 1,
  },
  keyboard: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  content: {
    alignSelf: 'center',
    paddingBottom: 28,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  kicker: {
    color: colors.neonGold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.2,
    lineHeight: 16,
    textAlign: 'center',
  },
  kickerGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(223,251,255,0.64)',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  avatarButton: {
    alignItems: 'center',
    minHeight: 104,
    paddingTop: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    width: 92,
  },
  avatarLabel: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 6,
  },
  avatarCircleWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 43,
    borderWidth: 2,
    height: 78,
    justifyContent: 'center',
    position: 'relative',
    width: 78,
  },
  selectedPill: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(4, 16, 38, 0.72)',
    borderColor: 'rgba(117,247,255,0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  selectedCopy: {
    minWidth: 96,
  },
  selectedLabel: {
    color: 'rgba(223,251,255,0.5)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  selectedName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 1,
  },
  inputBlock: {
    alignItems: 'center',
    marginTop: 14,
  },
  inputLabel: {
    color: 'rgba(223,251,255,0.64)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderColor: 'rgba(117,247,255,0.34)',
    borderRadius: 8,
    borderWidth: 1.4,
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    height: 58,
    letterSpacing: 0,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  helperText: {
    color: 'rgba(223,251,255,0.42)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: colors.neonGold,
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    marginTop: 22,
    shadowColor: colors.neonGold,
    shadowOpacity: 0.38,
    shadowRadius: 14,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowOpacity: 0,
  },
  continueText: {
    color: '#101018',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  continueTextDisabled: {
    color: 'rgba(255,255,255,0.32)',
  },
  selectedDot: {
    alignItems: 'center',
    borderColor: '#020615',
    borderRadius: 12,
    borderWidth: 2,
    bottom: 0,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 24,
  },
  selectedDotText: {
    color: '#07101c',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
  },
  topBar: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    marginBottom: 18,
    position: 'relative',
    width: '100%',
  },
});
