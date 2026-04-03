import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-panel/80 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
