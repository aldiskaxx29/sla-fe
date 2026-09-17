import { LuTriangleAlert } from "react-icons/lu";

import { Skeleton } from "@/app/components/atoms";

import type { MsaComplyItem } from "@/app/types/msa/msa.types";

interface MsaPredictionPanelProps {
  items: MsaComplyItem[];
  loading?: boolean;
}

/**
 * Ringkasan parameter yang berpotensi tidak comply. Backend mengirim beberapa
 * kategori, yang ditampilkan saat ini hanya kategori peringatan (indeks 1).
 */
export function MsaPredictionPanel({
  items,
  loading = false,
}: MsaPredictionPanelProps) {
  const warning = items[1];

  if (loading) {
    return (
      <div className="w-[260px] rounded-xl bg-[#fefce8] px-4 py-3">
        <Skeleton height={40} />
      </div>
    );
  }

  if (!warning) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#fefce8] px-4 py-3">
      <LuTriangleAlert className="size-9 shrink-0 text-[#ea8c00]" />

      <div>
        <p className="text-sm font-bold text-[#0f172a]">{warning.parameter}</p>
        <p className="text-base text-[#4b465c]">
          {warning.jumlah} Parameter
        </p>
      </div>
    </div>
  );
}
