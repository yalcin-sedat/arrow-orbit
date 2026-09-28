// levels.ts için yapısal ve geçilebilirlik testleri.
// Kapasite hesabı burada yardımcı fonksiyon olarak tutulur, gameLogic.ts'e eklenmez.

import { LEVELS, SpeedPattern } from '../levels';

// GameScreen.tsx'teki withSequence kurulumuyla eşleşen bilinen speedPattern değerleri
// (ayrıca 'constant' fallback dalı, koşulların hiçbiri eşleşmediğinde kullanılır).
const KNOWN_SPEED_PATTERNS: readonly SpeedPattern[] = [
  'constant',
  'accelerating',
  'stopAndGo',
  'switchDirection',
  'fakeReverse',
  'glitch',
];

// AUDIT Adım 2 yöntemi: çarpışma koşulu `angleDistance <= tol` olduğundan tam tol
// uzaklık da çarpışma sayılır. Bir boşluğa sığan ok sayısı ceil(gap/tol) - 2'dir
// (ilk ve son ok sınır komşularına ayrılır, aradakiler tol kadar aralıklı sığar).
function gapCapacity(gapDeg: number, tolDeg: number): number {
  return Math.ceil(gapDeg / tolDeg) - 2;
}

// initialPins arasındaki (dairesel) boşluklardan toplam ilave ok kapasitesini hesaplar.
function levelCapacity(initialPins: number[], tolDeg: number): number {
  if (initialPins.length === 0) {
    // Hiç başlangıç pini yoksa tüm 360°'lik alan tek boşluktur.
    return gapCapacity(360, tolDeg);
  }
  const sorted = [...initialPins].map((a) => ((a % 360) + 360) % 360).sort((a, b) => a - b);
  let total = 0;
  for (let i = 0; i < sorted.length; i++) {
    const next = sorted[(i + 1) % sorted.length];
    const curr = sorted[i];
    const gap = i === sorted.length - 1 ? 360 - curr + next : next - curr;
    total += gapCapacity(gap, tolDeg);
  }
  return total;
}

describe('LEVELS yapısal bütünlük', () => {
  it('id\'ler 1..50 ve sıralı', () => {
    expect(LEVELS.length).toBe(50);
    LEVELS.forEach((level, idx) => {
      expect(level.id).toBe(idx + 1);
    });
  });

  it('initialPins 0..360 aralığında ve tekrarsız', () => {
    LEVELS.forEach((level) => {
      const seen = new Set<number>();
      level.initialPins.forEach((angle) => {
        expect(angle).toBeGreaterThanOrEqual(0);
        expect(angle).toBeLessThan(360);
        expect(seen.has(angle)).toBe(false);
        seen.add(angle);
      });
    });
  });

  it('speedPattern değeri GameScreen kurulumundaki bilinen değerlerden biri', () => {
    LEVELS.forEach((level) => {
      expect(KNOWN_SPEED_PATTERNS).toContain(level.speedPattern);
    });
  });
});

describe('LEVELS geçilebilirlik (kapasite >= requiredPins + 2 marj)', () => {
  LEVELS.forEach((level) => {
    it(`L${level.id}: kapasite requiredPins + 2 marjı karşılıyor`, () => {
      const capacity = levelCapacity(level.initialPins, level.collisionToleranceDeg);
      expect(capacity).toBeGreaterThanOrEqual(level.requiredPins + 2);
    });
  });
});
