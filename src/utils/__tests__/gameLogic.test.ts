// gameLogic.ts içindeki saf fonksiyonların birim testleri.
// Bu testler mevcut davranışı kilitler; başarısız olursa önce testi değil kodu sorgula.

import {
  normalizeAngle,
  angleDistance,
  getImpactAngle,
  willCollideWithPins,
  addPin,
  isLevelComplete,
  createLevelState,
  applySafeHit,
} from '../gameLogic';

describe('normalizeAngle', () => {
  it('0-360 aralığındaki açıyı değiştirmez', () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(180)).toBe(180);
    expect(normalizeAngle(359)).toBe(359);
  });

  it('360 ve üstünü sarar', () => {
    expect(normalizeAngle(360)).toBe(0);
    expect(normalizeAngle(361)).toBe(1);
    expect(normalizeAngle(720 + 45)).toBe(45);
  });

  it('negatif açıları pozitif eşdeğerine sarar', () => {
    expect(normalizeAngle(-1)).toBe(359);
    expect(normalizeAngle(-360)).toBe(0);
    expect(normalizeAngle(-450)).toBe(270);
  });
});

describe('angleDistance', () => {
  it('aynı açı için 0 döner', () => {
    expect(angleDistance(45, 45)).toBe(0);
  });

  it('kısa yönden mesafeyi hesaplar (180 sınırın altında)', () => {
    expect(angleDistance(10, 30)).toBe(20);
    expect(angleDistance(30, 10)).toBe(20);
  });

  it('0/360 sarmasında en kısa mesafeyi bulur', () => {
    // 350 ile 10 arası düz farkla 340 olur ama gerçek en kısa mesafe 20'dir.
    expect(angleDistance(350, 10)).toBe(20);
    expect(angleDistance(10, 350)).toBe(20);
  });

  it('tam zıt açılarda maksimum 180 döner', () => {
    expect(angleDistance(0, 180)).toBe(180);
  });
});

describe('getImpactAngle', () => {
  // Pin alttan geldiği için dünya temas noktası 180°; hedef R derece dönmüşse
  // lokal temas açısı (180 - R) normalize edilerek bulunur.
  it('rotation 0 iken temas açısı 180 olur', () => {
    expect(getImpactAngle(0)).toBe(180);
  });

  it('rotation 180 iken temas açısı 0 olur', () => {
    expect(getImpactAngle(180)).toBe(0);
  });

  it('360 üstü ve negatif rotation değerlerini normalize eder', () => {
    expect(getImpactAngle(540)).toBe(getImpactAngle(180));
    expect(getImpactAngle(-90)).toBe(normalizeAngle(180 - -90));
  });
});

describe('willCollideWithPins', () => {
  // Çarpışma toleransı: angleDistance <= tol, yani tam tol uzaklık da çarpışma sayılır.
  it('tam tolerans sınırında (<=) çarpışma sayar', () => {
    expect(willCollideWithPins(30, [10], 20)).toBe(true); // mesafe tam 20
  });

  it('tolerans sınırının hemen dışında çarpışma saymaz', () => {
    expect(willCollideWithPins(30.01, [10], 20)).toBe(false); // mesafe 20.01
  });

  it('0/360 sarmasında da toleransı doğru uygular', () => {
    expect(willCollideWithPins(5, [355], 10)).toBe(true); // gerçek mesafe 10
    expect(willCollideWithPins(5, [354.99], 10)).toBe(false); // gerçek mesafe ~10.01
  });

  it('hiç pin yoksa çarpışma olmaz', () => {
    expect(willCollideWithPins(0, [], 15)).toBe(false);
  });

  it('birden çok pinden herhangi biri toleransa girerse true döner', () => {
    expect(willCollideWithPins(100, [0, 95, 200], 10)).toBe(true);
  });
});

describe('addPin', () => {
  it('normalize edilmiş açıyı listeye ekler', () => {
    expect(addPin([10], 370)).toEqual([10, 10]);
    expect(addPin([], -30)).toEqual([330]);
  });
});

describe('isLevelComplete', () => {
  // Level tamamlanma: saplanan pin sayısı gerekli sayıya ulaşınca veya geçince tamamlanır.
  it('pin sayısı gerekenden azsa tamamlanmadı', () => {
    expect(isLevelComplete([1, 2], 3)).toBe(false);
  });

  it('pin sayısı gerekene tam eşitse tamamlandı', () => {
    expect(isLevelComplete([1, 2, 3], 3)).toBe(true);
  });

  it('pin sayısı gerekeni aşarsa da tamamlandı', () => {
    expect(isLevelComplete([1, 2, 3, 4], 3)).toBe(true);
  });

  it('gerekli pin 0 ise boş listeyle bile tamamlandı', () => {
    expect(isLevelComplete([], 0)).toBe(true);
  });
});

describe('createLevelState', () => {
  it('başlangıç pinlerini normalize ederek state oluşturur', () => {
    const state = createLevelState(10, [370, -10]);
    expect(state.placedPins).toEqual([10, 350]);
    expect(state.remainingPins).toBe(10);
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.lives).toBe(1);
  });

  it('başlangıç pini verilmezse boş liste kullanır', () => {
    const state = createLevelState(5);
    expect(state.placedPins).toEqual([]);
  });
});

describe('applySafeHit', () => {
  // Güvenli isabet akışı: skor ve streak artar, kalan pin sayısı düşer, kalp değişmez.
  it('skor ve streak\'i bir artırır, pini ekler', () => {
    const state = createLevelState(3);
    const next = applySafeHit(state, 45);
    expect(next.score).toBe(1);
    expect(next.streak).toBe(1);
    expect(next.placedPins).toEqual([45]);
    expect(next.remainingPins).toBe(2);
    expect(next.lives).toBe(state.lives);
  });

  it('remainingPins 0 altına inmez', () => {
    const state = createLevelState(0);
    const next = applySafeHit(state, 10);
    expect(next.remainingPins).toBe(0);
  });

  it('orijinal state\'i mutasyona uğratmaz (saf fonksiyon)', () => {
    const state = createLevelState(3);
    const before = JSON.stringify(state);
    applySafeHit(state, 45);
    expect(JSON.stringify(state)).toBe(before);
  });
});
