export function validateDetectionText(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return "Please enter a message before running the analysis.";
  }

  if (trimmedText.length < 5) {
    return "Please provide a longer message so SecureX can analyze it.";
  }

  if (trimmedText.length > 5000) {
    return "Messages are limited to 5,000 characters for privacy and performance.";
  }

  return "";
}

export function normalizeUrlInput(url) {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

export function validateUrlInput(url) {
  const normalizedUrl = normalizeUrlInput(url);

  if (!normalizedUrl) {
    return "Please enter a URL before running the analysis.";
  }

  try {
    // eslint-disable-next-line no-new
    new URL(normalizedUrl);
  } catch {
    return "Please enter a valid URL.";
  }

  return "";
}

export function validateCallInput({ transcript, audioBase64 }) {
  if (!transcript.trim() && !audioBase64) {
    return "Provide a transcript or attach a WAV file before analyzing the call.";
  }

  if (transcript.trim() && transcript.trim().length < 10 && !audioBase64) {
    return "Please provide a longer transcript for call analysis.";
  }

  return "";
}
