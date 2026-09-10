import { emptySplitApi } from "@/app/redux/app.rtx";

import type {
  SlaWsaResponse,
  YearWeekResponse,
} from "@/modules/fbb/types/sla.types";

export const fbbApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    fbbSlaWsa: builder.query<SlaWsaResponse, { yearweek?: string }>({
      query: ({ yearweek }) => ({
        method: "GET",
        url: "fbb/sla/wsa",
        params: yearweek ? { "filter[yearweek]": yearweek } : {},
      }),
    }),
    fbbYearWeek: builder.query<YearWeekResponse, void>({
      query: () => ({
        method: "GET",
        url: "onx-dashboard/yearweek",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useFbbSlaWsaQuery, useFbbYearWeekQuery } = fbbApi;
