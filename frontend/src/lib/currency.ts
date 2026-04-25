export function formatXofAmount(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatXof(amount: number): string {
  return `${formatXofAmount(amount)} F CFA`;
}
