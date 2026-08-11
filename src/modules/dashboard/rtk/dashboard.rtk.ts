import { emptySplitApi } from "@/app/redux/app.rtx";

const buildPath = (base, level) => {
  if (!level) return base;
  const cleanLevel = level.replace(/^\//, ''); // Hapus slash di depan
  return `${base}/${cleanLevel}`;
};

const getAreaValue = (treg: string) => {
  if (!treg || treg === "all") return "ALL";
  const match = treg.match(/treg(\d+)/i);
  if (match) {
    return `AREA ${match[1]}`;
  }
  return treg.toUpperCase();
};

export const dashboardApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    SCApi_fethcData: builder.query({
      query: (payload) => {
        const area = getAreaValue(payload?.query?.treg);
        return {
          method: "GET",
          url: "achievement-wisa/not-comply/nation",
          params: {
            tahun: payload?.query?.tahun ?? new Date().getFullYear(),
            area: area,
          },
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
      keepUnusedDataFor: 0,
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
        const area = getAreaValue(payload?.query?.treg);
        return {
          method: "GET",
          url: "achievement-wisa/not-comply/region",
          params: {
            tahun: payload?.query?.tahun ?? new Date().getFullYear(),
            parameter_key: payload?.query?.parameter_key ?? payload?.query?.parameter,
            area: area,
          },
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
          url: buildPath("dashboard/history/weekly", payload?.query.level),
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    witel_data: builder.query({
      query: (payload) => {
        const area = getAreaValue(payload?.query?.treg);
        const params: any = {
          tahun: payload?.query?.tahun ?? new Date().getFullYear(),
          parameter_key: payload?.query?.parameter_key ?? payload?.query?.parameter,
          region: payload?.query?.region,
          area: area,
        };
        if (payload?.query?.wilayah) {
          params.wilayah = payload.query.wilayah;
        }
        return {
          method: "GET",
          url: "achievement-wisa/not-comply/witel",
          params,
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
    dashboard_comply: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/parameter/comply",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    detailsite_notclear: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "detailsite/notclear",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    detailsite_notclear_week: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/site/not-clear/week",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    weeklyMonth: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "weeklyMonth",
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
  useLazyModal_detailQuery,
  useLazyDashboard_complyQuery,
  useLazyDetailsite_notclearQuery,
  useLazyDetailsite_notclear_weekQuery,
  useLazyWeeklyMonthQuery,
} = dashboardApi;
