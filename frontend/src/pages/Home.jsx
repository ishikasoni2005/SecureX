import { Link } from "react-router-dom";

import ModuleCard from "../components/dashboard/ModuleCard";
import Hero from "../components/Hero";

const features = [
  {
    title: "Unified fraud scoring",
    description:
      "SecureX reuses a shared AI core across messages, call transcripts, suspicious URLs, and online storefronts."
  },
  {
    title: "Explainable output",
    description:
      "Every module returns a confidence score, risk level, and human-readable explanations for the detection."
  },
  {
    title: "Privacy by design",
    description:
      "Sensitive number patterns are masked before model inference and request bodies are processed in memory only."
  }
];

const workflow = [
  "Choose the scanner that matches the threat surface: message, call, website, or storefront.",
  "SecureX masks sensitive data, extracts links, applies heuristics, and runs the shared NLP model.",
  "The API returns a verdict, confidence score, risk level, and human-readable reasons without storing the payload."
];

const modules = [
  {
    badge: "SMS / Chat",
    title: "Message Scanner",
    description: "Analyze phishing texts, fake banking alerts, prize scams, and credential theft bait.",
    to: "/message-scan"
  },
  {
    badge: "Phone Calls",
    title: "Call Analyzer",
    description: "Detect live-call pressure around OTP theft, impersonation, and financial transfer requests.",
    to: "/call-scan"
  },
  {
    badge: "Web / Links",
    title: "Website Scanner",
    description: "Inspect suspicious URLs, phishing forms, malicious link patterns, and SSL hygiene.",
    to: "/website-scan"
  }
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
            Built for modern fraud surfaces, not just one input box.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted-text)]">
            SecureX started as a message detector and now expands that same privacy-first core into
            call, URL, website, and e-commerce fraud analysis so risky patterns can be triaged in
            one place.
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard"
              className="inline-flex rounded-full border border-white/15 px-5 py-3 text-sm font-semibold transition hover:border-neon/40 hover:bg-white/5"
            >
              View the full platform
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

      <section className="grid gap-5 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard key={module.title} {...module} />
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[color:var(--panel-bg)] p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-ember">
              Detection workflow
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold">
              A simple path from suspicious content to a confident decision.
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
