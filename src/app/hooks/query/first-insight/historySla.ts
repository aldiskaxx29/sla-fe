import { useQuery } from "@tanstack/react-query";

import { firstInsightKeys, getHistorySla } from "@/app/api";

const DATA_STALE_TIME = 5 * 60 * 1000;

export const useHistorySlaQuery = () =>
  useQuery({
    queryKey: firstInsightKeys.historySla(),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) => getHistorySla(signal),
    select: (response) => response.data,
  });
