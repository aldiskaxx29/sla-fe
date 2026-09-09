import {
  useLazyReport_site_fetchDataQuery,
  useLazyClear_data_fetchDataQuery,
} from "../rtk/site.rtk";

const useSite = () => {
  const [
    getReportSite,
    { isLoading: isLoadingReportSite, data: dataReportSite },
  ] = useLazyReport_site_fetchDataQuery();
  const [
    getClearData,
    {
      isLoading: isLoadingClearData,
      data: dataClearData,
      isSuccess: successClearData,
    },
  ] = useLazyClear_data_fetchDataQuery();

  return {
    getReportSite,
    dataReportSite,
    isLoadingReportSite,
    getClearData,
    dataClearData,
    isLoadingClearData,
    successClearData,
  };
};

export { useSite };
