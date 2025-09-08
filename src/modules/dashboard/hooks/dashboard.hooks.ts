import {
  useLazyCNPApi_fetchDataQuery,
  useLazySCApi_fethcDataQuery,
  useLazyTrendApi_fetchDataQuery,
  useLazySiteApi_fetchDataQuery,
  useLazyCNOP_region_fetchDataQuery,
  useLazyDetail_ticketQuery,
  useLazyChart_monitoringQuery,
  useLazyDetail_siteQuery,
  useLazyHistory_dataQuery,
  useLazyWitel_dataQuery,
  useLazyModal_detailQuery,
  useLazyDashboard_complyQuery,
} from "../rtk/dashboard.rtk";

const useDashboard = () => {
  const [getSC, { isLoading: isLoadingSC, isError, isSuccess, data: dataSC }] =
    useLazySCApi_fethcDataQuery();

  const [
    getTrend,
    {
      isLoading: isLoadingTrend,
      isError: isErrorTrend,
      isSuccess: isSuccessTrend,
      data: dataTrend,
    },
  ] = useLazyTrendApi_fetchDataQuery();

  const [
    getSite,
    {
      isLoading: isLoadingSite,
      isError: isErrorSite,
      isSuccess: isSuccessSite,
      data: dataSite,
    },
  ] = useLazySiteApi_fetchDataQuery();

  const [
    getCNP,
    {
      isLoading: isLoadingCNP,
      isError: isErrorCNP,
      isSuccess: isSuccessCNP,
      data: dataCNP,
    },
  ] = useLazyCNPApi_fetchDataQuery();
  const [
    getDetailCNP,
    {
      isLoading: isLoadingDetailCNP,
      isError: isErrorDetailCNP,
      isSuccess: isSuccessDetailCNP,
      data: dataDetailCNP,
    },
  ] = useLazyCNOP_region_fetchDataQuery();
  const [
    getDetailTicket,
    {
      isLoading: isLoadingDetailTicket,
      isError: isErrorDetailTicket,
      isSuccess: isSuccessDetailTicket,
      data: dataDetailTicket,
    },
  ] = useLazyDetail_ticketQuery();
  const [
    getDetailSite,
    {
      isLoading: isLoadingDetailSite,
      isError: isErrorDetailSite,
      isSuccess: isSuccessDetailSite,
      data: dataDetailSite,
    },
  ] = useLazyDetail_siteQuery();
  const [
    getChartMonitoring,
    {
      isLoading: isLoadingChartMonitoring,
      isError: isErrorChartMonitoring,
      isSuccess: isSuccessChartMonitoring,
      data: dataChartMonitoring,
    },
  ] = useLazyChart_monitoringQuery();
  const [
    getHistoryData,
    {
      isLoading: isLoadingHistoryData,
      isError: isErrorHistoryData,
      isSuccess: isSuccessHistoryData,
      data: dataHistoryData,
    },
  ] = useLazyHistory_dataQuery();
  const [
    getWitel,
    {
      isLoading: isLoadingWitel,
      isError: isErrorWitel,
      isSuccess: isSuccessWitel,
      data: dataWitel,
    },
  ] = useLazyWitel_dataQuery();
  const [
    getModalDetail,
    {
      isLoading: isLoadingModalDetail,
      isError: isErrorModalDetail,
      isSuccess: isSuccessModalDetail,
      data: dataModalDetail,
    },
  ] = useLazyModal_detailQuery();
  const [
    getComply,
    {
      isLoading: isLoadingComply,
      isError: isErrorComply,
      isSuccess: isSuccessComply,
      data: dataComply,
    },
  ] = useLazyDashboard_complyQuery();

  return {
    getSC,
    isLoadingSC,
    isError,
    isSuccess,
    dataSC,
    getTrend,
    dataTrend,
    isErrorTrend,
    isLoadingTrend,
    isSuccessTrend,
    getSite,
    dataSite,
    isErrorSite,
    isLoadingSite,
    isSuccessSite,
    getCNP,
    isLoadingCNP,
    isErrorCNP,
    isSuccessCNP,
    dataCNP,
    getDetailCNP,
    isLoadingDetailCNP,
    isErrorDetailCNP,
    isSuccessDetailCNP,
    dataDetailCNP,
    getDetailTicket,
    isLoadingDetailTicket,
    isErrorDetailTicket,
    isSuccessDetailTicket,
    dataDetailTicket,
    getDetailSite,
    isLoadingDetailSite,
    isErrorDetailSite,
    isSuccessDetailSite,
    dataDetailSite,
    getChartMonitoring,
    isLoadingChartMonitoring,
    isErrorChartMonitoring,
    isSuccessChartMonitoring,
    dataChartMonitoring,
    getHistoryData,
    isLoadingHistoryData,
    isErrorHistoryData,
    isSuccessHistoryData,
    dataHistoryData,
    getWitel,
    isLoadingWitel,
    isErrorWitel,
    isSuccessWitel,
    dataWitel,
    getModalDetail,
    isLoadingModalDetail,
    isErrorModalDetail,
    isSuccessModalDetail,
    dataModalDetail,
    getComply,
    isLoadingComply,
    isErrorComply,
    isSuccessComply,
    dataComply,
  };
};

export { useDashboard };
