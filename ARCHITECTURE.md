# ARCHITECTURE.md — Arrow Orbit Dosya Yapısı ve Mimari

## Genel Yaklaşım

Arrow Orbit tek dokunuşlu **dönen hedefe ok saplama** arcade oyunudur. Mimari, hedef rotasyonu, ok açıları, çarpışma toleransı, tek kalp koruması ve level ilerlemesi etrafında kuruludur.

- Tek yönlü veri akışı: state ekran component'inde, prop ile iner, olaylar callback ile çıkar.
- Oyun mantığı saf fonksiyonlarda tutulur; animasyon ve render component'lerde kalır.
- Oyun objeleri mümkün olduğunca SVG/View ile çizilir.
- Gereksiz tema/asset bağımlılığı eklenmez.

## Hedef Klasör Yapısı

```text
App.tsx                      # Navigasyon / ekran yönlendirme
assets/
  sounds/                    # Ses efektleri
src/
  data/
    levels.ts                # 50 level tanımı
    strings.ts               # UI metinleri
  components/
    icons/                   # react-native-svg ikonları
    Target.tsx               # Dönen hedef diski/halka/arena formu
    Pin.tsx                  # Aktif ve saplanmış ok render'ı
    HUD.tsx                  # Kalp + level
    SpaceBackground.tsx      # Yıldızlı arka plan + hilal
    ScreenFlash.tsx          # Kısa ekran flaşları
    LevelUpBanner.tsx        # Level complete geçişi
  screens/
    HomeScreen.tsx
    LevelScreen.tsx
    GameScreen.tsx           # Çekirdek oyun state'i ve animasyon orkestrasyonu
    GameOverScreen.tsx
  utils/
    gameLogic.ts             # Açı, çarpışma, level tamamlanma
    sounds.ts                # Ses çağrıları
    storage.ts               # Local progress/high score
  theme/
    colors.ts                # Ana renkler, zone renkleri ve feedback renkleri
```

## Level Veri Modeli

```ts
export type RotationDirection = 'clockwise' | 'counterClockwise';

export type SpeedPattern =
  | 'constant'
  | 'accelerating'
  | 'stopAndGo'
  | 'switchDirection'
  | 'fakeReverse'
  | 'glitch';

export type SpecialObjectType = 'heart';

export type LevelConfig = {
  id: number;
  requiredPins: number;
  rotationDuration: number;
  direction: RotationDirection;
  collisionToleranceDeg: number;
  initialPins: number[];
  speedPattern: SpeedPattern;
  archetype: LevelArchetype;
  theme: LevelTheme;
  specialObjects?: Array<{
    type: SpecialObjectType;
    angle: number;
  }>;
};
```

- `requiredPins`: level bitirmek için saplanacak ok sayısı.
- `rotationDuration`: tam dönüş süresi; küçük değer daha hızlı oyun demektir.
- `collisionToleranceDeg`: yeni okun mevcut oka ne kadar yaklaşınca çarpışacağı.
- `initialPins`: level başında hedefte hazır duran engel ok açıları.
- `speedPattern`: dönüş ritmini belirler.
- `specialObjects`: hedef üzerinde dönen kalp objeleri.

## Oyun State Modeli

```ts
type GameState = {
  score: number;
  streak: number;
  placedPins: number[];
  remainingPins: number;
  lives: number; // 1 = kalp dolu, 0 = kalp boş
};
```

- `placedPins`, hedefin lokal açılarında tutulur.
- Hedef döndükçe oklar görsel olarak hedefle birlikte döner.
- Yeni okun hedefe saplandığı lokal açı, anlık rotation'dan hesaplanır.
- Hata sırasında kalp doluysa sadece `lives` 0 olur; `placedPins` ve `remainingPins` korunur.
- Hata sırasında kalp boşsa game over akışı çalışır.

## `gameLogic.ts` Saf Fonksiyonları

```ts
normalizeAngle(angle: number): number
angleDistance(a: number, b: number): number
getImpactAngle(rotation: number): number
willCollideWithPins(impactAngle: number, placedPins: number[], toleranceDeg: number): boolean
addPin(placedPins: number[], impactAngle: number): number[]
isLevelComplete(placedPins: number[], requiredPins: number): boolean
createLevelState(requiredPins: number, initialPins?: number[]): GameState
applySafeHit(state: GameState, impactAngle: number): GameState
```

## Component Görevleri

### `Target.tsx`

- Merkezde dönen hedefi çizer.
- Reanimated `rotation` shared value ile döner.
- Level aralığına göre disk, halka, rozet, çift halka veya arena formu gösterir.
- Merkezde kalan ok sayısını gösterir.

### `Pin.tsx`

- Tek ok görselini çizer.
- İki kullanım modu:
  - fırlatılacak aktif ok
  - hedefe saplanmış ok
- Zone bazlı varsayılan renk ve şekil varyasyonu uygular.

### `HUD.tsx`

- Sol üstte tek SVG kalp.
- Ortada level bilgisi.
- Kalp doluysa hata affedilir; kalp boşsa sıradaki hata oyunu bitirir.

### `SpaceBackground.tsx`

- Koyu uzay zemini üzerinde yıldızlar ve sağ üstte sade hilal ay çizer.
- Zone rengini hafif arka plan wash olarak kullanır.
- Oynanış objelerini bastıracak yoğun efekt üretmez.

### `ScreenFlash.tsx`

- Hata için kırmızı flash.
- Başarılı saplanma için kısa yeşil flash.

## Veri Akışı

```text
GameScreen
  state: levelIdx, gameState, consumedSpecials, pinLaunched, gameOver
  shared: targetRotation, pinY, shakeX, targetShakeY

tap
  -> aktif ok fırlatma animasyonu
  -> impact anında targetRotation okunur
  -> getImpactAngle(rotation)
  -> willCollideWithPins(...)
    -> çarpışma + kalp dolu: kalp boşalır, level kaldığı yerden sürer
    -> çarpışma + kalp boş: game over
    -> güvenli: ok eklenir, remainingPins azalır
       -> kalp objesi vurulduysa kalp dolar
       -> level tamamlandıysa sonraki level
       -> değilse yeni ok hazırlanır
```

## Animasyon Sorumlulukları

| Animasyon | Nerede |
|---|---|
| Hedef dönüşü | `GameScreen` shared value + `Target` render |
| Aktif ok fırlatma | `GameScreen` + `Pin` |
| Saplanmış okların hedefle dönmesi | `GameScreen` pin orbit |
| Çarpışma shake | `GameScreen` |
| Hedef mikro sarsıntısı | `GameScreen` |
| Fail / success flash | `ScreenFlash` |
| Level complete banner | `LevelUpBanner` |

## State ve Kalıcılık

- Aşama 1-3: `useState`, `useRef`, Reanimated shared value.
- Local storage:
  - highestUnlockedLevel
  - highScore
  - ileride soundEnabled / hapticsEnabled
- Leaderboard sadece yayın öncesi net ihtiyaç olursa eklenir.

## Kod Sağlığı Kuralları

- Her davranış değişikliğinden sonra `npx tsc --noEmit`.
- Oyun matematiği UI içine gömülmez.
- Asset veya paket eklemeden önce mevcut SVG/View çözümü yeterli mi kontrol edilir.
- Referans oyunların isim, ikon veya store görsel düzeni kopyalanmaz.
