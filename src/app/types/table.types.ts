// React
import type { ReactNode } from "react";

/** Filter checkbox pada kolom; nilainya dikirim ke server. */
export interface ColumnCheckboxFilter {
  type: "checkbox";
  /** Field yang dipakai backend, mis. `region_tsel`. */
  field: string;
  options: string[];
}

/** Kotak pencarian bebas pada kolom. */
export interface ColumnSearchFilter {
  type: "search";
  field: string;
}

export type ColumnFilterConfig = ColumnCheckboxFilter | ColumnSearchFilter;

export interface TableColumn<T> {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number;
  align?: "left" | "center" | "right";
  /** Kolom dipatok di kanan saat tabel di-scroll horizontal. */
  fixedRight?: boolean;
  /** Isi sel boleh turun baris; default dipotong satu baris. */
  wrap?: boolean;
  filter?: ColumnFilterConfig;
  render?: (value: unknown, row: T, index: number) => ReactNode;
}
