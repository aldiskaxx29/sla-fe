import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { toast } from "react-toastify";

declare module "axios" {
  interface AxiosRequestConfig {
    skipErrorToast?: boolean;
    skipAuthRedirect?: boolean;
  }
}

export const resolveApiBaseUrl = (
  baseUrl: string | undefined = import.meta.env.VITE_APP_BASE_URL,
): string => {
  if (!baseUrl) return "/api";

  if (import.meta.env.DEV) {
    if (baseUrl.startsWith("http://10.60.174.187:8089")) return "/api";
    if (baseUrl.includes("qosmo.telkom.co.id")) return "/qosmo/api";
  }

  return baseUrl;
};

export const serializeParams = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null || item === "") return;
        searchParams.append(key.endsWith("[]") ? key : `${key}[]`, String(item));
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams.toString().replace(/\+/g, "%20");
};

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  paramsSerializer: { serialize: serializeParams },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("access_token");

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  config.headers.set("ngrok-skip-browser-warning", "any");

  return config;
});

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || fallback;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
};

const getErrorMessage = (error: AxiosError): string => {
  const data = error.response?.data as { message?: string } | undefined;

  if (data?.message) return data.message;
  if (error.response?.status) {
    return `Request failed with status ${error.response.status}`;
  }

  return error.message || "Request failed";
};

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    if (!error.config?.skipErrorToast) {
      toast.error(getErrorMessage(error));
    }

    return Promise.reject(error);
  },
);

export const apiRequest = async <TResponse>(
  config: AxiosRequestConfig,
): Promise<TResponse> => {
  const response = await apiClient.request<TResponse>(config);
  return response.data;
};
