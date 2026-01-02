import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export type Severity = "critical" | "warning" | "info";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    label: "Critical",
    bgClass: "bg-critical/15",
    textClass: "text-critical",
    borderClass: "border-critical/30",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    bgClass: "bg-warning/15",
    textClass: "text-warning",
    borderClass: "border-warning/30",
  },
  info: {
    icon: Info,
    label: "Info",
    bgClass: "bg-info/15",
    textClass: "text-info",
    borderClass: "border-info/30",
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
        config.bgClass,
        config.textClass,
        config.borderClass,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
