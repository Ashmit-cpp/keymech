interface PersistedAuthStorage {
  state?: {
    token?: string | null;
  };
}

const getBaseUrl = () => import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ?? "";

const joinUrl = (base: string, path: string) => {
  const p = path.startsWith("/") ? path : "/" + path;
  return base + p;
};

const getToken = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored) as PersistedAuthStorage;
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

    const contentType = response.headers.get("content-type");
    const data =
      response.status === 204
        ? undefined
        : contentType?.includes("application/json")
          ? await response.json()
          : await response.text();

    if (!response.ok) {
      const message =
        typeof data === "object" && data && "message" in data
          ? String(data.message)
          : `HTTP error! status: ${response.status}`;
      throw new Error(message);
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    } as T;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return Promise.reject(error);
    }
    throw error;
  }
};
