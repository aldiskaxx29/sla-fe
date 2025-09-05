import { emptySplitApi } from "@/app/redux/app.rtx";

export const userApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (payload) => {
        return {
          method: "POST",
          url: "/users/save",
          body: payload,
        };
      },
    }),
    getAllUser_fetchData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "/users/getAll",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
      keepUnusedDataFor: 0,
    }),
    deleteUser: builder.mutation({
      query: (payload) => {
        return {
          method: "Delete",
          url: "/users/delete",
          params: payload,
        };
      },
    }),
  }),
});

export const {
  useLazyGetAllUser_fetchDataQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
} = userApi;
