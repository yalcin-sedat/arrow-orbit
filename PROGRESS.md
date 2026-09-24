# PROGRESS.md — Güncel Durum Defteri

> Bu dosya güncel proje durumunu kısa tutmak için var. Eski prototip kayıtları karar kaynağı değildir.

## Mevcut Ürün

**Arrow Orbit** — tek dokunuşlu, dönen hedefe ok saplama arcade oyunu.

## Güncel Oynanış

- Oyuncu ekrana dokunur, alttaki ok hedefe fırlar.
- Ok hedefe saplanır ve hedefle birlikte döner.
- Yeni ok mevcut oklara çarparsa hata olur.
- Kalp doluysa hata kalbi boşaltır ve level kaldığı yerden devam eder.
- Kalp boşken hata yapılırsa game over.
- Hedef üzerindeki SVG kalp vurulursa boş kalp tekrar dolar.
- Gerekli ok sayısı tamamlanınca level geçilir.
- `Tap to throw!` yalnızca levelin ilk atışından önce görünür.

## Güncel Level Durumu

- Toplam 50 level.
- 1-45: zor ama adil ana oyun.
- 46-50: prestige/challenge.
- 1-20 arasında her levelde en az 10 ok.
- Desteklenen dönüş patternleri:
  - `constant`
  - `accelerating`
  - `stopAndGo`
  - `switchDirection`
  - `fakeReverse`
  - `glitch`

## Güncel Görsel Durum

- Target formları level aralığına göre değişiyor.
- Ok stilleri zone'a göre değişiyor.
- Arka plan koyu uzay zemini, yıldızlar ve sağ üstte hilal ay kullanıyor.
- Özel obje olarak yalnızca SVG kalp var.
- Büyük çerçeve/vinyet kaldırıldı; oyun alanı tek parça görünür.

## Güncel Ekran Akışı

- `HomeScreen` → gerekirse `ProfileSetupScreen` → `LevelScreen` → `GameScreen` → `GameOverScreen`.
- Level ekranı scroll edilebilir.
- Test için tüm level kilitleri geçici olarak açılabilir.
- Level geçtikçe sonraki level açılır.
- İlk oyun akışında basit oyuncu profili sorulur: avatar + kullanıcı adı.
- Ayarlar ekranından oyuncu profili düzenlenebilir.

## Ana Dosyalar

| Alan | Dosyalar |
|---|---|
| Oyun mantığı | `src/utils/gameLogic.ts`, `src/screens/GameScreen.tsx` |
| Level verisi | `src/data/levels.ts`, `LEVELS.md` |
| Görsel sistem | `src/components/Target.tsx`, `src/components/Pin.tsx`, `src/components/SpaceBackground.tsx`, `VISUALS.md` |
| HUD | `src/components/HUD.tsx` |
| Ekranlar | `src/screens/HomeScreen.tsx`, `src/screens/LevelScreen.tsx`, `src/screens/GameOverScreen.tsx` |
| Profil | `src/screens/ProfileSetupScreen.tsx`, `src/utils/storage.ts` |
| Storage | `src/utils/storage.ts` |
| Metinler | `src/data/strings.ts` |
| Avatar verisi | `src/data/playerAvatars.ts` |

## Son Yapılan Temizlik

