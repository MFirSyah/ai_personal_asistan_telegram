export interface SplitBillItem {
  name: string;
  price: number;
  assignedTo: string[]; // List of person names sharing this item
}

export interface SplitBillInput {
  totalBill: number;
  people: string[];
  items?: SplitBillItem[];
  taxPercent?: number; // e.g. 10%
  servicePercent?: number; // e.g. 5%
}

export interface SplitBillResult {
  totalAmount: number;
  perPerson: Record<string, number>;
  formattedSummary: string;
}

export function calculateSplitBill(input: SplitBillInput): SplitBillResult {
  const peopleCount = Math.max(1, input.people.length);
  const tax = (input.totalBill * (input.taxPercent || 0)) / 100;
  const service = (input.totalBill * (input.servicePercent || 0)) / 100;
  const grandTotal = input.totalBill + tax + service;

  const perPerson: Record<string, number> = {};

  if (input.items && input.items.length > 0) {
    // Itemized split calculation
    input.people.forEach((p) => (perPerson[p] = 0));
    let subtotalItems = 0;

    input.items.forEach((item) => {
      subtotalItems += item.price;
      const sharers = item.assignedTo.length ? item.assignedTo : input.people;
      const pricePerPerson = item.price / sharers.length;
      sharers.forEach((p) => {
        perPerson[p] = (perPerson[p] || 0) + pricePerPerson;
      });
    });

    // Proportional tax/service distribution
    const multiplier = subtotalItems > 0 ? grandTotal / subtotalItems : 1;
    input.people.forEach((p) => {
      perPerson[p] = Math.round((perPerson[p] || 0) * multiplier);
    });
    // Equal split calculation with exact Rupiah remainder balancing
    const equalShare = Math.floor(grandTotal / peopleCount);
    const remainder = grandTotal - equalShare * peopleCount;
    input.people.forEach((p, idx) => {
      perPerson[p] = equalShare + (idx === 0 ? remainder : 0);
    });
  }

  let summary = `🧾 **HASIL PERHITUNGAN PATUNGAN (SPLIT BILL)**\n\n`;
  summary += `💰 **Total Tagihan**: Rp ${grandTotal.toLocaleString('id-ID')}\n`;
  summary += `👥 **Jumlah Peserta**: ${peopleCount} Orang\n\n`;
  summary += `📋 **Rincian Per Orang**:\n`;

  Object.entries(perPerson).forEach(([person, amount]) => {
    summary += `• **${person}**: Rp ${amount.toLocaleString('id-ID')}\n`;
  });

  return {
    totalAmount: grandTotal,
    perPerson,
    formattedSummary: summary,
  };
}
