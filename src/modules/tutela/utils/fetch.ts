/**
 * Fetch helper with automatic retry and timeout
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000,
  timeoutMs = 20000
): Promise<Response> => {
  const token =
    localStorage.getItem("access_token") ||
    import.meta.env.VITE_DAILY_MONITORING_TOKEN;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const mergedHeaders = {
    ...authHeaders,
    ...options.headers,
  };

  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        headers: mergedHeaders,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) return res;
      throw new Error(`HTTP error! status: ${res.status}`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isAbort = err.name === "AbortError";
      console.warn(
        `Attempt ${i + 1} failed for ${url}. Error: ${
          isAbort ? "Timeout after " + timeoutMs + "ms" : err.message
        }`
      );
      if (i === retries) throw err;
      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(1.5, i))
      );
    }
  }
  throw new Error("Fetch failed after retries");
};
