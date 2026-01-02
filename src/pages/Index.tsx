import { useState } from "react";
import { Header } from "@/components/Header";
import { RuleInput } from "@/components/RuleInput";
import { RiskGauge } from "@/components/RiskGauge";
import { AnalysisSummary } from "@/components/AnalysisSummary";
import { VulnerabilityCard, Vulnerability } from "@/components/VulnerabilityCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, AlertTriangle, FileWarning } from "lucide-react";

interface AnalysisResult {
  riskScore: number;
  totalRules: number;
  vulnerabilities: Vulnerability[];
  summary: string;
}

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (rules: string, type: "iptables" | "gcp") => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-firewall", {
        body: { rules, type },
      });

      if (error) {
        console.error("Analysis error:", error);
        toast.error(error.message || "Failed to analyze firewall rules");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult(data);

      if (data.riskScore <= 30) {
        toast.success("Analysis complete! Your firewall configuration looks secure.");
      } else if (data.riskScore <= 60) {
        toast.warning("Analysis complete. Some issues need attention.");
      } else {
        toast.error("Critical vulnerabilities detected! Immediate action required.");
      }
    } catch (err) {
      console.error("Request failed:", err);
      toast.error("Failed to connect to analysis service");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,300px] gap-8">
          {/* Main content */}
          <div className="space-y-8">
            {/* Input section */}
            <section className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileWarning className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Firewall Rule Analysis
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Paste your iptables-save output or GCP VPC JSON
                  </p>
                </div>
              </div>
              <RuleInput onAnalyze={handleAnalyze} isLoading={isLoading} />
            </section>

            {/* Results section */}
            {(result || isLoading) && (
              <section className="space-y-6 animate-fade-up">
                {/* Summary stats */}
                {result && (
                  <AnalysisSummary
                    vulnerabilities={result.vulnerabilities}
                    totalRules={result.totalRules}
                  />
                )}

                {/* Vulnerabilities list */}
                {result && result.vulnerabilities.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Identified Vulnerabilities ({result.vulnerabilities.length})
                    </h3>
                    <div className="space-y-3">
                      {result.vulnerabilities.map((vuln, index) => (
                        <VulnerabilityCard
                          key={vuln.id}
                          vulnerability={vuln}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* No vulnerabilities */}
                {result && result.vulnerabilities.length === 0 && (
                  <div className="bg-success/10 border border-success/20 rounded-xl p-8 text-center">
                    <ShieldCheck className="w-12 h-12 text-success mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-success mb-2">
                      No Vulnerabilities Found
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Your firewall configuration appears to be secure and compliant with CIS Benchmarks.
                    </p>
                  </div>
                )}

                {/* Summary text */}
                {result && result.summary && (
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Assessment Summary
                    </h4>
                    <p className="text-sm text-foreground">{result.summary}</p>
                  </div>
                )}
              </section>
            )}

            {/* Empty state */}
            {!result && !isLoading && (
              <div className="bg-muted/30 border border-dashed border-border rounded-xl p-12 text-center">
                <ShieldCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
                  Paste your firewall rules above and click "Analyze" to receive
                  an AI-powered security assessment with CIS Benchmark compliance checks.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar with gauge */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6 text-center">
                Risk Score
              </h3>
              <RiskGauge
                score={result?.riskScore ?? 0}
                isLoading={isLoading}
              />
              {result && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Based on {result.vulnerabilities.length} finding
                  {result.vulnerabilities.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Quick tips */}
            <div className="bg-card border border-border rounded-xl p-6 mt-4">
              <h3 className="text-sm font-medium text-foreground mb-4">
                Quick Tips
              </h3>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-critical">•</span>
                  Never expose SSH to 0.0.0.0/0
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  Use specific IP ranges for access
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info">•</span>
                  Enable logging for all rules
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  Default deny policy recommended
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
