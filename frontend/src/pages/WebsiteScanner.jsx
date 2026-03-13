import { useEffect, useState } from "react";

import FraudScoreCard from "../components/FraudScoreCard";
import URLAnalyzer from "../components/scanners/URLAnalyzer";
import { useScanner } from "../hooks/useScanner";
import { initializeApiProtection, scanUrl } from "../services/api";
import { normalizeUrlInput, validateUrlInput } from "../utils/validators";

const initialForm = {
  url: "",
  pageText: "",
  htmlContent: ""
};

function WebsiteScanner() {
  const [formData, setFormData] = useState(initialForm);
  const [localError, setLocalError] = useState("");
  const { result, error, isLoading, runScan } = useScanner(scanUrl);

  useEffect(() => {
    initializeApiProtection().catch(() => {
      // Protected POST requests retry their own CSRF bootstrap.
    });
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
      page_text: formData.pageText.trim(),
      html_content: formData.htmlContent.trim()
    });
  }

  return (
    <div className="grid gap-6 py-6 lg:grid-cols-[1.02fr_0.98fr]">
      <URLAnalyzer
        mode="website"
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={localError || error}
      />

      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-[color:var(--panel-bg)] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-skygrid">
            Website fraud workflow
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold">
            URL risk, SSL hygiene, phishing forms, and impersonation patterns in one pass.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-text)]">
            The website scanner combines URL heuristics, phishing-form detection, and the shared
            text model so teams can triage suspicious sites without storing the submitted data.
          </p>
        </section>

        <FraudScoreCard
          result={result}
          emptyLabel="Scan a URL to see website-risk findings, SSL checks, and phishing explanations."
        />
      </div>
    </div>
  );
}

export default WebsiteScanner;
