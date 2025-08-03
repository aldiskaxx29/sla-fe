import {
  useLazySite_fetchDataQuery,
  useLazyReport_site_fetchDataQuery,
  useLazyDetail_site_fetchDataQuery,
  useSave_siteMutation,
} from "../rtk/site.rtk";

const useSite = () => {
  const [getSite, { isLoading: isLoadingSite, data: dataSite }] =
    useLazySite_fetchDataQuery();
  const [
    getReportSite,
    { isLoading: isLoadingReportSite, data: dataReportSite },
  ] = useLazyReport_site_fetchDataQuery();
  const [
    getDetailSite,
    { isLoading: isLoadingDetailSite, data: dataDetailSite },
  ] = useLazyDetail_site_fetchDataQuery();
  const [
    saveSite,
    {
      isLoading: isLoadingSaveSite,
      data: dataSaveSite,
      isSuccess: successSaveSite,
    },
  ] = useSave_siteMutation();
  return {
    getSite,
    dataSite,
    isLoadingSite,
    getReportSite,
    dataReportSite,
    isLoadingReportSite,
    getDetailSite,
    dataDetailSite,
    isLoadingDetailSite,
    saveSite,
    dataSaveSite,
    isLoadingSaveSite,
    successSaveSite,
  };
};

export { useSite };
