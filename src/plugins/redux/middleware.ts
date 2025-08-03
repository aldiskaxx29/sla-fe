// Redux Toolkit
import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";

// Utils
import { notificationUtils_open } from "@/app/utils/notification.utils";

// Interfaces
import { IApiResponseError } from "@/app/interfaces/app-api.interface";

const middleware_renderGenericError = (errorType: string): string => {
  if (errorType === "FETCH_ERROR") {
    return "Internal Server Error";
  }
  return "";
};

/**
 * @description Handle error in server
 *
 * @return {Middleware} Redux Toolkit Middlware
 */
export const middleware_error: Middleware = () => (next) => (action) => {
  // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!
  if (isRejectedWithValue(action)) {
    const _action = action as {
      payload: {
        status: string | number;
        data: IApiResponseError;
        error?: string;
      };
    };
    const {
      payload: { data, error },
    } = _action;
    const GENERIC_ERROR = middleware_renderGenericError(
      _action.payload.status as string
    );
    const BEMessage = data?.results?.pop()?.message;
    const message =
      BEMessage || GENERIC_ERROR || error || "Terjadi Kesalahan Di Server";

    notificationUtils_open("error", { message, key: "updatable" });
  }

  return next(action);
};
