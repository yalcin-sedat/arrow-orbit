# ROADMAP.md — Arrow Orbit Geliştirme Planı

> Her görev sonrası `npx tsc --noEmit` ile tip kontrolü yap. Oyun davranışı değiştiğinde cihazda veya simülatörde oynanabilirliği kontrol et.

## Aşama 1 — Çekirdek Oyun

- [x] Tek dokunuşla ok fırlatma.
- [x] Dönen hedef ve hedefle dönen saplanmış oklar.
- [x] Açı bazlı çarpışma kontrolü.
- [x] Gerekli ok sayısı tamamlanınca level geçişi.
- [x] Hedef rotation zıplaması düzeltildi.
- [x] `Tap to throw!` yalnızca ilk atıştan önce görünür.

## Aşama 2 — Can / Kalp Kuralı

- [x] Oyuncu tek dolu kalple başlar.
- [x] Kalp doluyken hata yapılırsa kalp boşalır, level kaldığı yerden devam eder.
- [x] Kalp boşken hata yapılırsa game over.
- [x] Kalp objesi hedef üzerinde döner ve vurulunca boş kalbi doldurur.
- [x] Hata sonrası saplanmış oklar geri alınmaz.
- [x] Kalp SVG olarak çizilir.

## Aşama 3 — Level Paketi

- [x] 50 level tanımlandı.
- [x] 1-45 arası zor ama adil ana oyun.
- [x] 46-50 arası prestige/challenge.
- [x] 1-20 arası her levelde en az 10 ok.
- [x] `constant`, `accelerating`, `stopAndGo`, `switchDirection`, `fakeReverse`, `glitch` patternleri.
- [ ] Cihaz testine göre 1-20 ok sayısı, hız ve tolerans tekrar ayarlanacak.
- [ ] 30+ level hissi: zor ama haksız olmayan boşluklar kontrol edilecek.
- [ ] 46-50 prestige seviyeleri ayrı test edilecek.

## Aşama 4 — Görsel Sistem

- [x] Zone renk paleti.
- [x] Level aralığına göre hedef formu.
- [x] Zone bazlı ok stilleri.
- [x] Yıldızlı arka plan.
- [x] Sağ üstte sade hilal ay.
- [x] Eski çerçeve/vinyet panel hissi kaldırıldı.
- [ ] Target ve ok görselleri küçük ekranlarda yeniden kontrol edilecek.
- [ ] Level complete ve game over geçişleri görsel olarak cilalanacak.

## Aşama 5 — Menü ve Akış

- [x] Ana menüden level ekranına geçiş.
- [x] Scroll edilebilir level seçimi.
- [x] Level kilidi ve test için tüm kilitleri açma modu.
- [x] Game over sonrası level ekranına dönüş.
- [x] HomeScreen metinleri ve marka adı Arrow Orbit'e göre güncellendi.
- [ ] Ayarlar ekranı netleştirilecek.
- [ ] Test modu yayına çıkmadan kapatılacak.

## Aşama 6 — Ses, Haptic ve Cila

- [x] Tap, doğru, yanlış, level complete, game over çağrıları.
- [x] Haptic geri bildirimler.
- [ ] Gerçek kısa arcade sesleri placeholder yerine eklenecek.
- [ ] Ses/haptic aç-kapa ayarı eklenecek.
- [ ] Fail sonrası tekrar deneme temposu cihazda test edilecek.

## Aşama 7 — Veri ve Yayın Hazırlığı

- [x] En yüksek açılan level local storage.
- [x] High score local storage.
- [ ] İleride gerekiyorsa leaderboard.
- [ ] App icon: dönen hedef + ok.
- [ ] Splash görseli.
- [ ] Store ekran görüntüleri.
- [ ] Gizlilik politikası.
- [ ] EAS test build.

## Notlar

- Ana risk mekanik değil, his: çarpışma toleransı, animasyon temposu ve restart sürtünmesi.
- Referans oyunlardan ürün dersi alınır; isim, ikon, store görseli ve hedef/ok tasarımı kopyalanmaz.
- Dokümanlarda ve yeni özelliklerde eski tema terimleri kullanılmamalıdır.
