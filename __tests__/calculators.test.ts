import { calculateSplitBill } from '../lib/features/split-bill';
import { validateTransactionInput, validateActivityInput } from '../lib/validations/records';

describe('Split Bill Calculator', () => {
  it('should split total bill equally among participants', () => {
    const result = calculateSplitBill({
      totalBill: 150000,
      people: ['Budi', 'Andi', 'Caca'],
    });

    expect(result.totalAmount).toBe(150000);
    expect(result.perPerson['Budi']).toBe(50000);
    expect(result.perPerson['Andi']).toBe(50000);
    expect(result.perPerson['Caca']).toBe(50000);
  });

  it('should handle tax and service percentage additions', () => {
    const result = calculateSplitBill({
      totalBill: 100000,
      people: ['Firman', 'Rifky'],
      taxPercent: 10,
    });

    expect(result.totalAmount).toBe(110000);
    expect(result.perPerson['Firman']).toBe(55000);
    expect(result.perPerson['Rifky']).toBe(55000);
  });
});

describe('Record Input Validations', () => {
  it('should reject invalid transaction amounts', () => {
    const res = validateTransactionInput({ amount: -50000, type: 'expense' });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('angka positif');
  });

  it('should accept valid transaction input', () => {
    const res = validateTransactionInput({ amount: 75000, type: 'expense', merchant: 'Indomaret' });
    expect(res.valid).toBe(true);
    expect(res.data?.amount).toBe(75000);
    expect(res.data?.merchant).toBe('Indomaret');
  });

  it('should reject empty activity title', () => {
    const res = validateActivityInput({ title: '' });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('tidak boleh kosong');
  });
});
