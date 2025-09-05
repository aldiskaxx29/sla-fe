import { emptySplitApi } from "@/app/redux/app.rtx";

export const approverApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    approver_fetchData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "exclude/getAll",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
      keepUnusedDataFor: 0,
    }),
    approver_detailData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "exclude/getOne",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
      keepUnusedDataFor: 0,
    }),
    saveApprover: builder.mutation({
      query: (payload) => {
        return {
          method: "POST",
          url: "exclude/save",
          params: payload?.query,
        };
      },
    }),
  }),
});

export const {
  useLazyApprover_fetchDataQuery,
  useSaveApproverMutation,
  useLazyApprover_detailDataQuery,
} = approverApi;
