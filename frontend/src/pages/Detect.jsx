import { useState } from "react";

import ResultCard from "../components/ResultCard";
import TextAnalyzer from "../components/TextAnalyzer";
import { detectScam } from "../services/api";

function Detect() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError("Please enter a message before running the analysis.");
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await detectScam(trimmedMessage);
      setResult(response);
    } catch (requestError) {
      const apiError =
        requestError.response?.data?.detail ||
        requestError.response?.data?.text?.[0] ||
        "SecureX could not reach the detection API. Check that Django is running.";
      setError(apiError);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 py-6 lg:grid-cols-[1.05fr_0.95fr]">
      <TextAnalyzer
        value={message}
        onChange={setMessage}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />

      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-[color:var(--panel-bg)] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-skygrid">
            Detection output
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold">
            Real-time verdict with model confidence.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-text)]">
            Use SecureX as a quick triage step before clicking links, sharing credentials, or
            reacting to high-pressure messages.
          </p>
        </section>

        <ResultCard result={result} />
      </div>
    </div>
  );
}

export default Detect;
