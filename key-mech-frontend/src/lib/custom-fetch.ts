const getBaseUrl = () =>
  (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, "") ?? "";

const joinUrl = (base: string, path: string) => {
  const p = path.startsWith("/") ? path : "/" + path;
  return base + p;
};

const getToken = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
};

export const customFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const finalUrl = joinUrl(getBaseUrl(), url);
  const token = getToken();

  try {
  const response = await fetch(finalUrl, {
    ...options,
    signal: options?.signal,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const jsonData = await response.json();

  // Return the data in the format expected by orval-generated code
  return {
    data: jsonData,
    status: response.status,
    headers: response.headers,
  } as T;
  } catch (error: any) {
    // Ignore aborts so canceled queries in dev (StrictMode) don't surface as errors
    if (error?.name === "AbortError") {
      return Promise.reject(error);
    }
    throw error;
  }
};
