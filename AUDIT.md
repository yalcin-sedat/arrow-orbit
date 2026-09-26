# AUDIT.md — Eksikler ve Düzeltme Takibi

> Döngü: incele → raporla → karar ver → düzelt → `npx tsc --noEmit` → cihazda test → commit.
> Durum: ⬜ açık · 🔄 devam ediyor · ✅ bitti · ⏸ ertelendi
> Önem: 🔴 Kritik · 🟠 Yüksek · 🟡 Orta · ⚪ Düşük
> Son inceleme: 2026-09-24 — core, ui-ses, yayin agent'ları (İNCELE modu). Baseline commit: `a352223`.
> Son güncelleme: 2026-09-26 — 1.1, 1.4, 2.8, 5.1, 6.3 düzeltildi, denetci ONAY verdi; cihaz testi ve commit bekliyor.

## Adım 0 — Güvenli başlangıç

| # | Bulgu | Karar | Durum |
|---|---|---|---|
| 0.1 | `.git/index.lock` (0 bayt) inceleme sırasında `git status` tarafından bırakıldı; aktif Git işlemi yok. | Silindi. | ✅ |
| 0.2 | Haziran'daki son commit'ten beri işin çoğu commit edilmemiş. | Baseline commit `a352223` (`.claude/agents/` dahil, push yok). | ✅ |
| 0.3 | 169 MB commit edilmemiş dosya; ~128 MB'ı oyunda kullanılmayan tasarım önizlemeleri. | `.gitignore`'a eklendi (diskte duruyor). Commit ~41 MB. | ✅ |
| 0.4 | `origin` remote'u eski projeyi gösteriyor: `football-flag-game.git` (yayin agent'ı 2026-09-24'te tekrar doğruladı). | 2026-09-26: `origin` → `https://github.com/yalcin-sedat/arrow-orbit.git` yapıldı (surum). Uzak `main` = `0127420`, yerel `main` 1 commit ileride. | ✅ |

## Adım 1 — Oyun çekirdeği (core)

| # | Önem | Bulgu | Dosya | Öneri | Durum |
|---|---|---|---|---|---|
| 1.1 | 🔴 | Çarpışma açısı, 16 ms `setInterval` ile JS'e kopyalanan bayat `rotationRef`'ten hesaplanıyor. Animasyonun bittiği andaki gerçek `targetRotation.value` kullanılmıyor. Açı hatası L1'de ~1.1°, L46-50'de 3.8–5.0°. Bu, 15-16°'lik toleransın %25-30'u ve "haksız ölüm" hissinin doğrudan nedeni. | `GameScreen.tsx:290-295, 561-565` | `withTiming` bitiş worklet'inde `targetRotation.value` okunmalı, `runOnJS(resolveThrow)(throwId, rotation)` ile JS'e geçirilmeli. `gameLogic.ts` matematiği değişmiyor. **2026-09-26:** core düzeltti: `resolveThrow(throwId, exactRotation)`, bitiş worklet'inde `runOnJS(resolveThrow)(throwId, targetRotation.value)` (`GameScreen.tsx:567-572, 700-708`). Tüm `speedPattern`'ler aynı `targetRotation`'ı kullanıyor. Denetci ONAY verdi, `tsc` temiz. 2026-09-27: Sedat cihazda test etti, geçti. | ✅ |
| 1.4 | 🟡 | Yıldız/kalp isabeti (`findHitSpecial`, `getSpecialScreenPosition`) aynı bayat açıyı kullanıyor. | `GameScreen.tsx` | 1.1 ile birlikte çözüldü: `findHitSpecial` artık kesin açıyı alıyor. `getSpecialScreenPosition` bilerek `rotationRef`'te kaldı; sadece kalp pickup animasyonunun başlangıç konumunu belirliyor. 2026-09-27: cihaz testi geçti. | ✅ |
| 1.5 | 🟡 | Level geçişinde girdi 2250 ms kilitli; 50 level boyunca toplam ~112 sn zorunlu bekleme. | `LevelTransitionOverlay.tsx`, `GameScreen.tsx` | Süre kısaltılsın mı? Ürün kararı. | ⬜ |
| 1.2 | — | `getImpactAngle` / `willCollideWithPins` formülü doğru ve `Target.tsx` rotasyonuyla örtüşüyor. | `gameLogic.ts` | Sorun yok. | ✅ |
| 1.3 | — | Kalp, skor ve level tamamlanma akışında mantık hatası bulunmadı. | `gameLogic.ts`, `GameScreen.tsx` | Sorun yok. | ✅ |

## Adım 2 — Level dengesi (core)

