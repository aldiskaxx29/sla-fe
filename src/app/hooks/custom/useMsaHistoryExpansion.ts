import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getMsaHistory, msaKeys } from "@/app/api";

import type { MsaRow } from "@/app/types/msa/msa.types";

const STALE_TIME = 5 * 60 * 1000;

const unwrapRows = (response: unknown): MsaRow[] => {
  if (Array.isArray(response)) return response as MsaRow[];

  const record = response as { data?: unknown } | null;

  if (Array.isArray(record?.data)) return record.data as MsaRow[];

  const nested = (record?.data as { data?: unknown } | undefined)?.data;

  return Array.isArray(nested) ? (nested as MsaRow[]) : [];
};

/**
 * Drill-down tabel MONTHLY DATA SLA memakai endpoint history (bukan endpoint
 * WISA), dengan level `region` untuk baris parameter dan `witel` untuk region.
 */
export const useMsaHistoryExpansion = (treg: string, filter?: string) => {
  const queryClient = useQueryClient();

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [childrenByKey, setChildrenByKey] = useState<Record<string, MsaRow[]>>(
    {},
  );
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const reset = useCallback(() => {
    setExpandedKeys([]);
    setChildrenByKey({});
    setLoadingKey(null);
  }, []);

  const toggleRow = useCallback(
    async (row: MsaRow, key: string) => {
      /** Baris level 0 (parameter) menurunkan region, region menurunkan witel. */
      const isParent = Boolean(row.main_parent) || !row.parent;

      if (expandedKeys.includes(key)) {
        setExpandedKeys((current) => current.filter((item) => item !== key));
        return;
      }

      setExpandedKeys((current) => [...current, key]);

      if (childrenByKey[key]) return;

      setLoadingKey(key);

      try {
        const parameter = String(row.parameter ?? "").toLowerCase();
        const params = isParent
          ? {
              kpi: parameter,
              treg,
              filter,
              level: "region" as const,
              type: "msa",
            }
          : {
              kpi: String(row.mini_parameter ?? "")
                .replace(/%20/g, " ")
                .toLowerCase(),
              region: String(row.parameter ?? ""),
              treg,
              filter,
              level: "witel" as const,
              type: "msa",
            };

        const response = await queryClient.fetchQuery({
          queryKey: msaKeys.history({ ...params, expand: key }),
          staleTime: STALE_TIME,
          queryFn: ({ signal }) => getMsaHistory(params, signal),
        });

        const children = unwrapRows(response).map((child, index) => ({
          ...child,
          mini_parameter: isParent ? parameter : row.mini_parameter,
          parent: isParent || undefined,
          identIndex: child.identIndex ?? `${key}_${isParent ? "reg" : "witel"}_${index}`,
        }));

        setChildrenByKey((current) => ({ ...current, [key]: children }));
      } catch {
        setExpandedKeys((current) => current.filter((item) => item !== key));
      } finally {
        setLoadingKey(null);
      }
    },
    [childrenByKey, expandedKeys, filter, queryClient, treg],
  );

  return { expandedKeys, childrenByKey, loadingKey, toggleRow, reset };
};
