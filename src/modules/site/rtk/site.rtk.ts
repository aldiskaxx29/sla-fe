import { emptySplitApi } from "@/app/redux/app.rtx";

export const siteApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    report_site_fetchData: builder.query({
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
      keepUnusedDataFor: 0,
    }),
    clear_data_fetchData: builder.query({
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
    download_excel_evidence: builder.query({
      query: ({ query }) => {
        return {
          method: "GET",
          url: "/rekonsiliasi/evidence",
          params: query,
          responseHandler: (response) => response.blob(),
          cache: "no-cache",
        };
      },
    }),
    getReportSupportUpgradeCap: builder.query({
      query: ({ query }) => ({
        url: "/report-support-needed/getAll/upgrade/cap",
        params: query,
      }),
    }),
    getReportSupportUpgradeNodeb: builder.query({
      query: ({ query }) => ({
        url: "/report-support-needed/getAll/port/nodeb",
        params: query,
      }),
    }),
    getReportSupportUpgradeQe: builder.query({
      query: ({ query }) => ({
        url: "/report-support-needed/getAll/qe",
        params: query,
      }),
    }),
    getReportSupportUpgradeTsel: builder.query({
      query: ({ query }) => ({
        url: "/report-support-needed/getAll/tsel",
        params: query,
      }),
    }),
    getDetailRegion: builder.query({
      query: ({ query }) => ({
        url: "/report-support-needed/getAll/upgrade/cap/detailRegion",
        params: query,
      }),
    }),
    getDetailSite: builder.query({
      query: ({ query }) => ({
        url: "/report-support-needed/getAll/upgrade/cap/detailSite",
        params: query,
      }),
    }),
  }),
});

export const {
  useLazyReport_site_fetchDataQuery,
  useLazyClear_data_fetchDataQuery,
  useLazyDownload_excel_evidenceQuery,
  useLazyGetReportSupportUpgradeCapQuery,
  useLazyGetReportSupportUpgradeNodebQuery,
  useLazyGetReportSupportUpgradeQeQuery,
  useLazyGetReportSupportUpgradeTselQuery,
  useLazyGetDetailRegionQuery,
  useLazyGetDetailSiteQuery,
} = siteApi;
