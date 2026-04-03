type ProgressBarProps = {
  label: string;
  sublabel?: string;
  percent: number;
  footer?: string;
};

export function ProgressBar({
  label,
  sublabel,
  percent,
  footer,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          {label}
        </span>
        {sublabel ? (
          <span className="text-sm font-medium text-white">{sublabel}</span>
        ) : null}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-teal transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {footer ? (
        <p className="text-xs text-muted">{footer}</p>
      ) : null}
    </div>
  );
}
