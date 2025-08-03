// Redux Toolkit
import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

// Mutations
import { auth_LOGOUT } from "@/modules/auth/redux/auth.slice";
import { toast } from "react-toastify";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_APP_BASE_URL || "api.local",
  credentials: "omit",
  prepareHeaders(headers) {
    headers.set("ngrok-skip-browser-warning", "any");
    return headers;
  },
  paramsSerializer: (params) => {
    return new URLSearchParams(params).toString().replace(/\+/g, "%20");
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  console.log(result.error, "Pusat");

  if (result.error?.status && result.error?.originalStatus >= 400) {
    const { status, data } = result.error;
    // you can customize the message however you like:
    const msg =
      // if your backend returns { message: "..." }:
      (typeof data === "object" && (data as any).message) ||
      `Request failed with status ${status}`;
    toast.error(msg);
  }
  if (result.error?.status === 401) {
    api.dispatch(auth_LOGOUT());
  }
  return result;
};

export const emptySplitApi = createApi({
  reducerPath: "emptyApi",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
