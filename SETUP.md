# SETUP.md — Kurulum

> Reanimated 4 kurulumu kritik. Babel plugin yanlışsa animasyon tarafında runtime hatası alınır.

## 1. Proje Oluştur

```bash
npx create-expo-app@latest arrow-orbit -t expo-template-blank-typescript
cd arrow-orbit
```

Bu repository'nin klasör adı geçmişten dolayı farklı olabilir; uygulama kimliği dokümanlarda **Arrow Orbit** olarak ele alınır.

## 2. Çekirdek Kütüphaneler

ÖNEMLİ: `npm install` yerine Expo uyumlu sürümler için `npx expo install` kullan.

```bash
# Animasyon
npx expo install react-native-reanimated react-native-worklets

# Dokunma
npx expo install react-native-gesture-handler

# Vektör çizim
npx expo install react-native-svg

# Kalıcı veri
npx expo install @react-native-async-storage/async-storage

# Ses ve haptic
npx expo install expo-av expo-haptics
```

## 3. Babel Yapılandırması

`babel.config.js` içinde Reanimated 4 için plugin **react-native-worklets/plugin** olmalı ve en sonda yer almalı.

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
```

## 4. Gesture Handler

`App.tsx`'in en üstünde:

```ts
import 'react-native-gesture-handler';
```

Kök component:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* içerik */}
    </GestureHandlerRootView>
  );
}
```

## 5. Çalıştır

Babel veya native modül değişikliğinden sonra cache temizleyerek başlat:

```bash
npx expo start -c
```

Telefonda Expo Go ile QR tara veya simülatör için `i` / `a` kullan.

## 6. Doğrulama

```bash
npx expo install --fix
npx tsc --noEmit
```

## 7. Firebase Global Skor

Global skor için Firebase Anonymous Auth + Firestore kullanılır. Kullanıcı oyun içinde yalnızca avatar ve isim seçer; Firebase kimliği arka planda anonim açılır.

Kurulum:

```bash
npm install firebase
cp .env.example .env.local
```

`.env.local` içine Firebase Web App config değerlerini gir:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Firestore veri modeli:

```text
players/{uid}
  username
  avatarId
  highScore
  highestUnlockedLevel
  updatedAt
```

Scoreboard `players` koleksiyonunu `highScore` alanına göre azalan sıralayıp top 20 olarak okur. Aynı oturumda kısa süreli memory cache kullanılır; skor/profil sync sonrası cache temizlenir.

Başlangıç Firestore rule önerisi:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{uid} {
      allow read: if true;
      allow create, update: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Sık Karşılaşılan Hatalar

| Hata | Çözüm |
|---|---|
| `Exception in HostFunction: <unknown>` | Babel plugin `react-native-worklets/plugin` mı? Sonra `npx expo start -c` |
| `Cannot find module 'babel-preset-expo'` | `npx expo install babel-preset-expo` |
| `Project is incompatible with this version of Expo Go` | Expo Go'yu güncelle veya simulator/dev build kullan |
| Beyaz ekran / "App entry not found" | Terminaldeki import/syntax hatasını oku |
| Paket sürüm uyarısı | `npx expo install --fix` |

## Asset Notu

Oyun objeleri ve UI SVG/View ile çizilir. Ses dosyaları dışında zorunlu görsel asset yoktur. Yeni görsel asset eklenecekse ticari kullanım lisansı net olmalıdır.
