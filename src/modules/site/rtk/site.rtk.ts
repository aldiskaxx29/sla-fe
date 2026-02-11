import { emptySplitApi } from "@/app/redux/app.rtx";

export const siteApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    site_fetchData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/rekonsiliasi",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
      keepUnusedDataFor: 0,
    }),
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
    detail_site_fetchData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/rekonsiliasi/detail",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
      keepUnusedDataFor: 0,
    }),
    save_site: builder.mutation({
      query: (formData) => {
        return {
          method: "POST",
          url: "dashboard/rekonsiliasi/save",
          body: formData,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
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
    download_template: builder.query({
      query: ({ query }) => {
        return {
          method: "GET",
          url: "/rekonsiliasi/download-template",
          params: query,
          responseHandler: (response) => response.blob(),
          cache: "no-cache",
        };
      },
    }),
    download_evidance: builder.query({
      query: ({ query }) => {
        return {
          method: "GET",
          url: "/download/evidence",
          params: query,
          responseHandler: (response) => response.blob(),
          cache: "no-cache",
        };
      },
    }),
    upload_template: builder.mutation({
      query: ({ query, body }) => ({
        url: "/dashboard/rekonsiliasi/import",
        method: "POST",
        params: query,
        body,
      }),
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
  useLazySite_fetchDataQuery,
  useLazyReport_site_fetchDataQuery,
  useLazyDetail_site_fetchDataQuery,
  useLazyClear_data_fetchDataQuery,
  useLazyDownload_templateQuery,
  useSave_siteMutation,
  useUpload_templateMutation,
  useLazyDownload_evidanceQuery,
  useLazyGetReportSupportUpgradeCapQuery,
  useLazyGetReportSupportUpgradeNodebQuery,
  useLazyGetReportSupportUpgradeQeQuery,
  useLazyGetReportSupportUpgradeTselQuery,
  useLazyGetDetailRegionQuery,
  useLazyGetDetailSiteQuery,
} = siteApi;
