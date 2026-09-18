/**
 * Endpoint Resume RCA masih dilayani service PHP qosmo (bukan `/api` utama),
 * jadi dipanggil dengan `fetch` + header `Rtoken`, bukan `apiRequest`.
 */
const QOSMO_ORIGIN = import.meta.env.DEV ? "/qosmo" : "https://qosmo.telkom.co.id";

export const qosmoUrl = (path: string) =>
  path.startsWith("/") ? `${QOSMO_ORIGIN}${path}` : `${QOSMO_ORIGIN}/${path}`;

/** Rtoken = base64 dari `level_user` pengguna yang sedang login. */
export const getQosmoHeaders = (): HeadersInit => {
  try {
    const user = JSON.parse(localStorage.getItem("user_data") ?? "{}");

    return { Rtoken: btoa(String(user?.level_user ?? "")) };
  } catch {
    return { Rtoken: "" };
  }
};

export const qosmoRequest = async <TResponse>(
  path: string,
  signal?: AbortSignal,
  headers: HeadersInit = getQosmoHeaders(),
): Promise<TResponse> => {
  const response = await fetch(qosmoUrl(path), { headers, signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
};
