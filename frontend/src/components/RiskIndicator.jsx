const toneByRisk = {
  High: "bg-signal/15 text-signal border-signal/30",
  Medium: "bg-ember/15 text-ember border-ember/30",
  Low: "bg-neon/15 text-neon border-neon/30"
};

function RiskIndicator({ riskLevel, riskScore, confidence, risky }) {
  const tone = toneByRisk[riskLevel] ?? toneByRisk.Low;

  return (
    <div className="space-y-4">
      <div className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${tone}`}>
        Risk {riskLevel}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[color:var(--card-bg)] p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
              Fraud score
            </p>
            <p className="mt-2 text-4xl font-bold">{riskScore}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
              Confidence
            </p>
            <p className="mt-2 text-3xl font-semibold">{confidence}%</p>
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className={[
              "h-full rounded-full transition-all duration-500",
              risky ? "bg-signal" : "bg-neon"
            ].join(" ")}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default RiskIndicator;
