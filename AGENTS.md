# AGENTS.md — Çalışma Düzeni

Bu dosya, Arrow Orbit üzerinde çalışan Codex / Claude oturumları için kısa dosya sahipliği ve koordinasyon kurallarını içerir.

## Temel Kurallar

1. Oturum başında `PROGRESS.md`, `CLAUDE.md`, `PRD.md`, `ARCHITECTURE.md` ve ilgili görev dosyasını oku.
2. Değişiklikleri küçük ve test edilebilir tut.
3. Kod değişikliği sonrası `npx tsc --noEmit` çalıştır.
4. Davranış değişikliği yaptıysan `PROGRESS.md` içine kısa güncel not ekle.
5. Aynı dosyada paralel çalışma yapma.

## Dosya Sahipliği

| Alan | Ana Dosyalar |
|---|---|
| Oyun mantığı | `src/utils/gameLogic.ts`, `src/screens/GameScreen.tsx`, `src/data/levels.ts` |
| Görsel sistem | `src/components/Target.tsx`, `src/components/Pin.tsx`, `src/components/HUD.tsx`, `src/components/SpaceBackground.tsx`, `src/theme/colors.ts` |
| Ekran akışı | `App.tsx`, `src/screens/HomeScreen.tsx`, `src/screens/LevelScreen.tsx`, `src/screens/GameOverScreen.tsx` |
| Metinler | `src/data/strings.ts` |
| Kalıcılık | `src/utils/storage.ts` |
| Ses | `src/utils/sounds.ts`, `assets/sounds/` |
| Dokümanlar | `*.md` |

## Görev Grupları

### Oyun Mantığı

- Hedef rotasyonu, impact açısı ve çarpışma toleransı.
- Kalp koruma kuralı.
- Level geçişi ve game over akışı.
- Level zorluk eğrisi.

### Tasarım / UI

- Hedef formu, ok stili, kalp ikonu, arka plan.
- Home, Level ve GameOver ekranlarının okunabilirliği.
- Kısa feedback animasyonları.

### Veri / Yayın

- Local progress ve high score.
- İleride leaderboard, reklam, icon, splash ve EAS build.

## Başlangıç Komutu Örneği

```text
Önce PROGRESS.md, CLAUDE.md, PRD.md ve ARCHITECTURE.md oku.
Görevin: <kısa görev>. Değişiklikten sonra npx tsc --noEmit çalıştır.
Eski prototip terimleri veya gereksiz asset bağımlılığı ekleme.
```

## Not

Tek gerçek kaynak kod + güncel dokümanlardır. Eski prototip kayıtları karar kaynağı olarak kullanılmaz.
