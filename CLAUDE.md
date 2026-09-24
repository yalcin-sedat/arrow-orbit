# CLAUDE.md

Bu dosya Claude Code / Codex oturumları için proje talimatlarını içerir.

## Proje Özeti

**Arrow Orbit** — tek dokunuşla oynanan, dönen hedefe ok saplama üzerine kurulu mobil arcade zamanlama oyunu.

Oyuncu ekrana dokunur; alttaki ok hedefe fırlar. Ok hedefe saplanır ve hedefle birlikte dönmeye devam eder. Yeni ok, daha önce saplanan oklara çarparsa kalp doluysa kalp boşalır ve oyun devam eder; kalp boşsa oyun biter. Gerekli ok sayısı tamamlanınca level geçilir.

## Çekirdek Mekanik

- **Tek input:** ekrana dokun.
- **Hedef:** ortada dönen disk/halka/rozet/arena.
- **Ok:** alttan hedefe fırlar.
- **Başarılı atış:** ok hedefe saplanır, hedefle birlikte dönmeye devam eder.
- **Hata:** yeni ok mevcut oka çok yakın açıyla saplanmaya çalışırsa çarpışma olur.
- **Kalp:** doluyken bir hatayı affeder, boşken yapılan hata game over yapar.
- **Level complete:** `requiredPins` kadar güvenli ok saplanır.
- **Ana his:** hızlı, net, tekrar oynatan, "az kaldı" duygusu veren arcade.

## Teknoloji Yığını

- Expo + React Native + TypeScript
- React Native Reanimated 4 + `react-native-worklets`
- React Native SVG
- React Native Gesture Handler
- AsyncStorage
- Skia kullanma; SVG + View yeterli.

## Dil Kuralı

- UI dili proje kararına göre tek dilde tutulmalı.
- Yeni metinler `src/data/strings.ts` içinde tutulmalı.
- Rastgele hardcoded UI metni ekleme.

## Telif ve Klon Riski

- Referans oyunlardan sadece tür ve ürün dersi alınır.
- İsim, ikon, mağaza görseli, level düzeni, hedef/ok görseli birebir kopyalanmaz.
- Lisanslı logo, karakter, marka veya store kimliği kullanılmaz.

## Kod Stili Kuralları

- TypeScript; `any` kullanma.
- Oyun matematiğini saf fonksiyonlarda tut.
- Şu konularda kısa Türkçe yorum bırak:
  - hedef rotation hesabı
  - ok impact açısı
  - çarpışma toleransı
  - level tamamlanma
  - kalp / fail akışı
- Gereksiz abstraction ekleme; önce oynanabilir çekirdek.

## Mimari Kuralı

- Oyun state'i `GameScreen.tsx` içinde yönetilebilir.
- Matematik ve kararlar `src/utils/gameLogic.ts` içinde saf fonksiyon olmalı.
- Level verisi `src/data/levels.ts`.
- Görsel hedef/ok component'leri `src/components/`.
- Yeni kod eski prototip componentlerine bağımlı olmamalı.

## Çalışma Prensipleri

1. Her değişiklikten sonra oyun çalışır kalmalı.
2. `ROADMAP.md` sırasını takip et.
3. Kütüphane eklemeden önce `npx expo install` kullan.
4. Babel değişince cache temizle: `npx expo start -c`.
5. Kod değişikliği sonrası `npx tsc --noEmit` çalıştır.

## Yapma Listesi

- Backend/leaderboard'u yayın hazırlığına kadar ekleme.
- Reklam entegrasyonunu oyun hissi netleşmeden ekleme.
- Referans oyunların adını, ikonunu veya görsel kompozisyonunu kopyalama.
- Eski prototip modeline yeni özellik ekleme.
- Agresif reklam frekansını ürün kararına dönüştürme.

## Önemli Komutlar

```bash
npx expo start -c
npx expo install <paket>
npx tsc --noEmit
```

## Referans Dosyalar

- `PRD.md` — ürün vizyonu
- `ARCHITECTURE.md` — dosya yapısı ve veri akışı
- `ROADMAP.md` — aşamalı görev listesi
- `PROGRESS.md` — güncel durum defteri
- `LEVELS.md` — level tasarımı
- `VISUALS.md` — görsel sistem
- `SETUP.md` — kurulum notları
