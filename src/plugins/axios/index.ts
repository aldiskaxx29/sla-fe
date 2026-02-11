// Axios
import defaultAxios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

// Interfaces
import { IApiResponseBase } from "@/app/interfaces/app-api.interface";

/**
 * @description Handle axios error response
 *
 * @param {AxiosError} response
 *
 * @return {IApiResponseBase} response
 */
const axios_handleErrorResponse = (response: AxiosError): IApiResponseBase => {
  console.error("AXIOS ERROR:", response); //
  const mapResponse: IApiResponseBase = {
    ok: false,
    config: response.config,
    message: response.message,
    headers: null,
    errorStatus: response.status,
    result: response.response,
  };

  /** @note logging for http://10.60.174.187:90opment only */
  if (["http://10.60.174.187:90opment"].includes(import.meta.env.MODE))
    console.error(mapResponse, "AXIOS ERROR");

  return mapResponse;
};

const axios_handleSuccessResponse = (
  response: AxiosResponse
): IApiResponseBase => {
  const mapResponse: IApiResponseBase = {
    ok: true,
    config: response.config,
    message: response.statusText,
    status: response.status,
    headers: response.headers,
    result: response.data,
  };

  /** @note logging for http://10.60.174.187:90opment only */
  if (["http://10.60.174.187:90opment"].includes(import.meta.env.MODE))
    console.log(mapResponse, "AXIOS OK");

  return mapResponse;
};

const config: AxiosRequestConfig = {
  withCredentials: true,
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  timeout: 10000,
};

const _axios = defaultAxios.create(config);

_axios.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(
      new Error(JSON.stringify(axios_handleErrorResponse(error)))
    );
  }
);

_axios.interceptors.response.use(
  (value: AxiosResponse<unknown>) => {
    return value;
  },
  (error) => {
    return Promise.reject(
      new Error(JSON.stringify(axios_handleErrorResponse(error)))
    );
  }
);

const axios = async <T>(
  url: string,
  method: "get" | "post" | "put" | "delete",
  attrs: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await _axios({
      url,
      method,
      ...attrs,
    });

    return Promise.resolve(
      axios_handleSuccessResponse(response) as unknown as T
    );
  } catch (err) {
    return Promise.reject(
      new Error(JSON.stringify(axios_handleErrorResponse(err as AxiosError)))
    );
  }
};

export { axios };
