# Arrow Orbit

Tek dokunuşla oynanan, dönen hedefe ok saplama üzerine kurulu Expo + React Native arcade oyunu.

Oyuncu ekrana dokunur, alttaki ok hedefe fırlar. Ok hedefe saplanır ve hedefle birlikte döner. Yeni ok mevcut oklara çarparsa kalp koruması varsa kalp gider ve oyun kaldığı yerden devam eder; kalp yoksa oyun biter. Gereken ok sayısı tamamlanınca level geçilir.

## Proje Kökü

Bu uygulamanın gerçek proje kökü bu klasördür:

```bash
arrow-orbit/
```

Codex, Claude Code, VS Code ve terminal oturumlarını mümkünse bu klasörden başlat.

## Komutlar

```bash
npx expo start -c
npx tsc --noEmit
```

## Klasör Yapısı

```text
assets/
  sounds/       # Ses efektleri
src/
  components/   # Target, Pin, HUD, arka plan ve UI component'leri
  data/         # Level ve metin verileri
  screens/      # Home, Level, Game, GameOver ekranları
  theme/        # Renkler ve görsel zone sistemi
  utils/        # Saf oyun mantığı, storage ve yardımcılar
```

## Proje Hafızası

- `AGENTS.md` — agent rolleri ve dosya sahipliği
- `CLAUDE.md` — proje talimatları
- `PROGRESS.md` — güncel durum defteri
- `PRD.md` — ürün kapsamı
- `ARCHITECTURE.md` — hedef mimari
- `ROADMAP.md` — geliştirme planı
- `SETUP.md` — kurulum notları
- `LEVELS.md` — level tasarımı
- `VISUALS.md` — görsel sistem
