# AUDIT.md — Eksikler ve Düzeltme Takibi

> Döngü: incele → raporla → karar ver → düzelt → `npx tsc --noEmit` → cihazda test → commit.
> Durum: ⬜ açık · 🔄 devam ediyor · ✅ bitti · ⏸ ertelendi

## Adım 0 — Güvenli başlangıç

| # | Bulgu | Karar | Durum |
|---|---|---|---|
| 0.1 | `.git/index.lock` (0 bayt) inceleme sırasında `git status` tarafından bırakıldı; aktif Git işlemi yok. | Sedat Mac'te siler. | ⬜ |
| 0.2 | Haziran'daki son commit'ten beri işin çoğu commit edilmemiş. | Baseline commit. | ⬜ |
| 0.3 | 169 MB commit edilmemiş dosya; ~128 MB'ı oyunda kullanılmayan tasarım önizlemeleri. | `.gitignore`'a eklendi (diskte duruyor). Commit ~41 MB. | ✅ |
| 0.4 | `origin` remote'u eski projeyi gösteriyor: `football-flag-game.git`. | Yeni repo mu, yeniden adlandırma mı? Karar bekliyor. | ⬜ |

## Sonraki adımlar (henüz detaylı incelenmedi)

- **Adım 1 — Oyun çekirdeği:** Çarpışma açısı 16 ms'lik polling ile JS thread'de okunuyor; görünen ve hesaplanan açı farklı olabiliyor.
- **Adım 2 — Level dengesi:** L45, L48, L49, L50 matematiksel olarak geçilemiyor; L46-47 pencere ~25 ms.
- **Adım 3 — Akış/UX:** Oyun sonunda sahte reklam sayacı, 5 level geri alma cezası, arka planda duraklatma yok.
- **Adım 4 — Ses/ayarlar:** `startMusic()` hiç çağrılmıyor; müzik ayarı etkisiz.
- **Adım 5 — Firebase:** `firebase.ts` env değişkenlerini dolaylı okuyor → Expo inline etmiyor → Firebase kapalı (doğrulandı). Firestore kuralları hileye açık.
- **Adım 6 — Yayın:** Test AdMob ID'leri, UMP/ATT yok, IAP yok, gereksiz `RECORD_AUDIO` izni, `userInterfaceStyle: light`, splash ayarsız.
- **Adım 7 — Temizlik/doküman:** Eski projeden kalan ölü kod (`Ball.tsx`, `Wheel.tsx`, `countries.ts`, `assets/flags`, `assets/maps`, `assets/backgrounds`); iki lock dosyası (npm + pnpm); test yok; dokümanlar koddan geride.

## Düzeltilen eski bulgular

- İlk raporda "Android adaptive icon ve favicon dosyaları eksik" denmişti — **yanlıştı**, dosyalar `assets/` içinde mevcut.
