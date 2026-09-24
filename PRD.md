# PRD.md — Arrow Orbit Ürün Gereksinimleri

## 1. Vizyon

**Arrow Orbit**, tek dokunuşla oynanan bir mobil arcade zamanlama oyunudur. Oyuncu, dönen bir hedefe ok saplar; amaç, mevcut oklara çarpmadan levelin istediği sayıda isabet yapmaktır.

Hedef his: **"Bir kez daha"**, **"Bu sefer geçeceğim"**, **"Çok yakındı"**. Oyun hızlı okunur, kısa seanslı, adil ama gittikçe zorlaşan bir refleks ve ritim deneyimi sunar.

## 1.1 Ürün Yönü

- Referans alınan ana ürün dersi: tek input, kısa seans, anında fail, çok hızlı tekrar deneme.
- Birebir klon yapılmaz; isim, görsel kimlik, hedef şekli, ok tasarımı ve level kurgusu özgün tutulur.
- Marka yönü: **Arrow Orbit**. Dönen hedef, keskin oklar, uzay arka planı ve neon arcade hissi birleşir.
- Öncelik akıcı arcade hissi, okunabilirlik, tekrar oynanabilirlik ve zorluk eğrisidir.

## 2. Çekirdek Oynanış

- Ekranın ortasında dönen bir hedef bulunur.
- Oyuncu ekrana dokununca alttaki ok hedefe doğru fırlar.
- Ok hedefe saplanır ve hedefle birlikte dönmeye devam eder.
- Yeni ok, daha önce saplanmış oklardan birine çarparsa hata sayılır.
- Kalp doluyken yapılan hata kalbi boşaltır; saplanan oklar geri alınmaz ve level kaldığı yerden devam eder.
- Kalp boşken yapılan hata oyunu bitirir.
- Dönen kalp objesi vurulursa boş kalp tekrar dolar.
- Level, gereken ok sayısı başarıyla saplanınca tamamlanır.

## 3. Temel Kurallar

1. Oyuncu yalnızca dokunur; yön, güç veya sürükleme yoktur.
2. Hedef sürekli döner; hız, yön ve ritim level'a göre değişir.
3. Saplanmış okların açıları tutulur.
4. Yeni atışın saplanacağı açı, mevcut ok açılarına çok yakınsa çarpışma sayılır.
5. Kalp sistemi tek korumadır: dolu kalp hatayı affeder, boş kalpte hata game over yapar.
6. Gerekli ok sayısına ulaşılırsa level geçilir.

## 4. Görsel Tasarım Yönü

- Minimal, yüksek kontrastlı, premium arcade.
- Hedef: merkezde güçlü, net okunan disk/halka/rozet/arena formu.
- Oklar: ince ama okunaklı; uç kısmı hedefe saplanmış hissi vermeli.
- Arka plan: koyu uzay zemini, yıldız yağmuru ve sağ üstte sade hilal ay.
- Vurgu renkleri: zone bazlı cyan, yeşil, turuncu, mor, gümüş, altın.
- UI kalabalık olmamalı; oyuncunun gözü hedef, oklar, kalan ok sayısı ve kalpte kalmalı.
- Oyun objeleri ve UI mümkün olduğunca kod/SVG ile çizilir.

## 5. Ekranlar

### Ana Menü

- Logo: **Arrow Orbit**.
- Ana aksiyon: Oyna.
- İkincil aksiyonlar: Ayarlar ve ileride eklenecek temalar/istatistikler.
- Menü, pazarlama sayfası değil; oyuncuyu hızlıca oyuna sokan sade bir merkez ekran olmalı.

### Level Ekranı

- 50 level kutusu.
- İlk açılışta Level 1 açık, diğerleri kilitli olabilir.
- Test modunda tüm level kilitleri açılabilir.
- Level geçtikçe sonraki level açılır.
- Liste scroll edilebilir olmalıdır.

### Oyun Ekranı

