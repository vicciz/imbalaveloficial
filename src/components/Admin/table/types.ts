import { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  title: string;

  width?: string;

  align?: "left" | "center" | "right";

  render?: (
    row: T
  ) => ReactNode;
}

export interface DataTableProps<T> {
  columns: TableColumn<T>[];

  data: T[];

  loading?: boolean;

  emptyMessage?: string;
}