import type { CSSProperties } from "react";

type ProgressDonutProps = {
  value: number;
};

export function ProgressDonut({ value }: ProgressDonutProps) {
  const displayValue = Math.max(0, Math.round(value));
  const cappedValue = Math.min(displayValue, 100);
  const style = {
    "--progress-angle": `${(cappedValue / 100) * 360}deg`,
  } as CSSProperties;

  return (
    <div
      className="progress-donut"
      style={style}
      role="img"
      aria-label={`${displayValue}% de l'objectif atteint`}
    >
      <div className="progress-donut__inner">
        <strong>{displayValue}%</strong>
        <span>atteints</span>
      </div>
    </div>
  );
}
