import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are a senior security engineer specializing in firewall auditing and CIS Benchmark compliance. Your task is to analyze firewall rules (either iptables-save output or GCP VPC JSON) and identify security vulnerabilities.

For each vulnerability found, you must:
1. Assign a severity: "critical", "warning", or "info"
2. Reference the relevant CIS Benchmark control if applicable
3. Provide a specific, actionable fix command

CRITICAL SEVERITY (immediate action required):
- SSH (port 22) open to 0.0.0.0/0 or ::/0
- Database ports (3306, 5432, 27017) exposed to public
- RDP (port 3389) open to public
- All traffic allowed from any source
- No default deny policy

WARNING SEVERITY (should be addressed):
- Overly broad CIDR ranges (larger than /16)
- HTTP (port 80) without redirect to HTTPS
- Telnet (port 23) enabled
- FTP (port 21) enabled
- ICMP unrestricted

INFO SEVERITY (recommendations):
- Missing logging rules
- Rules without comments/descriptions
- Suboptimal rule ordering
- Legacy protocol support

You MUST respond with valid JSON in this exact format:
{
  "riskScore": <number 0-100>,
  "totalRules": <number>,
  "vulnerabilities": [
    {
      "id": "<unique-id>",
      "title": "<short title>",
      "description": "<detailed explanation>",
      "severity": "critical" | "warning" | "info",
      "rule": "<the specific rule text that is problematic>",
      "fixCommand": "<exact command to fix the issue>",
      "cisReference": "CIS X.X.X" | null
    }
  ],
  "summary": "<brief overall assessment>"
}

Calculate riskScore based on:
- Each critical vulnerability: +25 points
- Each warning: +10 points  
- Each info: +2 points
- Cap at 100

Be thorough but avoid false positives. Only flag genuine security concerns.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rules, type } = await req.json();
    
    if (!rules || typeof rules !== "string") {
      return new Response(
        JSON.stringify({ error: "Rules input is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `Analyze these ${type === "gcp" ? "Google Cloud VPC firewall rules (JSON format)" : "Linux iptables-save rules"} for security vulnerabilities:

\`\`\`
${rules}
\`\`\`

Identify all security issues, paying special attention to:
- Open ports to the public internet (0.0.0.0/0)
- Missing default deny policies
- Dangerous services exposed (SSH, RDP, databases)
- CIS Benchmark violations

Respond ONLY with the JSON object, no markdown formatting.`;

    console.log("Calling Lovable AI gateway for firewall analysis...");
    console.log("Input type:", type);
    console.log("Rules length:", rules.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI analysis failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty response from AI");
      return new Response(
        JSON.stringify({ error: "AI returned an empty response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI response received, parsing...");

    // Parse the JSON response, handling potential markdown code blocks
    let analysisResult;
    try {
      let jsonContent = content.trim();
      // Remove markdown code block if present
      if (jsonContent.startsWith("```json")) {
        jsonContent = jsonContent.slice(7);
      } else if (jsonContent.startsWith("```")) {
        jsonContent = jsonContent.slice(3);
      }
      if (jsonContent.endsWith("```")) {
        jsonContent = jsonContent.slice(0, -3);
      }
      jsonContent = jsonContent.trim();
      
      analysisResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analysis complete:", {
      riskScore: analysisResult.riskScore,
      vulnerabilities: analysisResult.vulnerabilities?.length || 0,
    });

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-firewall function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
