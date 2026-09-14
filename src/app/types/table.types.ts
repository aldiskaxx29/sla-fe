import type { ReactNode } from "react";

export interface ColumnCheckboxFilter {
  type: "checkbox";
  field: string;
  options: string[];
}

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
  fixedRight?: boolean;
  wrap?: boolean;
  filter?: ColumnFilterConfig;
  render?: (value: unknown, row: T, index: number) => ReactNode;
}
