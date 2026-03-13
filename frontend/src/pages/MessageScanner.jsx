import { useEffect, useState } from "react";

import Analyzer from "../components/Analyzer";
import FraudScoreCard from "../components/FraudScoreCard";
import { useScanner } from "../hooks/useScanner";
import { initializeApiProtection, scanMessage } from "../services/api";
import { validateDetectionText } from "../utils/validators";

function MessageScanner() {
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const { result, error, isLoading, runScan } = useScanner((payload) => scanMessage(payload.text));

  useEffect(() => {
    initializeApiProtection().catch(() => {
      // The scanner retries before each protected POST request.
    });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateDetectionText(message);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError("");
    await runScan({ text: message.trim() });
  }

  return (
    <div className="grid gap-6 py-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Analyzer
        value={message}
        onChange={(nextValue) => {
          if (localError) {
            setLocalError("");
          }
          setMessage(nextValue);
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={localError || error}
      />

      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-[color:var(--panel-bg)] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-skygrid">
            Message fraud analysis
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold">
            Risk score, explanations, links, and sensitive-data warnings.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-text)]">
            SecureX classifies suspicious messages using keyword heuristics, link scanning,
            sensitive-data masking, and an NLP fraud model loaded from pickle.
          </p>
        </section>

        <FraudScoreCard
          result={result}
          emptyLabel="Analyze a message to see the verdict, confidence, reasons, and privacy warnings here."
        />
      </div>
    </div>
  );
}

export default MessageScanner;
