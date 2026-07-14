"use client";

import {
  DataTableProps,
  TableColumn,
} from "./types";

interface Props<T>
  extends DataTableProps<T> {}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "Nenhum registro encontrado.",
}: Props<T>) {
  if (loading) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-12
          text-center
          text-slate-500
        "
      >
        Carregando...
      </div>
    );
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
      "
    >
      <div className="overflow-x-auto">
        <table className="w-full">

          {/* Cabeçalho */}

          <thead className="bg-slate-50">

            <tr>

              {columns.map((column) => (

                <th
                  key={column.key}
                  style={{
                    width: column.width,
                  }}
                  className={`
                    border-b
                    border-slate-200
                    px-6
                    py-4
                    text-sm
                    font-semibold
                    text-slate-700

                    ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                        ? "text-right"
                        : "text-left"
                    }
                  `}
                >
                  {column.title}
                </th>

              ))}

            </tr>

          </thead>

          {/* Corpo */}

          <tbody>

            {data.length === 0 ? (

              <tr>

                <td
                  colSpan={columns.length}
                  className="
                    px-6
                    py-16
                    text-center
                    text-slate-500
                  "
                >
                  {emptyMessage}
                </td>

              </tr>

            ) : (

              data.map((row, index) => (

                <tr
                  key={index}
                  className="
                    border-b
                    border-slate-100
                    transition-colors
                    hover:bg-slate-50
                  "
                >
                  {columns.map((column) => (

                    <td
                      key={column.key}
                      className={`
                        px-6
                        py-4

                        ${
                          column.align === "center"
                            ? "text-center"
                            : column.align === "right"
                            ? "text-right"
                            : "text-left"
                        }
                      `}
                    >
                      {column.render
                        ? column.render(row)
                        : (row as any)[column.key]}
                    </td>

                  ))}
                </tr>

              ))

            )}

          </tbody>

        </table>
      </div>
    </div>
  );
}