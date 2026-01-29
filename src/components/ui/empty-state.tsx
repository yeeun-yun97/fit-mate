"use client";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  label: string;
  onClick?: () => void;
  color?: "violet" | "orange" | "default";
  className?: string;
}

export function EmptyState({
  label,
  onClick,
  color = "default",
  className,
}: EmptyStateProps) {
  const colorStyles = {
    violet: {
      border: "border-violet-300 dark:border-violet-700",
      text: "text-violet-500 dark:text-violet-400",
      icon: "text-violet-400 dark:text-violet-500",
      hover: "hover:bg-violet-500/10",
    },
    orange: {
      border: "border-orange-300 dark:border-orange-700",
      text: "text-orange-500 dark:text-orange-400",
      icon: "text-orange-400 dark:text-orange-500",
      hover: "hover:bg-orange-500/10",
    },
    default: {
      border: "border-border",
      text: "text-muted-foreground",
      icon: "text-muted-foreground/50",
      hover: "hover:bg-muted",
    },
  };

  const styles = colorStyles[color];

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg border-2 border-dashed transition-colors",
        styles.border,
        onClick && `cursor-pointer ${styles.hover}`,
        className
      )}
      onClick={onClick}
    >
      <PlusCircleIcon className={cn("w-5 h-5", styles.icon)} />
      <span className={cn("text-xs font-medium", styles.text)}>{label}</span>
    </div>
  );

  return content;
}

function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}
