import { emptySplitApi } from "@/app/redux/app.rtx";

export const userApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUser_fetchData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "user",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useLazyGetAllUser_fetchDataQuery } = userApi;
