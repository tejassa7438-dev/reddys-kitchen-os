import type { ButtonHTMLAttributes } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "danger";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-red-600 hover:bg-red-700 text-white",

  secondary:
    "bg-zinc-800 hover:bg-zinc-700 text-white",

  success:
    "bg-green-600 hover:bg-green-700 text-white",

  danger:
    "bg-red-700 hover:bg-red-800 text-white",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`px-5 py-3 rounded-xl font-semibold transition ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}