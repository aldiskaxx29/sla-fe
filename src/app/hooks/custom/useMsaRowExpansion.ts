import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getMsaRegion, getMsaWitel, msaKeys } from "@/app/api";

import type { MsaRow } from "@/app/types/msa/msa.types";
import {
  isWilayahRow,
  mapMsaRegionRows,
  mapMsaWitelRows,
} from "@/app/utils/msa.utils";

const STALE_TIME = 5 * 60 * 1000;

const parameterOf = (row: MsaRow) =>
  String(row.mini_parameter ?? row.parameter ?? "").toLowerCase();

interface UseMsaRowExpansionOptions {
  treg: string;
  year?: number;
}

/**
 * Tabel MSA memuat anak baris secara bertahap (nation → region → witel).
 * Hasil fetch disimpan per `identIndex` supaya baris yang sudah dibuka tidak
 * perlu diambil ulang saat ditutup lalu dibuka lagi.
 */
export const useMsaRowExpansion = ({
  treg,
  year,
}: UseMsaRowExpansionOptions) => {
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

  const fetchChildren = useCallback(
    async (row: MsaRow, key: string): Promise<MsaRow[]> => {
      const parameter = parameterOf(row);

      /** Baris teratas belum punya flag `parent`, jadi ia menurunkan region. */
      if (row.main_parent || !row.parent) {
        const params = { treg, year, parameter };
        const response = await queryClient.fetchQuery({
          queryKey: msaKeys.region(params),
          staleTime: STALE_TIME,
          queryFn: ({ signal }) => getMsaRegion(params, signal),
        });

        return mapMsaRegionRows(response?.data, parameter).map(
          (child, index) => ({
            ...child,
            mini_parameter: parameter,
            identIndex: child.identIndex ?? `${key}_reg_${index}`,
          }),
        );
      }

      const region = String(row.parameter ?? "");
      const params = {
        treg,
        year,
        parameter,
        region,
        wilayah: row.wilayah as string | undefined,
      };
      const response = await queryClient.fetchQuery({
        queryKey: msaKeys.witel(params),
        staleTime: STALE_TIME,
        queryFn: ({ signal }) => getMsaWitel(params, signal),
      });

      return mapMsaWitelRows(response?.data, { parameter, region }).map(
        (child, index) => ({
          ...child,
          mini_parameter: parameter,
          is_level_4: !isWilayahRow(region),
          identIndex: child.identIndex ?? `${key}_witel_${index}`,
        }),
      );
    },
    [queryClient, treg, year],
  );

  const toggleRow = useCallback(
    async (row: MsaRow, key: string) => {
      if (expandedKeys.includes(key)) {
        setExpandedKeys((current) => current.filter((item) => item !== key));
        return;
      }

      setExpandedKeys((current) => [...current, key]);

      if (childrenByKey[key]) return;

      setLoadingKey(key);

      try {
        const children = await fetchChildren(row, key);

        setChildrenByKey((current) => ({ ...current, [key]: children }));
      } catch {
        setExpandedKeys((current) => current.filter((item) => item !== key));
      } finally {
        setLoadingKey(null);
      }
    },
    [childrenByKey, expandedKeys, fetchChildren],
  );

  return {
    expandedKeys,
    childrenByKey,
    loadingKey,
    toggleRow,
    reset,
  };
};
