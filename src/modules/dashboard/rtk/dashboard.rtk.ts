import { emptySplitApi } from "@/app/redux/app.rtx";

export const dashboardApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    SCApi_fethcData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/monthly/nation",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
      keepUnusedDataFor: 0
    }),
    TrendApi_fetchData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/weekly/trend",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    CNPApi_fetchData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/region/monthly/msa/cnop",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
      keepUnusedDataFor: 0,
    }),
    SiteApi_fetchData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/siteProfilling",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    CNOP_region_fetchData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/region/monthly/detail",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    detail_ticket: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/tiketProfilling",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    detail_site: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/detail/site/profilling",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    chart_monitoring: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/region/monthly/trend",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    history_data: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/history/weekly",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    witel_data: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/witel/monthly/detail",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    modal_detail: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/detail/site/msa/cnop",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useLazySCApi_fethcDataQuery,
  useLazyTrendApi_fetchDataQuery,
  useLazyCNPApi_fetchDataQuery,
  useLazySiteApi_fetchDataQuery,
  useLazyCNOP_region_fetchDataQuery,
  useLazyDetail_ticketQuery,
  useLazyChart_monitoringQuery,
  useLazyDetail_siteQuery,
  useLazyHistory_dataQuery,
  useLazyWitel_dataQuery,
  useLazyModal_detailQuery
} = dashboardApi;
