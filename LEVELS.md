# LEVELS.md — Arrow Orbit Level Tasarımı

## Ana Karar

Arrow Orbit 50 leveldan oluşur:

- **1-45:** zor ama adil ana oyun.
- **46-50:** prestige/challenge; oyuncunun başarması neredeyse imkansız olabilir.

Önemli not: `collisionToleranceDeg` büyüdükçe oyun **zorlaşır**. Bu değer pin etrafındaki çarpışma alanıdır. Yani kolay levellarda küçük, zor levellarda büyük tutulur.

Adalet kuralı: `collisionToleranceDeg` okun görsel boyutundan çok daha büyük olmamalıdır. Oyuncu boşluk görüyorsa atış güvenli hissettirmeli; zorluk görünmez çarpışma alanıyla değil hız, ok sayısı, engel dizilimi ve dönüş pattern'iyle verilmelidir.

## Level Arketipleri

| Arketip | Amaç | Ne test eder |
|---|---|---|
| `breath` | Nefes / öğrenme | Çekirdek atış döngüsü |
| `tempo` | Ritim | Hız ve tekrar |
| `reverse` | Ters dünya | Yön algısı |
| `sniper` | Acele etme | Sabır ve açı okuma |
| `ambush` | Pusu | Dolu çarkta boşluk bulma |
| `metronome` | Bekle | Stop-and-go ritim |
| `avalanche` | Çığ | Hızlanmadan önce bitirme |
| `chaos` | Kaos | Yön değiştiren hedef |
| `corridor` | Koridor | Dar geçit bekleme |
| `trap` | Tuzak | Fake reverse / glitch |
| `boss` | Sınav | Önceki mekaniklerin birleşimi |
| `prestige` | İmkansıza yakın | Ustalık / meydan okuma |

## Special Objects

| Obje | Etki | Kullanım |
|---|---|---|
| `heart` | Boş kalbi doldurur; bir hatayı affeder | Kolayda az değerli, zor levelda stratejik ödül |

Oyuncu tek dolu kalple başlar. Hatalı atışta kalp boşalır ama oyun devam eder; daha önce saplanan oklar geri alınmaz ve level kaldığı yerden sürer. Kalp boşken yapılan hatalı atış oyunu bitirir. Heart objesi boş kalbi tekrar doldurur. Heart kolay levelda bol dağıtılmamalı; asıl değeri zor/boss/prestige levellarda "son anda kurtardı" hissidir.

## Spin Patterns

| Pattern | Etki |
|---|---|
| `constant` | Sabit dönüş |
| `accelerating` | Yavaş başlar, hızlanır |
| `stopAndGo` | Döner, durur, tekrar döner |
| `switchDirection` | İleri-geri yön değiştirir |
| `fakeReverse` | Ters dönecekmiş gibi yapar |
| `glitch` | Bozuk çark gibi takılır/hızlanır |

## Progression

| Bölge | Level | Odak |
|---|---:|---|
| Öğrenme | 1-8 | Düşük tolerans, daha uzun ok ritmi, temel kontrol |
| Ödül + İlk Varyasyon | 9-15 | Heart, sniper, stopAndGo, accelerating, ilk boss |
| Risk-Ödül | 16-25 | Ters yön, heart, koridor |
| Ritim Bozma | 26-35 | switchDirection, fakeReverse, glitch |
| Final Adil Zorluk | 36-45 | Kombinasyonlar, dar çarpışma alanı, son boss |
| Prestige | 46-50 | Neredeyse imkansız meydan okuma |

## Kod Karşılığı

Asıl level listesi [src/data/levels.ts](src/data/levels.ts) içindedir. Her level şu alanları kullanır:

```ts
type LevelConfig = {
  id: number;
  requiredPins: number;
  rotationDuration: number;
  direction: 'clockwise' | 'counterClockwise';
  collisionToleranceDeg: number;
  initialPins: number[];
  speedPattern:
    | 'constant'
    | 'accelerating'
    | 'stopAndGo'
    | 'switchDirection'
    | 'fakeReverse'
    | 'glitch';
  archetype: LevelArchetype;
  theme: LevelTheme;
  specialObjects?: Array<{
    type: 'heart';
    angle: number;
  }>;
};
```

## Tasarım İlkeleri

- Yeni mekanik önce güvenli/kolay levelda tanıtılır.
- Boss level mekanikleri birleştirir ama haksız sürpriz yapmaz.
- Görünmez engel hissi yaratacak büyük çarpışma toleranslarından kaçınılır.
- 45. level ana oyunun son adil boss'u gibi davranır.
- 46-50 oyuncuya "buradan sonrası prestij" hissi vermelidir.
- Heart zorlaştıkça azaltılmaz; doğru açıda yakalanırsa oyuncuya umut verir.
