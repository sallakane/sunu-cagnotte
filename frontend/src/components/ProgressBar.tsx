type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="progress">
      <div
        className="progress__fill"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

