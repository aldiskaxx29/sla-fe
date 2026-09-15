import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import {
  authKeys,
  getAuthUserDetail,
  postLogin,
  postLogin2fa,
  postLogout,
  postResendOtpEmail,
  postResetToken,
  postVerifyOtpEmail,
} from "@/app/api";
import { emptySplitApi } from "@/app/redux/app.rtx";

import type { AuthUserId } from "@/app/types/auth/auth.types";

import {
  clearAuthData,
  pickUserFromDetail,
  setAuthData,
} from "@/app/utils/auth.utils";

export const useLoginMutation = () => useMutation({ mutationFn: postLogin });

export const useVerifyOtpEmailMutation = () =>
  useMutation({ mutationFn: postVerifyOtpEmail });

export const useResendOtpEmailMutation = () =>
  useMutation({ mutationFn: postResendOtpEmail });

export const useResetTwoFactorMutation = () =>
  useMutation({ mutationFn: postResetToken });

export const useLogin2faMutation = () =>
  useMutation({
    mutationFn: postLogin2fa,
    onSuccess: setAuthData,
  });

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      clearAuthData();
      dispatch(emptySplitApi.util.resetApiState());
      queryClient.removeQueries();
    },
  });
};

export const useAuthUserDetailQuery = (id?: AuthUserId) =>
  useQuery({
    queryKey: authKeys.userDetail(id),
    enabled: Boolean(id),
    staleTime: 0,
    gcTime: 0,
    retry: false,
    queryFn: ({ signal }) => getAuthUserDetail(id as AuthUserId, signal),
    select: pickUserFromDetail,
  });
