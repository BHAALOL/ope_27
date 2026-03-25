import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "dark";
  hover?: boolean;
}

export function Card({
  className,
  variant = "glass",
  hover = false,
  children,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-dark-700 border border-white/10",
    glass: "glass",
    dark: "glass-dark",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        variants[variant],
        hover && "card-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
