import { maskSensitivePreview } from "../utils/encryption";

const SAMPLE_MESSAGES = [
  "Urgent: confirm your bank password immediately to stop your account from being suspended.",
  "Your package is on the way and should arrive by 6 PM today.",
  "The CEO needs you to buy gift cards and send the codes before the next meeting."
];

function Analyzer({ value, onChange, onSubmit, isLoading, error }) {
  const maskedPreview = maskSensitivePreview(value);
  const showMaskedPreview = Boolean(value.trim()) && maskedPreview !== value;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[color:var(--panel-bg)] p-6 shadow-aura sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-neon">
          Message scanner
        </p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Paste a suspicious SMS and inspect its fraud risk safely.
        </h1>
        <p className="text-sm leading-7 text-[color:var(--muted-text)]">
          SecureX masks sensitive number patterns before AI inference, checks links and social
          engineering cues, and never stores the original message text.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <label className="block">
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="block text-sm font-medium text-[color:var(--app-text)]">
              Message content
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--muted-text)]">
              {value.trim().length}/5000
            </span>
          </div>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={9}
            placeholder="Example: Your account will be disabled unless you verify your password here..."
            className="min-h-[220px] w-full rounded-[1.5rem] border border-white/10 bg-[color:var(--card-bg)] px-4 py-4 text-base text-[color:var(--app-text)] outline-none transition placeholder:text-[color:var(--muted-text)] focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
          />
        </label>

        {showMaskedPreview ? (
          <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-400/10 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-amber-300">
              Local privacy preview
            </p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted-text)]">
              SecureX will analyze a masked in-memory copy of sensitive numbers:
            </p>
            <p className="mt-3 break-words rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm">
              {maskedPreview}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {SAMPLE_MESSAGES.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => onChange(sample)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-left text-xs font-medium text-[color:var(--muted-text)] transition hover:border-neon/30 hover:text-[color:var(--app-text)]"
            >
              {sample}
            </button>
          ))}
        </div>

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
              Scanning message...
            </>
          ) : (
            "Scan message"
          )}
        </button>
      </form>
    </section>
  );
}

export default Analyzer;
