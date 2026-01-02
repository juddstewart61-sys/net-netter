import { useState } from "react";
import { Shield, Loader2, FileText, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface RuleInputProps {
  onAnalyze: (rules: string, type: "iptables" | "gcp") => void;
  isLoading: boolean;
}

export function RuleInput({ onAnalyze, isLoading }: RuleInputProps) {
  const [rules, setRules] = useState("");
  const [inputType, setInputType] = useState<"iptables" | "gcp">("iptables");

  const handleSubmit = () => {
    if (rules.trim()) {
      onAnalyze(rules, inputType);
    }
  };

  const placeholderIptables = `# Paste your iptables-save output here
# Example:
*filter
:INPUT ACCEPT [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
-A INPUT -p tcp --dport 22 -j ACCEPT
-A INPUT -p tcp --dport 80 -j ACCEPT
-A INPUT -p tcp --dport 443 -j ACCEPT
COMMIT`;

  const placeholderGCP = `{
  "firewallRules": [
    {
      "name": "allow-ssh",
      "direction": "INGRESS",
      "priority": 1000,
      "allowed": [{"IPProtocol": "tcp", "ports": ["22"]}],
      "sourceRanges": ["0.0.0.0/0"]
    }
  ]
}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setInputType("iptables")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            inputType === "iptables"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="w-4 h-4" />
          iptables
        </button>
        <button
          onClick={() => setInputType("gcp")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            inputType === "gcp"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          <Cloud className="w-4 h-4" />
          GCP VPC JSON
        </button>
      </div>

      <div className="relative">
        <textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder={inputType === "iptables" ? placeholderIptables : placeholderGCP}
          className={cn(
            "w-full h-64 bg-secondary/50 border border-border rounded-lg p-4",
            "font-mono text-sm text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
            "resize-none transition-all"
          )}
          disabled={isLoading}
        />
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
          {rules.length} characters
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!rules.trim() || isLoading}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg",
          "bg-primary text-primary-foreground font-medium",
          "hover:bg-primary/90 transition-all",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing Rules...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            Analyze Firewall Rules
          </>
        )}
      </button>
    </div>
  );
}
