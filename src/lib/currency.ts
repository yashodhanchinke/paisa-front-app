export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAmount(amount: number, type: 'income' | 'expense'): string {
  const formatted = formatINR(Math.abs(amount));
  return type === 'expense' ? `-${formatted}` : `+${formatted}`;
}