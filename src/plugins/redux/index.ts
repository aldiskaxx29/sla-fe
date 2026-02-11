import { configureStore } from "@reduxjs/toolkit";
import { middleware_error } from "./middleware";
import { emptySplitApi } from "@/app/redux/app.rtx";
import { reducerRedux_reducers as reducer } from "./reducer";

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(middleware_error, emptySplitApi.middleware),
});
