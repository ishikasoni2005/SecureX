async function encodeFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Unsupported audio file."));
        return;
      }

      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("SecureX could not read that audio file."));
    reader.readAsDataURL(file);
  });
}

function AudioAnalyzer({
  transcript,
  callerContext,
  audioName,
  onTranscriptChange,
  onCallerContextChange,
  onAudioChange,
  onSubmit,
  isLoading,
  error
}) {
  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      onAudioChange("", "");
      return;
    }

    try {
      const encoded = await encodeFileToBase64(file);
      onAudioChange(encoded, file.name);
    } catch {
      onAudioChange("", "");
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[color:var(--panel-bg)] p-6 shadow-aura sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-neon">Call analyzer</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Scan call transcripts for impersonation and social-engineering pressure.
        </h1>
        <p className="text-sm leading-7 text-[color:var(--muted-text)]">
          SecureX supports transcript-first analysis today and can optionally transcribe mono WAV
          audio when a local Vosk model is configured on the backend.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-3 block text-sm font-medium">Transcript</span>
          <textarea
            value={transcript}
            onChange={(event) => onTranscriptChange(event.target.value)}
            rows={8}
            placeholder="Example: This is your bank. Do not hang up and read me the OTP right now..."
            className="w-full rounded-[1.4rem] border border-white/10 bg-[color:var(--card-bg)] px-4 py-3 text-base outline-none transition placeholder:text-[color:var(--muted-text)] focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
          />
        </label>

        <label className="block">
          <span className="mb-3 block text-sm font-medium">Caller context</span>
          <input
            type="text"
            value={callerContext}
            onChange={(event) => onCallerContextChange(event.target.value)}
            placeholder="Example: Claimed to be from the card department."
            className="w-full rounded-[1.4rem] border border-white/10 bg-[color:var(--card-bg)] px-4 py-3 text-base outline-none transition placeholder:text-[color:var(--muted-text)] focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
          />
        </label>

        <label className="block">
          <span className="mb-3 block text-sm font-medium">Optional WAV audio</span>
          <input
            type="file"
            accept=".wav,audio/wav"
            onChange={handleFileChange}
            className="block w-full rounded-[1.4rem] border border-dashed border-white/15 bg-[color:var(--card-bg)] px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-neon file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink hover:file:bg-[#72f6d1]"
          />
          {audioName ? (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[color:var(--muted-text)]">
              Attached: {audioName}
            </p>
          ) : null}
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
              Analyzing call...
            </>
          ) : (
            "Analyze call"
          )}
        </button>
      </form>
    </section>
  );
}

export default AudioAnalyzer;
