import type { RekonsiliasiListParams } from "@/app/types/reconsiliation/rekonsiliasi.types";

export const rekonsiliasiKeys = {
  all: ["rekonsiliasi"] as const,
  yearWeek: () => [...rekonsiliasiKeys.all, "year-week"] as const,
  lists: () => [...rekonsiliasiKeys.all, "list"] as const,
  list: (params: RekonsiliasiListParams) =>
    [...rekonsiliasiKeys.lists(), params] as const,
};
