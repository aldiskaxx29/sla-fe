import { useEffect, useMemo, useState } from "react";
import { LuArrowDown, LuArrowUp, LuDownload } from "react-icons/lu";

import { Button, Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";
import Modal from "@/app/components/molecules/Modal";
import Pagination from "@/app/components/molecules/Pagination";
import SearchInput from "@/app/components/molecules/SearchInput";

import type {
  DailyMonitoringSiteRow,
  PacketLossDetailKey,
  PacketLossSiteScope,
} from "@/app/types/daily-monitoring/dailyMonitoring.types";

const DEFAULT_PER_PAGE = 10;
const EXPAND_LENGTH = 40;

const COLUMN_TITLES: Record<string, string> = {
  site_id: "Site ID",
  site_name: "Site Name",
  region: "Region",
  area: "Area",
  pl: "Packet Loss",
  p5: "PL 5%",
  p15: "PL 1-5%",
};

const COLUMN_WIDTHS: Record<string, number> = {
  site_id: 150,
  site_name: 350,
  region: 120,
  area: 120,
};

const toColumnTitle = (key: string) =>
  COLUMN_TITLES[key] ?? key.replace(/_/g, " ").toUpperCase();

/** Teks panjang dipotong dengan tombol buka/tutup supaya baris tetap rapi. */
const ExpandableText = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text || text.length <= EXPAND_LENGTH) return <span>{text}</span>;

  return (
    <span>
      <span>{expanded ? text : `${text.slice(0, EXPAND_LENGTH)}... `}</span>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setExpanded(!expanded);
        }}
        className="cursor-pointer align-baseline font-medium text-[#2563eb] hover:underline"
      >
        {expanded ? "Show Less" : "Show More"}
      </button>
    </span>
  );
};

const compareValues = (left: unknown, right: unknown) => {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left ?? "").localeCompare(String(right ?? ""));
};

interface PacketLossSiteDetailModalProps {
  open: boolean;
  scope?: PacketLossSiteScope;
  value?: string;
  pl?: PacketLossDetailKey;
  rows: DailyMonitoringSiteRow[];
  loading?: boolean;
  error?: boolean;
  downloading?: boolean;
  onDownload: () => void;
  onClose: () => void;
}

export function PacketLossSiteDetailModal({
  open,
  scope,
  value,
  pl,
  rows,
  loading = false,
  error = false,
  downloading = false,
  onDownload,
  onClose,
}: PacketLossSiteDetailModalProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [sort, setSort] = useState<{ key: string; asc: boolean } | null>(null);

  useEffect(() => {
    if (!open) return;

    setSearch("");
    setPage(1);
    setSort(null);
  }, [open, scope, value, pl]);

  const columns = useMemo(() => {
    const sample = rows[0];

    if (!sample) return [];

    return Object.keys(sample).filter((key) => key !== "no" && key !== "id");
  }, [rows]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const matched = keyword
      ? rows.filter((row) =>
          Object.values(row).some((cell) =>
            String(cell ?? "")
              .toLowerCase()
              .includes(keyword),
          ),
        )
      : rows;

    if (!sort) return matched;

    return [...matched].sort((left, right) => {
      const result = compareValues(left[sort.key], right[sort.key]);

      return sort.asc ? result : -result;
    });
  }, [rows, search, sort]);

  const pagedRows = useMemo(
    () => filteredRows.slice((page - 1) * perPage, page * perPage),
    [filteredRows, page, perPage],
  );

  const title = `Site Detail - ${scope === "region" ? "Region" : "Area"}: ${
    value ?? ""
  }${pl ? ` (PL ${pl === "p5" ? "5%" : "1-5%"})` : ""}`;

  const toggleSort = (key: string) =>
    setSort((current) =>
      current?.key === key
        ? { key, asc: !current.asc }
        : { key, asc: true },
    );

  const headCell =
    "sticky top-0 z-10 h-10 border-b border-[#e2e8f0] bg-[#f8fafc] px-3 text-xs font-semibold whitespace-nowrap text-[#334155]";
  const bodyCell =
    "h-10 border-b border-[#e2e8f0] px-3 text-sm text-[#0f172a] align-top";

  return (
    <Modal open={open} onClose={onClose} width={1000} bodyClassName="p-6">
      <header className="mb-4 pr-8">
        <h2 className="text-base font-bold text-slate-800 sm:text-xl">
          {title}
        </h2>
      </header>

      <div className="flex flex-col gap-4">
        <SearchInput
          value={search}
          onChange={(next) => {
            setSearch(next);
            setPage(1);
          }}
          placeholder="Search by Site ID, Name, Region, Area, etc..."
          className="w-full max-w-[360px]"
        />

        {!loading && !filteredRows.length ? (
          <EmptyState
            title={error ? "Gagal memuat detail site." : "Data belum tersedia"}
          />
        ) : (
          <>
            <div className="max-h-[60vh] overflow-auto rounded-lg border border-[#e2e8f0]">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className={headCell} style={{ width: 70 }}>
                      No
                    </th>
                    {columns.map((key) => (
                      <th
                        key={key}
                        style={{ width: COLUMN_WIDTHS[key] ?? 110 }}
                        className={headCell}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(key)}
                          className="flex cursor-pointer items-center gap-1"
                        >
                          {toColumnTitle(key)}
                          {sort?.key === key ? (
                            sort.asc ? (
                              <LuArrowUp size={12} />
                            ) : (
                              <LuArrowDown size={12} />
                            )
                          ) : null}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading
                    ? Array.from({ length: 6 }).map((_, rowIndex) => (
                        <tr key={`site-skeleton-${rowIndex}`}>
                          {Array.from({
                            length: Math.max(columns.length + 1, 4),
                          }).map((__, cellIndex) => (
                            <td key={cellIndex} className={bodyCell}>
                              <Skeleton height={14} />
                            </td>
                          ))}
                        </tr>
                      ))
                    : pagedRows.map((row, index) => (
                        <tr
                          key={String(
                            row.site_id ?? row.id ?? `${page}-${index}`,
                          )}
                          className="hover:bg-[#f8fafc]"
                        >
                          <td className={bodyCell}>
                            {(page - 1) * perPage + index + 1}
                          </td>
                          {columns.map((key) => (
                            <td key={key} className={bodyCell}>
                              {typeof row[key] === "string" ? (
                                <ExpandableText text={row[key] as string} />
                              ) : (
                                String(row[key] ?? "-")
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            <Pagination
              current={page}
              pageSize={perPage}
              total={filteredRows.length}
              onChange={(nextPage, nextPerPage) => {
                setPage(nextPage);
                setPerPage(nextPerPage);
              }}
            />
          </>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            icon={<LuDownload size={16} />}
            loading={downloading}
            onClick={onDownload}
          >
            Download Excel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default PacketLossSiteDetailModal;
