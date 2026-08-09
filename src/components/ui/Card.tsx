import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`bg-zinc-900 rounded-2xl border border-zinc-800 shadow-lg p-6 ${className}`}
    >
      {children}
    </div>
  );
}