Yöntem: çarpışma koşulu `angleDistance <= tol` (`gameLogic.ts:32`), yani tam `tol` uzaklık da çarpışma sayılıyor. Yeni ok her iki komşusundan kesinlikle `tol`'dan uzak olmalı. `g` boşluğuna sığan ok sayısı `ceil(g/tol) − 2`; toplamı `requiredPins` ile karşılaştırıldı. 50 levelin hepsi bu formülle yeniden hesaplandı.

| # | Önem | Level | Gerekli / kapasite | Bulgu | Öneri | Durum |
|---|---|---|---|---|---|---|
| 2.1 | 🔴 | L49 | 11 / 8 | Matematiksel olarak geçilemez (8×45°, tol 16° → boşluk başına 1 ok). | `requiredPins`, `tol` veya `initialPins` düşürülmeli. → 2.8 | ✅ |
| 2.2 | 🔴 | L50 | 12 / 10 | Matematiksel olarak geçilemez (10×36°, tol 16° → boşluk başına 1 ok). | Aynı. → 2.8 | ✅ |
| 2.3 | 🔴 | L45 | 12 / 10 | Matematiksel olarak geçilemez (6×40° → 1'er ok, 2×60° → 2'şer ok, tol 15°). | Aynı. → 2.8 | ✅ |
| 2.6 | 🔴 | L48 | 11 / 8 | Matematiksel olarak geçilemez (8×45°, tol 15°). 45° = 3×15° olduğundan iki ok ancak tam 15° aralıkla sığar, bu da `<=` koşulunda çarpışma sayılır; boşluk başına 1 ok kalır. | Aynı. → 2.8 | ✅ |
| 2.4 | 🟠 | L46 | 10 / 10 | Sıfır marj, güvenli pencere ~25 ms. | 1-2 ok marj eklenmeli. → 2.8 | ✅ |
| 2.5 | 🟠 | L47 | 10 / 10 | Sıfır marj, güvenli pencere ~23 ms. | 1-2 ok marj eklenmeli. → 2.8 | ✅ |
| 2.8 | — | L45-50 | 8/10, 8/10, 8/10, 6/8, 6/8, 8/10 | **Karar (Sedat, 2026-09-26):** Sadece `requiredPins` düşürüldü: L45→8, L46→8, L47→8, L48→6, L49→6, L50→8. `initialPins` ve tolerans değişmedi. Her levelde marj 2 ok. core düzeltti, denetci hesabı doğruladı ve ONAY verdi. | 2026-09-27: Sedat cihazda test etti; değerler şimdilik böyle kalacak. | ✅ |
| 2.7 | ⚪ | L1-44 | — | Doğru formülle yeniden hesaplandı: hepsinde en az 2 ok marj var. En dar zamanlama L39'da (~21 ms) ama geçilebilir. | Aksiyon yok. | ✅ |

## Adım 3 — Akış / UX (ui-ses)

| # | Önem | Bulgu | Dosya | Öneri | Durum |
|---|---|---|---|---|---|
| 3.1 | 🔴 | Game over'daki "reklam izle" sahte: 3 sn'lik `setInterval` sayacı çalışıyor, ads SDK çağrısı yok. | `GameOverScreen.tsx:61-75, 129-134` | **Karar (Sedat, 2026-09-26):** Akış kalacak; gerçek rewarded ad'e bağlanacak (6.1 + 6.2 ile birlikte). | ⏸ |
| 3.2 | 🔴 | Streak geri alma cezası: 12 sn'lik sayaç dolunca ya da SKIP'e basınca `highestUnlockedLevel`'den `min(streak, 5)` level düşülüyor. Oyuncu hiçbir şey yapmasa da ceza otomatik uygulanıyor; oyuncuyu reklam izlemeye zorlayan bir dark pattern. (Önceki "sabit 5 level" ifadesi kısmen yanlıştı.) | `App.tsx:191-204`, `GameOverScreen.tsx:37-82` | **Karar (Sedat, 2026-09-26):** Olduğu gibi kalacak; ürün mekaniği olarak korunuyor. | ⏸ |
| 3.3 | 🟠 | Projede `AppState` kullanımı yok; uygulama arka plana geçince oyun ve ses duraklamıyor. | `App.tsx`, `GameScreen.tsx`, `sounds.ts` | Core `GameScreen`'i, ui-ses de sesi duraklatsın. | ⬜ |
| 3.5 | — | Test için eklendi: `DEV_UNLOCK_ALL_LEVELS = __DEV__`. Dev build'de 50 levelin hepsi seçilebilir; storage'daki ilerleme değişmez, release'te bayrak kapalı. Training modunda level bitince sonraki levele geçilmiyor (`GameScreen.tsx:399`). | `App.tsx:45-48, 259-263` | **Karar (Sedat, 2026-09-27):** Kalsın, commit'e girsin. | ✅ |
| 3.4 | 🟡 | Remove Ads ve Settings ekranlarında sahte `Alert` mesajları var ("will be connected before release"). | `RemoveAdsScreen.tsx:18-24`, `SettingsScreen.tsx:65-71` | Remove Ads ekranına giriş ve sahte "Restore" linki kaldırıldı (6.3). Settings'teki diğer Türkçe placeholder Alert'ler 4.4 kapsamında. | 🔄 |

