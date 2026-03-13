import { Link } from "react-router-dom";

import Hero from "../components/Hero";

const features = [
  {
    title: "Live risk scoring",
    description:
      "Classifies messages as Scam or Not Scam in seconds and surfaces a confidence score."
  },
  {
    title: "Explainable output",
    description:
      "Highlights the language cues behind the model verdict so users know what triggered it."
  },
  {
    title: "Privacy by design",
    description:
      "User text stays in memory during the request and is never written to the SQLite database."
  }
];

const workflow = [
  "Paste or type any suspicious message into the detector.",
  "SecureX preprocesses the text and runs it through a scikit-learn classifier.",
  "The API returns a verdict, confidence score, and plain-language explanation."
];

function Home() {
  return (
    <div className="space-y-10 py-6">
      <Hero />

      <section id="how-it-works" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[color:var(--panel-bg)] p-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-skygrid">
            Why SecureX
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold">
            Built for messages that pressure, impersonate, and manipulate.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted-text)]">
            Phishing texts often rely on urgency, fear, fake rewards, or requests for
            credentials. SecureX scores those patterns instantly and visualizes the result in a
            way that is easy to act on.
          </p>
          <div className="mt-6">
            <Link
              to="/detect"
              className="inline-flex rounded-full border border-white/15 px-5 py-3 text-sm font-semibold transition hover:border-neon/40 hover:bg-white/5"
            >
              Go to the detector
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6"
            >
              <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted-text)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[color:var(--panel-bg)] p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-ember">
              Detection workflow
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold">
              A simple path from suspicious text to clear action.
            </h2>
          </div>
          <div className="grid gap-4 lg:max-w-2xl lg:flex-1">
            {workflow.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 font-mono text-sm">
                  0{index + 1}
                </div>
                <p className="text-sm leading-7 text-[color:var(--muted-text)]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
