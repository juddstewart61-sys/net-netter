import { useMemo } from "react";

interface RiskGaugeProps {
  score: number; // 0-100
  isLoading?: boolean;
}

export function RiskGauge({ score, isLoading = false }: RiskGaugeProps) {
  const { color, label, glowClass } = useMemo(() => {
    if (score <= 30) {
      return { color: "hsl(var(--success))", label: "Low Risk", glowClass: "" };
    } else if (score <= 60) {
      return { color: "hsl(var(--warning))", label: "Medium Risk", glowClass: "glow-warning" };
    } else {
      return { color: "hsl(var(--critical))", label: "High Risk", glowClass: "glow-critical" };
    }
  }, [score]);

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${glowClass} rounded-full`}>
        <svg width="160" height="160" viewBox="0 0 100 100" className="transform -rotate-90">
          {/* Background arc */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          {!isLoading && (
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="animate-gauge-fill transition-all duration-1000"
              style={{ "--gauge-offset": strokeDashoffset } as React.CSSProperties}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-4xl font-bold" style={{ color }}>
                {score}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                / 100
              </span>
            </>
          )}
        </div>
      </div>
      <div className="text-center">
        <span
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {isLoading ? "Analyzing..." : label}
        </span>
      </div>
    </div>
  );
}
