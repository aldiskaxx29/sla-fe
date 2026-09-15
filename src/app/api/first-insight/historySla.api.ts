import type { HistorySlaResponse } from "@/app/types/first-insight/historySla.types";

import { HISTORY_SLA_DUMMY } from "./historySla.dummy";

const DUMMY_DELAY = 400;

export const getHistorySla = (signal?: AbortSignal) =>
  new Promise<HistorySlaResponse>((resolve, reject) => {
    const timer = setTimeout(
      () => resolve({ status: true, data: HISTORY_SLA_DUMMY }),
      DUMMY_DELAY,
    );

    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