## Adım 4 — Ses / ayarlar / kayıt (ui-ses)

| # | Önem | Bulgu | Dosya | Öneri | Durum |
|---|---|---|---|---|---|
| 4.1 | 🔴 | `startMusic()` hiçbir yerde çağrılmıyor, müzik hiç çalmıyor. | `sounds.ts:97-108` | Uygun ekranda çağrılmalı. | ⬜ |
| 4.2 | 🟠 | `musicEnabled` ve `reducedMotionEnabled` ayarlarını hiçbir kod okumuyor, Settings'te toggle'ları da yok. `screenFlash` okunuyor ama kullanıcı değiştiremiyor. | `storage.ts:16-30`, `SettingsScreen.tsx:81-96` | Music ve Screen Flash toggle'ı eklenmeli; Reduced Motion ya çalışır hale getirilmeli ya da kaldırılmalı. | ⬜ |
| 4.3 | 🟠 | Ses ayarının iki kaynağı var: Home'daki toggle kaydetmiyor. Settings'e girip çıkınca ya da uygulama yeniden açılınca ses tekrar açılıyor. | `HomeScreen.tsx:56-97, 155-167`, `SettingsScreen.tsx:34-46` | Tek kaynak storage olmalı. | ⬜ |
| 4.4 | 🟡 | Dil karışık: bazı `Alert`'ler ve paylaşım metni Türkçe hardcoded, geri kalan UI İngilizce. | `SettingsScreen.tsx:65-71`, `HomeScreen.tsx:174-187` | İngilizce'ye çevrilip `strings.ts`'e taşınmalı. | ⬜ |
| 4.5 | ⚪ | `strings.ts` dışında hardcoded metin: RemoveAds (tamamı), Scoreboard, ProfileSetup. | ilgili ekranlar | `strings.ts`'e taşınmalı. | ⬜ |
| 4.6 | ⚪ | Storage anahtarlarının versiyonlaması tutarsız, migration mekanizması yok (bozuk veri güvenle varsayılana düşüyor). | `storage.ts:4-7, 82-95` | İleride şema değişirse ele alınsın. | ⏸ |
| 4.7 | — | Ses sızıntısı yok; player cache'i kasıtlı ve üst sınırı ~16 player. | `sounds.ts` | Sorun yok. | ✅ |

## Adım 5 — Firebase (yayin)

| # | Önem | Bulgu | Dosya | Öneri | Durum |
|---|---|---|---|---|---|
| 5.1 | 🔴 | `readEnv()` değişkenleri dolaylı okuyor (`const env = process.env`), bu yüzden Expo inline etmiyor ve Firebase her zaman kapalı. Doğrulandı. | `services/firebase.ts:23-46` | Her değişken `process.env.EXPO_PUBLIC_X` şeklinde doğrudan okunmalı. **2026-09-26:** yayin düzeltti; `tsc` temiz, `expo export` ile inline edildiği doğrulandı. Denetci ONAY verdi. Cihaz testi bekliyor (`.env.local` doluyken bağlantı, boşken çökmeme). | 🔄 |
| 5.2 | 🔴 | `firestore.rules` repoda yok. İstemci `players/{uid}`'ye `highScore` ve `highestUnlockedLevel` yazıyor, hiçbir doğrulama yok; hile yapmak kolay. | `services/playerCloud.ts:49-71` | Kurallar yazılmalı: uid eşleşmesi, tip ve üst sınır kontrolü, artış limiti, username uzunluk kontrolü. | ⬜ |
| 5.3 | 🟠 | `.env.local`'daki 6 anahtarın hepsi boş; Firebase projesi henüz bağlanmamış. **2026-09-26 notu:** `expo export` sırasında `.env.local`'dan 5 değişken yüklendi; `PROJECT_ID` dosyada yok. Önceki "hepsi boş" tespiti güncel değil ya da eksik. | `.env.local` | Sedat 6 anahtarın da dolu olduğunu kontrol etmeli. | ⬜ |

## Adım 6 — Yayın (yayin)

