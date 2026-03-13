import ExplanationPanel from "./ExplanationPanel";
import RiskIndicator from "./RiskIndicator";

const riskyClassifications = new Set(["Scam", "Fraud Risk", "Fraudulent Store"]);

function FraudScoreCard({ result, emptyLabel = "Run an analysis to see SecureX findings here." }) {
  if (!result) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-6 text-[color:var(--muted-text)]">
        {emptyLabel}
      </div>
    );
  }

  const risky = riskyClassifications.has(result.classification) || result.risk_level === "High";
  const confidence = Math.round((result.confidence ?? result.fraud_probability ?? 0) * 100);
  const detailEntries = [
    result.scanned_url ? { label: "Scanned URL", value: result.scanned_url } : null,
    result.storefront_url ? { label: "Storefront", value: result.storefront_url } : null,
    result.merchant_name ? { label: "Merchant", value: result.merchant_name } : null,
    result.ssl_status ? { label: "SSL status", value: result.ssl_status } : null,
    result.transcript_source ? { label: "Transcript source", value: result.transcript_source } : null
  ].filter(Boolean);

  return (
    <article
      className={[
        "rounded-[1.9rem] border p-6 shadow-xl transition-colors duration-300 sm:p-7",
        risky ? "border-signal/30 bg-signal/10 shadow-alert" : "border-neon/30 bg-neon/10 shadow-aura"
      ].join(" ")}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
              Classification
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">{result.classification}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted-text)]">
              {risky
                ? "SecureX found enough fraud signals to flag this content as risky."
                : "SecureX did not find enough evidence to classify this content as fraudulent."}
            </p>
          </div>

          {detailEntries.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {detailEntries.map((entry) => (
                <div
                  key={`${entry.label}-${entry.value}`}
                  className="rounded-3xl border border-white/10 bg-[color:var(--card-bg)] p-4"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
                    {entry.label}
                  </p>
                  <p className="mt-2 break-words text-sm font-medium text-[color:var(--app-text)]">
                    {entry.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <ExplanationPanel
            title="Reasons"
            items={result.explanation}
            emptyLabel="No explanation signals were returned."
          />

          {result.warnings?.length ? (
            <ExplanationPanel
              title="Warnings"
              items={result.warnings}
              emptyLabel="No active warnings."
              tone="warning"
            />
          ) : null}
        </div>

        <div className="space-y-5">
          <RiskIndicator
            riskLevel={result.risk_level}
            riskScore={result.risk_score}
            confidence={confidence}
            risky={risky}
          />

          {result.masked_text ? (
            <section className="rounded-[1.5rem] border border-white/10 bg-[color:var(--card-bg)] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
                Masked analysis copy
              </p>
              <p className="mt-3 break-words text-sm leading-7 text-[color:var(--muted-text)]">
                {result.masked_text}
              </p>
            </section>
          ) : null}

          {result.transcript ? (
            <section className="rounded-[1.5rem] border border-white/10 bg-[color:var(--card-bg)] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
                Transcript
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[color:var(--muted-text)]">
                {result.transcript}
              </p>
            </section>
          ) : null}

          {result.link_findings?.length ? (
            <section className="rounded-[1.5rem] border border-white/10 bg-[color:var(--card-bg)] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
                Suspicious link findings
              </p>
              <div className="mt-3 space-y-3 text-sm leading-7 text-[color:var(--muted-text)]">
                {result.link_findings.map((finding) => (
                  <div
                    key={`${finding.domain}-${finding.url}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="font-semibold text-[color:var(--app-text)]">{finding.domain}</p>
                    <p className="break-words text-xs text-[color:var(--muted-text)]">{finding.url}</p>
                    <div className="mt-2 space-y-1">
                      {finding.reasons.map((reason) => (
                        <p key={reason}>• {reason}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {result.sensitive_findings?.length ? (
            <section className="rounded-[1.5rem] border border-white/10 bg-[color:var(--card-bg)] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
                Sensitive data findings
              </p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--muted-text)]">
                {result.sensitive_findings.map((finding) => (
                  <p key={`${finding.type}-${finding.masked_value}`}>
                    <span className="font-semibold text-[color:var(--app-text)]">{finding.type}:</span>{" "}
                    {finding.masked_value}
                  </p>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default FraudScoreCard;
