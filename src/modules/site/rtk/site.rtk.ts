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
  }),
});

export const {
  useLazySite_fetchDataQuery,
  useLazyReport_site_fetchDataQuery,
  useLazyDetail_site_fetchDataQuery,
  useSave_siteMutation,
} = siteApi;
