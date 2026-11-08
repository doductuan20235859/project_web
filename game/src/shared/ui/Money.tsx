const yenFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
});

export function Money({ amount }: { amount: number }) {
  return <span>{yenFormatter.format(amount)}</span>;
}
