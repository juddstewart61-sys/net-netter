import { AlertCircle, AlertTriangle, Info, Shield } from "lucide-react";
import { Vulnerability } from "./VulnerabilityCard";

interface AnalysisSummaryProps {
  vulnerabilities: Vulnerability[];
  totalRules: number;
}

export function AnalysisSummary({ vulnerabilities, totalRules }: AnalysisSummaryProps) {
  const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length;
  const warningCount = vulnerabilities.filter((v) => v.severity === "warning").length;
  const infoCount = vulnerabilities.filter((v) => v.severity === "info").length;

  const stats = [
    {
      label: "Total Rules",
      value: totalRules,
      icon: Shield,
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      label: "Critical",
      value: criticalCount,
      icon: AlertCircle,
      color: "text-critical",
      bgColor: "bg-critical/10",
    },
    {
      label: "Warnings",
      value: warningCount,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Info",
      value: infoCount,
      icon: Info,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bgColor} rounded-lg p-4 border border-border`}
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
