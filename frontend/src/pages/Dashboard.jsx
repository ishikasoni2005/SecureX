import { useEffect, useState } from "react";

import FraudScoreCard from "../components/FraudScoreCard";
import ModuleCard from "../components/dashboard/ModuleCard";
import URLAnalyzer from "../components/scanners/URLAnalyzer";
import { useScanner } from "../hooks/useScanner";
import { getPlatformOverview, initializeApiProtection, scanEcommerce } from "../services/api";
import { normalizeUrlInput, validateUrlInput } from "../utils/validators";

const dashboardModules = [
  {
    badge: "SMS / Messages",
    title: "Message Scanner",
    description: "Analyze suspicious SMS, chats, and phishing bait with link and NLP scoring.",
    to: "/message-scan"
  },
  {
    badge: "Phone Calls",
    title: "Call Analyzer",
    description: "Flag OTP theft, authority impersonation, remote-access pressure, and live fraud cues.",
    to: "/call-scan"
  },
  {
    badge: "Web Threats",
    title: "Website Scanner",
    description: "Inspect URLs, phishing forms, SSL posture, and malicious domain patterns.",
    to: "/website-scan"
  }
];

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState("");
  const [formData, setFormData] = useState({
    url: "",
    merchantName: "",
    pricingText: "",
    paymentText: "",
    htmlContent: ""
  });
  const [localError, setLocalError] = useState("");
  const { result, error, isLoading, runScan } = useScanner(scanEcommerce);

  useEffect(() => {
    initializeApiProtection().catch(() => {
      // Protected POST requests retry their own CSRF bootstrap.
    });

    getPlatformOverview()
      .then((response) => setOverview(response))
      .catch(() => setOverviewError("Platform overview is temporarily unavailable."));
  }, []);

  function handleChange(key, value) {
    if (localError) {
      setLocalError("");
    }
    setFormData((currentForm) => ({ ...currentForm, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateUrlInput(formData.url);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError("");
    await runScan({
      url: normalizeUrlInput(formData.url),
      merchant_name: formData.merchantName.trim(),
      pricing_text: formData.pricingText.trim(),
      payment_text: formData.paymentText.trim(),
      html_content: formData.htmlContent.trim()
    });
  }

  return (
    <div className="space-y-8 py-6">
      <section className="rounded-[2.2rem] border border-white/10 bg-[color:var(--panel-bg)] p-8 shadow-aura">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-neon">
          Fraud detection dashboard
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
          One platform for messages, calls, websites, and fake-store detection.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--muted-text)]">
          SecureX keeps the original message detector intact, then expands it into a modular fraud
          platform with reusable analysis services and privacy-first request handling.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(overview?.privacy ?? [
            "Zero data retention",
            "Sensitive-data masking before inference",
            "Anonymous analysis"
          ]).map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm leading-7 text-[color:var(--muted-text)]">{item}</p>
            </div>
          ))}
        </div>
        {overviewError ? (
          <p className="mt-4 text-sm text-signal">{overviewError}</p>
        ) : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {dashboardModules.map((module) => (
          <ModuleCard key={module.title} {...module} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <URLAnalyzer
          mode="ecommerce"
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={localError || error}
        />

        <FraudScoreCard
          result={result}
          emptyLabel="Run an e-commerce scan to see fake-store explanations, pricing risk, and payment warnings."
        />
      </section>
    </div>
  );
}

export default Dashboard;
