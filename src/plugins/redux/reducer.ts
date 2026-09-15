import { combineReducers } from "@reduxjs/toolkit";

import auth from "@/app/redux/auth.slice";
import { dashboardApi } from "@/modules/dashboard/rtk/dashboard.rtk";

const plainReducers = {
  auth,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
};

const reducerRedux_reducers = combineReducers(plainReducers);

export { plainReducers, reducerRedux_reducers };
