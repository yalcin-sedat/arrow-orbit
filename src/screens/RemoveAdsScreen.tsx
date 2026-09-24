import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';

type RemoveAdsScreenProps = {
  onBack: () => void;
};

export default function RemoveAdsScreen({ onBack }: RemoveAdsScreenProps) {
  function handleBuy() {
    Alert.alert('Remove Ads', 'In-app purchase setup will be connected before release.');
  }

  function handleRestore() {
    Alert.alert('Restore Purchase', 'Purchase restore will be connected before release.');
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.78} onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.titleGroup}>
            <NoAdsIcon size={28} />
            <Text style={styles.title}>REMOVE ADS</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.heroIcon}>
            <NoAdsIcon size={86} />
          </View>

          <Text style={styles.headline}>Play without interruptions.</Text>
          <Text style={styles.copy}>
            Remove banner ads and level break video ads with a single purchase.
          </Text>

          <View style={styles.planCard}>
            <View>
              <Text style={styles.planTitle}>Remove Ads</Text>
              <Text style={styles.planSubtitle}>One-time purchase</Text>
            </View>
            <View style={styles.pricePill}>
              <Text style={styles.priceText}>$1.99</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.82} onPress={handleBuy} style={styles.buyButton}>
            <Text style={styles.buyText}>BUY</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.72} onPress={handleRestore} style={styles.restoreButton}>
            <Text style={styles.restoreText}>RESTORE PURCHASE</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            Store purchase will be activated when App Store and Google Play products are ready.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function NoAdsIcon({ size }: { size: number }) {
  return (
    <Svg height={size} viewBox="0 0 64 64" width={size}>
      <Defs>
        <LinearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#00ff88" stopOpacity="0.18" />
          <Stop offset="1" stopColor="#00ff88" stopOpacity="0.04" />
        </LinearGradient>
      </Defs>

      {/* Shield body */}
      <Path
        d="M32 6 L52 13 L52 30 C52 43 43 52 32 58 C21 52 12 43 12 30 L12 13 Z"
        fill="url(#shieldGrad)"
        stroke="#00ff88"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />

      {/* Inner shield highlight */}
      <Path
        d="M32 11 L47 17 L47 30 C47 40 40 48 32 53 C24 48 17 40 17 30 L17 17 Z"
        fill="none"
        stroke="#00ff88"
        strokeLinejoin="round"
        strokeOpacity="0.22"
        strokeWidth="1"
      />

      {/* X mark — two crossing lines */}
      <G>
        <Path
          d="M23 23 L41 41"
          stroke="#00ff88"
          strokeLinecap="round"
          strokeWidth="4.4"
        />
        <Path
          d="M41 23 L23 41"
          stroke="#00ff88"
          strokeLinecap="round"
          strokeWidth="4.4"
        />
        {/* White core glow on X */}
        <Path
          d="M23 23 L41 41"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeOpacity="0.55"
          strokeWidth="1.6"
        />
        <Path
          d="M41 23 L23 41"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeOpacity="0.55"
          strokeWidth="1.6"
        />
      </G>
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
  buyButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.neonGreen,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 62,
    shadowColor: colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
  },
  buyText: {
    color: '#031120',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 44,
  },
  copy: {
    color: 'rgba(230,246,255,0.62)',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    maxWidth: 330,
    textAlign: 'center',
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
  headline: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,136,0.08)',
    borderColor: 'rgba(0,255,136,0.42)',
    borderRadius: 34,
    borderWidth: 1,
    height: 122,
    justifyContent: 'center',
    width: 122,
  },
  note: {
    color: 'rgba(230,246,255,0.42)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    lineHeight: 17,
    marginTop: 4,
    maxWidth: 320,
    textAlign: 'center',
  },
  planCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(4, 16, 38, 0.82)',
    borderColor: colors.neonGreen,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    minHeight: 86,
    padding: 16,
  },
  planSubtitle: {
    color: 'rgba(230,246,255,0.52)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 5,
  },
  planTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  pricePill: {
    alignItems: 'center',
    backgroundColor: colors.neonGreen,
    borderRadius: 14,
    minWidth: 86,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  priceText: {
    color: '#031120',
    fontSize: 18,
    fontWeight: '900',
  },
  restoreButton: {
    alignItems: 'center',
    borderColor: 'rgba(117,247,255,0.24)',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 20,
  },
  restoreText: {
    color: 'rgba(230,246,255,0.64)',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
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
    letterSpacing: 1.4,
  },
  titleGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
});
