import { useLazyGetAllUser_fetchDataQuery } from "../rtk/user.rtk";

const useUser = () => {
  const [getAllUser, { isLoading: isLoadingAllUser, data: dataAllUser }] =
    useLazyGetAllUser_fetchDataQuery();
  return {
    getAllUser,
    dataAllUser,
    isLoadingAllUser,
  };
};

export { useUser };
