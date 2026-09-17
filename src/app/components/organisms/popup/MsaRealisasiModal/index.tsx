import { useMemo } from "react";

import DataTable from "@/app/components/molecules/DataTable";
import type { DataTableColumn } from "@/app/components/molecules/DataTable";
import Modal from "@/app/components/molecules/Modal";

import type { MsaRealisasiData, MsaRow } from "@/app/types/msa/msa.types";
import {
  getWeekCountOfMonth,
  MONTH_SHORT_LABELS,
} from "@/app/utils/msa.utils";
import { findActualWeekNumber } from "@/app/utils/msaColumns.utils";

interface MsaRealisasiModalProps {
  open: boolean;
  kpi: string;
  monthNum: number;
  data?: MsaRealisasiData;
  loading?: boolean;
  error?: boolean;
  showActualWeeks?: boolean;
  onWeekClick: (
    row: MsaRow,
    weekNum: number,
    stage: "before" | "after",
  ) => void;
  onClose: () => void;
}

/** Nilai minggu bisa tersimpan dengan atau tanpa akhiran minggu-tahun. */
const readWeekValue = (row: MsaRow, monthNum: number, weekNum: number) => {
  const direct = row[`ach_${monthNum}_${weekNum}`];

  if (direct !== undefined && direct !== null && direct !== "") return direct;

  const pattern = new RegExp(`^ach_${monthNum}_${weekNum}_\\d+$`);
  const foundKey = Object.keys(row).find((key) => pattern.test(key));

  return foundKey ? row[foundKey] : null;
};

export function MsaRealisasiModal({
  open,
  kpi,
  monthNum,
  data,
  loading = false,
  error = false,
  showActualWeeks = false,
  onWeekClick,
  onClose,
}: MsaRealisasiModalProps) {
  const isPacketloss =
    kpi.toLowerCase().includes("packetloss") &&
    kpi.toLowerCase().includes("ran to core");

  const buildColumns = useMemo(
    () =>
      (rows: MsaRow[], stage: "before" | "after"): DataTableColumn<MsaRow>[] => {
        const weekCount = getWeekCountOfMonth(monthNum);

        const weekColumns: DataTableColumn<MsaRow>[] = Array.from({
          length: weekCount,
        }).map((_, index) => {
          const weekNum = index + 1;
          const actualWeek = findActualWeekNumber(rows, monthNum, weekNum);

          return {
            key: `ach_${monthNum}_${weekNum}`,
            title:
              showActualWeeks && actualWeek ? `W${actualWeek}` : `W${weekNum}`,
            render: (row) => {
              const value = readWeekValue(row, monthNum, weekNum);

              if (value === null || value === undefined || value === "") {
                return <span className="text-[#94a3b8]">-</span>;
              }

              const numeric = Number(value);
              const target = Number(row.target);
              const hasTone =
                Number.isFinite(numeric) && Number.isFinite(target);
              const isGood = isPacketloss
                ? numeric <= target
                : numeric >= target;

              return (
                <button
                  type="button"
                  onClick={() => onWeekClick(row, weekNum, stage)}
                  className={`cursor-pointer font-semibold hover:underline ${
                    !hasTone
                      ? "text-[#2563eb]"
                      : isGood
                        ? "text-[#16a34a]"
                        : "text-[#dc2626]"
                  }`}
                >
                  {String(value)}
                </button>
              );
            },
          };
        });

        return [
          {
            key: "no",
            title: "No.",
            width: 56,
            render: (_row, index) => index + 1,
          },
          {
            key: "region_tsel",
            title: "Reg",
            render: (row) => String(row.region_tsel ?? "-"),
          },
          {
            key: "target",
            title: "Target",
            render: (row) => String(row.target ?? "-"),
          },
          ...weekColumns,
          {
            key: `ach_fm_${monthNum}`,
            title: MONTH_SHORT_LABELS[monthNum] ?? String(monthNum),
            render: (row) => {
              const value = row[`ach_fm_${monthNum}`];

              if (value === null || value === undefined || value === "") {
                return <span className="text-[#94a3b8]">-</span>;
              }

              const numeric = Number(value);
              const target = Number(row.target);

              if (!Number.isFinite(numeric) || !Number.isFinite(target)) {
                return String(value);
              }

              const isGood = isPacketloss
                ? numeric <= target
                : numeric >= target;

              return (
                <span
                  className={`font-semibold ${isGood ? "text-[#16a34a]" : "text-[#dc2626]"}`}
                >
                  {String(value)}
                </span>
              );
            },
          },
        ];
      },
    [isPacketloss, monthNum, onWeekClick, showActualWeeks],
  );

  const beforeRows = data?.before ?? [];
  const afterRows = data?.after ?? [];

  return (
    <Modal open={open} onClose={onClose} width={1200} bodyClassName="p-6">
      <header className="mb-4 pr-8">
        <h2 className="text-lg font-semibold text-[#0f172a]">
          Achievement - {kpi.toUpperCase()}
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 text-center text-sm font-bold text-[#0f172a]">
            Realisasi Before
          </h3>
          <DataTable
            columns={buildColumns(beforeRows, "before")}
            rows={beforeRows}
            loading={loading}
            error={error}
            minWidth={520}
            maxHeightClassName="max-h-[60vh]"
            rowKey={(row, index) => String(row.region_tsel ?? index)}
          />
        </section>

        <section>
          <h3 className="mb-3 text-center text-sm font-bold text-[#0f172a]">
            Realisasi After
          </h3>
          <DataTable
            columns={buildColumns(afterRows, "after")}
            rows={afterRows}
            loading={loading}
            error={error}
            minWidth={520}
            maxHeightClassName="max-h-[60vh]"
            rowKey={(row, index) => String(row.region_tsel ?? index)}
          />
        </section>
      </div>
    </Modal>
  );
}