[2026-06-24] [Codex] — Profil düzenleme ekranı görsel olarak iyileştirildi.
- `ProfileSetupScreen.tsx` daha kompakt üst bar, küçük seçili avatar pill'i ve yuvarlak seçim rozetleriyle güncellendi.
- Avatarlar harfli pusula görünümünden nova, bolt, pulse, flare, comet ve void sembollerine çevrildi.
- Profil App state'inden Settings ve Scoreboard ekranlarına prop olarak aktarılıyor; edit sonrası isim/avatar aynı akışta güncelleniyor.
- Avatar SVG rozeti `PlayerAvatarBadge` ortak component'ine taşındı; Settings ve Scoreboard harf yerine gerçek avatarı gösteriyor.
- Scoreboard sadeleştirildi; local/global/weekly filtreleri kaldırıldı ve tek global ranking görünümüne çevrildi.
- Firebase SDK eklendi; Anonymous Auth + Firestore için `src/services/firebase.ts` ve `src/services/playerCloud.ts` oluşturuldu.
- Profil kaydı, level progress ve yeni high score cloud sync'e bağlandı; config yoksa local akış bozulmadan devam eder.
- Global leaderboard top 20 okuyacak şekilde sınırlandı; aynı oturum için 60 saniyelik memory cache eklendi.
- Skor kaydı yalnızca game over anına bağlı olmaktan çıkarıldı; skor arttıkça local high score kontrol edilir ve yeni rekorsa Firebase'e senkronlanır.
- Test amaçlı tüm level kilidi açma modu kapatıldı; yeni oyuncu 1. levelden başlar ve level geçtikçe ilerleme açılır.
- Level progress storage key'i `highest_unlocked_level_v2` olarak versiyonlandı; eski test kayıtları yeni akışta level kilitlerini açık bırakmaz.
- Home ve Scoreboard üst/metrik değerleri App state'indeki gerçek local `highScore` ve `highestUnlockedLevel` değerlerinden beslenir.
- Scoreboard podyumu isim → puan → sıra formatına çevrildi; `#` işareti kaldırıldı ve Best Level kartı yerine global top 10 oyuncu listesi eklendi.
- Level ekranı görsel olarak orbit rota hissine yaklaştırıldı; level node'ları arasında zincir halkaları, kilitli node'larda kapalı kilit ve daha küçük completed rozeti eklendi.
- Level grid'i 4 kolonlu snake path dizilimine çevrildi: 1-4, 8-5, 9-12 şeklinde akar; completed tik rozetleri kaldırıldı.
- Level satırları arasına geniş rota boşluğu eklendi; tamamlanan her 10'luk level grubu farklı neon accent rengiyle gösterilir.
- Yeni oyun oturumu artık sıfır puandan değil, App state'indeki son kayıtlı `highScore` değerinden başlar.
- Level içinde kazanılan puanlar geçici hale getirildi; oyuncu leveli geçemezse skor level başlangıcındaki değere geri alınır, high score yalnızca level tamamlanınca güncellenir.
- Can/kalp varken hatalı ok çarparsa saplanmış oklar ve level ilerlemesi geri alınmaz; yalnızca can azalır ve hatalı ok düşer.
- Eski level tekrarları practice run sayılır; oyuncu oynayabilir ama skor, high score, Firebase ve level unlock yalnızca mevcut progression level koşusunda güncellenir.
- Market ekranı ürün akışından kaldırıldı; Home'daki market butonu `NO ADS` butonuna çevrildi ve tek IAP hedefi için `RemoveAdsScreen` eklendi.
- Doğrulama: `npx tsc --noEmit` 0 hata.

[2026-06-18] [Codex] — Markdown dosyaları eski prototip ve tema kalıntılarından temizlendi.
- Ürün adı dokümanlarda **Arrow Orbit** olarak güncellendi.
- Eski prototip terimleri ve asset notları kaldırıldı.
- `PROGRESS.md` sade güncel durum defterine çevrildi.
- Mimari, roadmap, görsel sistem ve kurulum dokümanları güncel oyunla hizalandı.

## Açık İşler

- HomeScreen içindeki görünen marka/metinler Arrow Orbit'e göre güncellenecek.
- Profil kartı ileride Home/Scoreboard içinde de gösterilecek.
- Test modu yayına çıkmadan kapatılacak.
- İlk 20 level cihazda tekrar test edilip ok sayısı/hız/tolerans dengesi ayarlanacak.
- Gerçek kısa arcade sesleri placeholder yerine eklenecek.
- App icon, splash ve store görselleri hazırlanacak.

## Doğrulama Komutu

```bash
npx tsc --noEmit
```
