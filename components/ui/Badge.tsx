import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "blue" | "red" | "green" | "yellow" | "purple";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-white/10 text-gray-300 border-white/10",
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    red: "bg-red-500/20 text-red-300 border-red-500/30",
    green: "bg-green-500/20 text-green-300 border-green-500/30",
    yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
