import { formatXofAmount } from "../lib/currency";

export function FormatXof({ amount }: { amount: number }) {
  return (
    <span className="amount-xof">
      {formatXofAmount(amount)}<span className="amount-xof__unit"> F CFA</span>
    </span>
  );
}