- Üst: tek kalp, level bilgisi.
- Orta: dönen hedef + saplanmış oklar + hedef merkezinde kalan ok sayısı.
- Alt: sıradaki ok ve tek dokunma alanı.
- `Tap to throw!` yalnızca levelin ilk atışından önce görünür.
- Fail ve başarı efektleri kısa, net, akışı bozmayan şekilde gösterilir.

### Game Over

- Final skor.
- "Tekrar Oyna" ve "Ana Menü".
- İleride ikinci şans reklamı eklenebilir; MVP için şart değildir.

## 6. Level Sistemi

Level zorluğu şu parametrelerle artar:

- `requiredPins`: saplanması gereken ok sayısı.
- `rotationDuration`: tam turun süresi; küçüldükçe hedef hızlanır.
- `direction`: saat yönü veya ters yön.
- `collisionToleranceDeg`: oklar arası minimum güvenli açı; büyüdükçe oyun zorlaşır.
- `initialPins`: level başında hedefte hazır bulunan engel okları.
- `speedPattern`: sabit, hızlanan, dur-kalk, yön değiştiren, fake reverse veya glitch dönüş.
- `specialObjects`: hedef üzerinde dönen kalp objeleri.

Mevcut hedef:

- 50 level.
- 1-45: zor ama adil ana oyun.
- 46-50: prestige/challenge; başarması çok zor olabilir.
- 1-20 arası her levelde en az 10 ok bulunur.

## 7. Skor / Streak / İlerleme

- Her başarılı ok: +1 skor.
- Streak hata yapınca sıfırlanır.
- Hatasız level geçişinde level complete banner gösterilir.
- Oyuncunun açtığı en yüksek level local storage'da saklanır.
- Progress kaybı kritik risk olarak görülür; kayıt sistemi basit ama sağlam olmalıdır.

## 8. Geri Bildirim ve His

- Atışta hafif haptic + kısa fırlatma sesi.
- Başarılı saplanmada küçük hedef titreşimi ve kısa hit hissi.
- Çarpışmada kırmızı flash, ekran shake, hata sesi.
- Kalp varken hata: kalp boşalır, level kaldığı yerden devam eder.
- Level tamamlanınca kısa banner ve geçiş.
- Restart bir saniyeden kısa hissettirmeli.

## 9. Ses

- Fırlatma, saplanma, çarpışma, level complete, game over.
- Kısa, keskin, arcade odaklı sesler.
- Arka plan müziği varsa ayarlardan kapatılabilir olmalı.

## 10. Kullanıcı / Backend

- MVP: local progress, high score, sound setting.
- Sonra: leaderboard.
- Daha sonra: Apple/Google login veya anonim kullanıcı adı.

## 11. Para Kazanma

- Ücretsiz + reklam opsiyonu ileride değerlendirilebilir.
- Reklam frekansı oyunun ritmini bozmamalı.
- İlk seanslarda agresif interstitial yok.
- Rewarded ad ancak açık değer sunarsa eklenmeli.
- Tek ve anlaşılır IAP: reklamsız sürüm.

## 12. Yayınlama

- EAS Build.
- App icon + splash yeni mekanik ile uyumlu olmalı: dönen hedef + ok.
- Store görselleri oyunun gerçek oynanışını göstermeli.
- Gizlilik politikası zorunlu.
- Store metni "tek dokunuş timing arcade" değerini öne çıkarmalı.

## 13. Telif ve Klon Riski

- Referans oyunların adı, ikon biçimi, mağaza açıklaması veya görsel düzeni taklit edilmez.
- Mekanik türünden ilham alınır; marka, ekran kompozisyonu, level tasarımı, ikon, hedef/ok görselleri özgün tutulur.
- Lisanslı logo, karakter, marka veya mağaza kimliği kullanılmaz.

## 14. Başarı Kriteri

- Oyuncu 3 saniyede ne yapacağını anlar.
- Fail sonrası tekrar deneme çok hızlıdır.
- İlk 10 level akıcı, yeterince uzun ve adil hissettirir.
- Oyuncu "yakındı" hissiyle tekrar dener.
- Progress güvenilir saklanır.
