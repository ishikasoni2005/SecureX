import { startTransition, useState } from "react";

import { extractApiError } from "../services/api";

export function useScanner(requestHandler) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function runScan(payload) {
    setIsLoading(true);
    setError("");

    try {
      const response = await requestHandler(payload);
      startTransition(() => {
        setResult(response);
      });
      return response;
    } catch (requestError) {
      const message = extractApiError(requestError);
      startTransition(() => {
        setResult(null);
      });
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setError("");
    setResult(null);
  }

  return {
    result,
    error,
    isLoading,
    runScan,
    reset
  };
}
