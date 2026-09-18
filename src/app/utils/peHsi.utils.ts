import type { PeHsiPath, PeHsiPivotItem } from "@/app/types/network/peHsi.types";

/**
 * Field `status` pada pivot berisi daftar gateway yang tidak achieve, dipisah
 * koma (contoh: `"BTC, JT2"`). Kosong berarti semua gateway achieve.
 */
export const getDegradedPaths = (item: Pick<PeHsiPivotItem, "status">) =>
  new Set(
    String(item.status ?? "")
      .split(",")
      .map((path) => path.trim().toUpperCase())
      .filter(Boolean) as PeHsiPath[],
  );
