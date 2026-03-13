import { useEffect, useState } from "react";

import FraudScoreCard from "../components/FraudScoreCard";
import AudioAnalyzer from "../components/scanners/AudioAnalyzer";
import { useScanner } from "../hooks/useScanner";
import { initializeApiProtection, scanCall } from "../services/api";
import { validateCallInput } from "../utils/validators";

function CallAnalyzer() {
  const [transcript, setTranscript] = useState("");
  const [callerContext, setCallerContext] = useState("");
  const [audioBase64, setAudioBase64] = useState("");
  const [audioName, setAudioName] = useState("");
  const [localError, setLocalError] = useState("");
  const { result, error, isLoading, runScan } = useScanner(scanCall);

  useEffect(() => {
    initializeApiProtection().catch(() => {
      // Protected POST requests retry their own CSRF bootstrap.
    });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateCallInput({ transcript, audioBase64 });
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError("");
    await runScan({
      transcript: transcript.trim(),
      caller_context: callerContext.trim(),
      audio_base64: audioBase64
    });
  }

  return (
    <div className="grid gap-6 py-6 lg:grid-cols-[1.02fr_0.98fr]">
      <AudioAnalyzer
        transcript={transcript}
        callerContext={callerContext}
        audioName={audioName}
        onTranscriptChange={(nextTranscript) => {
          if (localError) {
            setLocalError("");
          }
          setTranscript(nextTranscript);
        }}
        onCallerContextChange={(nextCallerContext) => {
          if (localError) {
            setLocalError("");
          }
          setCallerContext(nextCallerContext);
        }}
        onAudioChange={(nextAudioBase64, nextAudioName) => {
          if (localError) {
            setLocalError("");
          }
          setAudioBase64(nextAudioBase64);
          setAudioName(nextAudioName);
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={localError || error}
      />

      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-[color:var(--panel-bg)] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-skygrid">
            Call fraud workflow
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold">
            Transcript-first fraud scoring for impersonation, OTP theft, and payment scams.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-text)]">
            Call analysis reuses the message NLP model, then layers in live-call pressure signals
            like line-holding, remote-access pressure, and authority impersonation.
          </p>
        </section>

        <FraudScoreCard
          result={result}
          emptyLabel="Analyze a transcript or attach WAV audio to see call-risk findings here."
        />
      </div>
    </div>
  );
}

export default CallAnalyzer;
