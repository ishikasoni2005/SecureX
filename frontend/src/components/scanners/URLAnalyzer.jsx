function URLAnalyzer({ mode, formData, onChange, onSubmit, isLoading, error }) {
  const isEcommerce = mode === "ecommerce";

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[color:var(--panel-bg)] p-6 shadow-aura sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-neon">
          {isEcommerce ? "E-commerce detector" : "Website scanner"}
        </p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {isEcommerce
            ? "Inspect storefront trust signals before checkout."
            : "Inspect suspicious URLs for phishing and fraud clues."}
        </h1>
        <p className="text-sm leading-7 text-[color:var(--muted-text)]">
          SecureX combines domain-risk heuristics, phishing-pattern checks, and ML scoring to flag
          suspicious websites without storing your submitted content.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-3 block text-sm font-medium">URL</span>
          <input
            type="text"
            value={formData.url}
            onChange={(event) => onChange("url", event.target.value)}
            placeholder="https://example.com/login"
            className="w-full rounded-[1.4rem] border border-white/10 bg-[color:var(--card-bg)] px-4 py-3 text-base outline-none transition placeholder:text-[color:var(--muted-text)] focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
          />
        </label>

        {isEcommerce ? (
          <>
            <label className="block">
              <span className="mb-3 block text-sm font-medium">Merchant name</span>
              <input
                type="text"
                value={formData.merchantName}
                onChange={(event) => onChange("merchantName", event.target.value)}
                placeholder="Example: Flash Deals Market"
                className="w-full rounded-[1.4rem] border border-white/10 bg-[color:var(--card-bg)] px-4 py-3 text-base outline-none transition placeholder:text-[color:var(--muted-text)] focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
              />
            </label>

            <label className="block">
              <span className="mb-3 block text-sm font-medium">Pricing text</span>
              <textarea
                value={formData.pricingText}
                onChange={(event) => onChange("pricingText", event.target.value)}
                rows={4}
                placeholder="Example: 90% OFF for the next 30 minutes."
                className="w-full rounded-[1.4rem] border border-white/10 bg-[color:var(--card-bg)] px-4 py-3 text-base outline-none transition placeholder:text-[color:var(--muted-text)] focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
              />
            </label>

            <label className="block">
              <span className="mb-3 block text-sm font-medium">Payment or checkout text</span>
              <textarea
                value={formData.paymentText}
                onChange={(event) => onChange("paymentText", event.target.value)}
                rows={4}
                placeholder="Example: Pay only by crypto or gift card."
                className="w-full rounded-[1.4rem] border border-white/10 bg-[color:var(--card-bg)] px-4 py-3 text-base outline-none transition placeholder:text-[color:var(--muted-text)] focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
              />
            </label>
          </>
        ) : (
          <label className="block">
            <span className="mb-3 block text-sm font-medium">Page text or screenshot transcript</span>
            <textarea
              value={formData.pageText}
              onChange={(event) => onChange("pageText", event.target.value)}
              rows={5}
              placeholder="Paste visible text from the page if you want deeper analysis."
              className="w-full rounded-[1.4rem] border border-white/10 bg-[color:var(--card-bg)] px-4 py-3 text-base outline-none transition placeholder:text-[color:var(--muted-text)] focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-3 block text-sm font-medium">Optional HTML snippet</span>
          <textarea
            value={formData.htmlContent}
            onChange={(event) => onChange("htmlContent", event.target.value)}
            rows={5}
            placeholder="Paste HTML or checkout markup for deeper phishing checks."
            className="w-full rounded-[1.4rem] border border-white/10 bg-[color:var(--card-bg)] px-4 py-3 text-base outline-none transition placeholder:text-[color:var(--muted-text)] focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
          />
        </label>

        {error ? (
          <div className="rounded-2xl border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-signal">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-neon px-5 py-3 text-sm font-semibold text-ink transition hover:scale-[1.01] hover:bg-[#72f6d1] disabled:cursor-not-allowed disabled:opacity-80"
        >
          {isLoading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
              Analyzing...
            </>
          ) : isEcommerce ? (
            "Analyze storefront"
          ) : (
            "Scan website"
          )}
        </button>
      </form>
    </section>
  );
}

export default URLAnalyzer;
