from __future__ import annotations

import base64
import io
import json
import os
import wave
from dataclasses import dataclass
from pathlib import Path


VOSK_MODEL_ENV = "SECUREX_VOSK_MODEL_PATH"


@dataclass(frozen=True)
class TranscriptResult:
    transcript: str
    engine: str
    warnings: list[str]


class VoiceTranscriber:
    def transcribe(self, audio_base64: str) -> TranscriptResult:
        if not audio_base64.strip():
            return TranscriptResult(
                transcript="",
                engine="none",
                warnings=["No audio clip was provided for transcription."],
            )

        try:
            from vosk import KaldiRecognizer, Model
        except ImportError:
            return TranscriptResult(
                transcript="",
                engine="unavailable",
                warnings=[
                    "Audio transcription needs the optional 'vosk' package and a local Vosk model.",
                ],
            )

        model_path = os.getenv(VOSK_MODEL_ENV, "").strip()
        if not model_path or not Path(model_path).exists():
            return TranscriptResult(
                transcript="",
                engine="unavailable",
                warnings=[
                    f"Set {VOSK_MODEL_ENV} to a local Vosk model directory to enable audio scanning.",
                ],
            )

        try:
            audio_bytes = base64.b64decode(audio_base64)
            with wave.open(io.BytesIO(audio_bytes), "rb") as waveform:
                if waveform.getnchannels() != 1:
                    return TranscriptResult(
                        transcript="",
                        engine="vosk",
                        warnings=["Vosk transcription currently expects mono WAV audio."],
                    )

                recognizer = KaldiRecognizer(Model(model_path), waveform.getframerate())
                recognizer.SetWords(True)

                chunks: list[str] = []
                while True:
                    data = waveform.readframes(4000)
                    if not data:
                        break
                    if recognizer.AcceptWaveform(data):
                        partial = json.loads(recognizer.Result() or "{}")
                        if partial.get("text"):
                            chunks.append(partial["text"])

                final_result = json.loads(recognizer.FinalResult() or "{}")
                if final_result.get("text"):
                    chunks.append(final_result["text"])
        except Exception:
            return TranscriptResult(
                transcript="",
                engine="vosk",
                warnings=["SecureX could not decode that audio clip for transcription."],
            )

        transcript = " ".join(chunk.strip() for chunk in chunks if chunk.strip()).strip()
        if not transcript:
            return TranscriptResult(
                transcript="",
                engine="vosk",
                warnings=["The audio clip could not be transcribed into usable text."],
            )

        return TranscriptResult(transcript=transcript, engine="vosk", warnings=[])
