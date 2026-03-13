function ResultCard({ result }) {
  if (!result) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-6 text-[color:var(--muted-text)]">
        Run an analysis to see the AI verdict, confidence score, and reasoning here.
      </div>
    );
  }

  const isScam = result.classification === "Scam";
  const confidence = Math.round(result.confidence * 100);

  return (
    <article
      className={[
        "rounded-[1.75rem] border p-6 shadow-xl transition-colors duration-300",
        isScam
          ? "border-signal/30 bg-signal/10 shadow-alert"
          : "border-neon/30 bg-neon/10 shadow-aura"
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
            AI classification
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">
            {isScam ? "Scam" : "Not Scam"}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--muted-text)]">
            {result.explanation}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[color:var(--card-bg)] px-5 py-4">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
            Confidence
          </p>
          <p className="mt-2 text-3xl font-semibold">{confidence}%</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
          <span>Risk level</span>
          <span>{isScam ? "Potential phishing" : "Lower-risk language"}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className={[
              "h-full rounded-full transition-all duration-500",
              isScam ? "bg-signal" : "bg-neon"
            ].join(" ")}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </article>
  );
}

export default ResultCard;
