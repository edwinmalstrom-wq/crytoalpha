import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant?: "positive" | "negative" | "neutral";
  className?: string;
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  const styles = {
    positive: "border-teal text-teal bg-teal-dim",
    negative: "border-danger text-danger bg-danger/10",
    neutral: "border-border text-muted bg-white/5",
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums ${styles} ${className}`}
    >
      {children}
    </span>
  );
}