| # | Önem | Bulgu | Dosya | Öneri | Durum |
|---|---|---|---|---|---|
| 6.2 | 🔴 | UMP (GDPR onayı) ve ATT yok; `NSUserTrackingUsageDescription` da yok. AB'de reklam göstermeden önce UMP zorunlu. | `app.json`, `services/` | Reklamlardan önce `consent.ts` + ATT eklenmeli. | ⬜ |
| 6.1 | 🟠 | AdMob SDK kurulu ama kodda hiçbir reklam bileşeni yok; `app.json`'daki ID'ler Google'ın test ID'leri. | `app.json:29-38` | `services/ads.ts` yazılmalı; gerçek ID'ler Sedat'tan. | ⬜ |
| 6.3 | 🟠 | IAP tamamen sahte: IAP paketi yok, "Buy" butonu sadece Alert gösteriyor. Mağaza reddi riski var. | `RemoveAdsScreen.tsx:18-24` | **Karar (Sedat, 2026-09-26):** İlk sürümden kaldırılacak. ui-ses düzeltti: App, Home ve Settings'teki girişler kaldırıldı; `RemoveAdsScreen.tsx` ve string'ler IAP için duruyor. `tsc` temiz. Denetci ONAY verdi. Kullanılmayan `strings.removeAds` ve `strings.restore` 4.5'te temizlenebilir. Cihaz testi bekliyor. | 🔄 |
| 6.8 | 🟠 | Gizlilik politikası URL'si, veri toplama beyanı ve hesap/veri silme yolu yok. | `SettingsScreen.tsx` | Politika hazırlanmalı; App Privacy ve Data Safety formları doldurulmalı. | ⬜ |
| 6.4 | 🟡 | Gereksiz izinler: `RECORD_AUDIO` (`app.json`); yerel prebuild'de ayrıca `SYSTEM_ALERT_WINDOW`, storage izinleri ve `NSMicrophoneUsageDescription`. Kodda kayıt yok. | `app.json:19-24` | Kaldırılmalı, `expo-audio` mikrofon izni kapatılmalı, ardından `npx expo prebuild --clean`. | ⬜ |
| 6.5 | 🟡 | `userInterfaceStyle: "light"` sabit; `splash` / `expo-splash-screen` ayarı yok. | `app.json:8` | Splash eklenmeli. | ⬜ |
| 6.6 | 🟡 | `eas.json` yok, EAS build yapılandırılmamış. | kök | Sedat: `eas login` + `eas build:configure`. | ⬜ |
| 6.7 | ⚪ | Bundle id `com.sedatyalcin.arroworbit` kişisel isim içeriyor; reddedilme sebebi değil. | `app.json` | Sedat karar versin. | ⬜ |

## Sedat'ın yapması gerekenler (hesap / konsol)

1. Firebase projesi: Firestore + Anonymous Auth açılsın, 6 değer `.env.local`'a girilsin (5.3).
2. AdMob uygulamaları (iOS + Android) oluşturulsun, gerçek App ID ve Ad Unit ID'leri alınsın (6.1).
3. Remove Ads IAP ürünü tanımlansın ya da ilk sürümden çıkarılsın (6.3).
4. `eas login` + `eas build:configure` (6.6).
5. Gizlilik politikası barındırılsın; App Privacy / Data Safety formları doldurulsun (6.8).

## Sonraki adımlar

- **Adım 7 — Temizlik/doküman:** Eski projeden kalan ölü kod (`Ball.tsx`, `Wheel.tsx`, `countries.ts`, `assets/flags`, `assets/maps`, `assets/backgrounds`); iki lock dosyası (npm + pnpm); test yok; dokümanlar koddan geride.

## Düzeltilen eski bulgular

- İlk raporda "Android adaptive icon ve favicon dosyaları eksik" denmişti — **yanlıştı**, dosyalar `assets/` içinde mevcut.
- "L45, L48, L49, L50 matematiksel olarak geçilemiyor" — **doğru**. Core agent'ının 2026-09-24 raporu bunu kısmen yalanlamıştı ("L45 sıfır marjlı, L48'de 16 kapasite var"), ama o rapor yanlıştı:
  - `floor(gap/tol) − 1` formülü, boşluk toleransın tam katı olduğunda fazla sayıyor, çünkü tam `tol` uzaklık da çarpışma sayılıyor. Doğrusu `ceil(gap/tol) − 2`.
  - L45'in boşlukları da yanlış okunmuştu: 4×40° + 4×60° değil, 6×40° + 2×60°.
  - Doğru değerler: L45 12/10, L48 11/8 (2.3, 2.6).
- "5 level geri alma cezası" — sabit değil, `min(streak, 5)` (3.2).
- yayin agent'ı raporunda `ios/` ve `android/` klasörlerinin commit'li olduğunu söyledi — **yanlış**: bunlar yerel prebuild çıktısı, `.gitignore`'da ve git'te takip edilmiyor. 6.4'teki izinler `app.json` + prebuild ile düzelir.
