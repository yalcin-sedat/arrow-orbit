# VISUALS.md — Arrow Orbit Görsel Sistem

## 1. Zone Renk Paleti

Her zone'un bir atmosfer rengi var. Level geçişlerinde hedef, ok ve arka plan vurgu rengi bu palete doğru kayar.

| Zone | Level | Ana Renk | Vurgu | His |
|---|---:|---|---|---|
| Öğrenme | 1-8 | `#00C8FF` cyan | `#0A1A2F` lacivert | Sakin, açık |
| Ödül | 9-15 | `#00E87A` yeşil | `#FFD700` altın | İlerleme |
| Risk | 16-25 | `#FF7A00` turuncu | `#FF3300` kırmızı | Gerilim |
| Ritim Bozma | 26-35 | `#AA00FF` mor | `#FF0055` kırmızı-mor | Kaos |
| Final | 36-45 | `#E8E8E8` beyaz | `#C0C0C0` gümüş | Berrak, keskin |
| Prestige | 46-50 | `#0A0A0A` siyah | `#FFD700` altın | Ağır, seçkin |

## 2. Hedef Şekilleri

Oynanışa etkisi yoktur; saf görsel kimliktir. Her 10 levelda bir yeni form kullanılır.

| Level | Şekil | Açıklama |
|---|---|---|
| 1-10 | Disk | Sade dolu daire, ince parlak border |
| 11-20 | Halka | İç ve dış halka daha belirgin |
| 21-30 | Rozet | Çokgen hissi ve daha sert kenar |
| 31-40 | Çift Halka | İç/dış ritim halkaları |
| 41-50 | Arena | Daha yoğun, prestige hissi veren form |

## 3. Ok Türleri

Her zone'da varsayılan ok stili değişir. Koleksiyon ekranı eklenirse farklı skinler seçilebilir ama varsayılan stil bile ilerleme hissi verir.

| Zone | Level | Default Ok Stili | Renk |
|---|---:|---|---|
| Öğrenme | 1-8 | 3D metal ok | Beyaz metal + cyan glow |
| Ödül | 9-15 | Parlak 3D ok | Yeşil + altın |
| Risk | 16-25 | Sıcak vurgulu 3D ok | Turuncu / kırmızı |
| Ritim Bozma | 26-35 | Enerjik 3D ok | Mor + parlak vurgu |
| Final | 36-45 | Keskin metal ok | Gümüş + soğuk mavi |
| Prestige | 46-50 | Prestij 3D ok | Altın + koyu outline |

Aktif ok fırlarken arkasında kendi zone renginde kısa neon iz ve yanlara açılan hız çizgileri bırakır. İz, okun havayı yarıyormuş hissini vermeli; yalnızca fırlatma anında görünür. Saplanmış oklar trail göstermez, böylece hedef çevresi kalabalıklaşmaz.

## 4. Özel Durum Görsel Kuralları

### Fail

- Kısa kırmızı ekran flash.
- Ekran shake.
- Çarpışan aktif ok hedefe eklenmez; yana dönerek aşağı düşer.
- Kalp doluysa kalp boşalır ve oyun kaldığı yerden sürer.
- Kalp boşsa game over.

### Başarılı Atış

- Ekranı kaplayan yeşil flash kullanılmaz.
- Geri bildirim sadece çarkta kalır: hedef ve saplanmış oklar mikro sarsılır.
- Aktif ok anlık gizlenir, yeni ok alttan gelir.

### Level Complete

- Hatasız geçişte kısa level banner.
- Hata yapılmışsa level sessiz geçebilir; oyuncu akışı bozulmaz.

### Heart

- Hedef üzerinde dönen küçük SVG kalp.
- Vurulunca boş kalbi doldurur.
- Heart zor levelda değerli kurtarma hissi vermeli; kolay levelda gereksiz bol dağıtılmamalı.

## 5. Arka Plan

- Tüm zonelarda koyu, sade uzay zemini.
- Yıldız sayısı oyuna atmosfer verir ama hedefi bastırmaz.
- Sağ üstte sade parlak hilal ay bulunur.
- Büyük çerçeve/vinyet kullanılmaz; oyun alanı tek parça görünmelidir.

## 6. Renk Sabitleri

```ts
export const zoneColors = {
  learning:   { primary: '#00C8FF', accent: '#0A1A2F' },
  reward:     { primary: '#00E87A', accent: '#FFD700' },
  risk:       { primary: '#FF7A00', accent: '#FF3300' },
  chaos:      { primary: '#AA00FF', accent: '#FF0055' },
  final:      { primary: '#E8E8E8', accent: '#C0C0C0' },
  prestige:   { primary: '#0A0A0A', accent: '#FFD700' },
} as const;

export const feedbackColors = {
  fail:          '#FF2020',
  hitSpark:      '#FFFFFF',
  levelComplete: '#FFD700',
  bossComplete:  '#00C8FF',
  heartPickup:   '#00E87A',
} as const;
```
