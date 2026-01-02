import { Shield, Github } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Firewall Insight
              </h1>
              <p className="text-xs text-muted-foreground">
                AI-Powered Security Audit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:block">
              CIS Benchmark Compliant
            </span>
            <a
              href="https://www.cisecurity.org/benchmark/linux"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Learn More →
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
