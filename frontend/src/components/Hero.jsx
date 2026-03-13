import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[color:var(--panel-bg)] px-6 py-16 shadow-aura sm:px-10 lg:px-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(84,240,198,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,107,125,0.14),_transparent_28%)]" />

      <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-neon/20 bg-neon/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] text-neon">
            AI scam detection for text messages
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Detect suspicious messages before they turn into expensive mistakes.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted-text)]">
            SecureX analyzes phishing-style urgency, credential theft cues, and payment
            manipulation language in seconds, then explains why a message looks risky.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/detect"
              className="inline-flex items-center justify-center rounded-full bg-neon px-6 py-3 text-sm font-semibold text-ink transition hover:scale-[1.02] hover:bg-[#72f6d1]"
            >
              Check Message
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-[color:var(--app-text)] transition hover:border-white/30 hover:bg-white/5"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-signal/20 bg-signal/10 p-5 shadow-alert">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-signal">
              Threat signal
            </p>
            <p className="mt-3 text-xl font-semibold">
              “Verify your salary account now or access will be revoked.”
            </p>
            <p className="mt-3 text-sm text-[color:var(--muted-text)]">
              High-risk urgency + account compromise language.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-neon/20 bg-neon/10 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-neon">
              Privacy first
            </p>
            <p className="mt-3 text-xl font-semibold">No message text is stored in the database.</p>
            <p className="mt-3 text-sm text-[color:var(--muted-text)]">
              Detection runs in memory and returns only the AI verdict.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
