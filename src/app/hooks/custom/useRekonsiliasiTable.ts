// React
import { useCallback, useEffect, useMemo, useState } from "react";

// Hooks
import { useRekonsiliasiListQuery } from "@/app/hooks/query/reconsiliation/useRekonsiliasiQueries";
import type { RekonsiliasiPeriod } from "./useRekonsiliasiPeriod";

// Types
import type {
  ColumnSearch,
  RekonsiliasiFilterOptions,
  RekonsiliasiListParams,
  RekonsiliasiRow,
  TablePagination,
} from "@/app/types/reconsiliation/rekonsiliasi.types";

const DEFAULT_PAGE_SIZE = 10;

const normalizeFilterValue = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

interface UseRekonsiliasiTableParams {
  period: RekonsiliasiPeriod;
}

/**
 * Menyatukan state filter kolom, pencarian, dan paginasi dengan query datanya.
 *
 * Backend membedakan dua cara penyaringan:
 * - kolom checkbox lewat `filter[field][]`, boleh beberapa kolom sekaligus;
 * - pencarian teks lewat `search` + `searchable`, hanya satu yang bisa aktif
 *   karena keduanya berbagi satu parameter `search`.
 */
export const useRekonsiliasiTable = ({ period }: UseRekonsiliasiTableParams) => {
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearch] = useState<ColumnSearch | null>(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<TablePagination>({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const [filterOptions, setFilterOptions] = useState<
    RekonsiliasiFilterOptions | undefined
  >(undefined);
  // Daftar field yang boleh dicari juga datang dari response
  // (`meta.searchable_available`), jadi tidak ada daftar hardcode.
  const [searchableFields, setSearchableFields] = useState<
    string[] | undefined
  >(undefined);

  const hasActiveFilter =
    Boolean(columnSearch) ||
    Boolean(search.trim()) ||
    Object.values(columnFilters).some((values) => values.length > 0);

  /**
   * Dropdown menampilkan satu entri per nilai, tapi BE menyimpan beda
   * kapitalisasi ("Technical TSEL" vs "Technical Tsel"). Semua varian dikirim
   * supaya tidak ada baris yang terlewat.
   */
  const expandedFilters = useMemo(() => {
    const result: Record<string, string[]> = {};

    Object.entries(columnFilters).forEach(([field, values]) => {
      if (!values.length) return;

      const options = filterOptions?.[field] ?? [];
      const expanded = new Set<string>();

      values.forEach((value) => {
        expanded.add(value);
        options.forEach((option) => {
          if (normalizeFilterValue(option) === normalizeFilterValue(value)) {
            expanded.add(option);
          }
        });
      });

      result[field] = Array.from(expanded);
    });

    return result;
  }, [columnFilters, filterOptions]);

  const listParams = useMemo<RekonsiliasiListParams>(() => {
    const activeSearch = columnSearch ? columnSearch.value.trim() : search.trim();

    return {
      prev: period.prev,
      exclude: period.exclude,
      evidence: period.evidence,
      parameter: period.parameter,
      year: period.year,
      month: period.month,
      ...(period.isMttrqParameter ? {} : { week: period.effectiveWeek }),
      page: pagination.current,
      perPage: pagination.pageSize,
      ...(activeSearch ? { search: activeSearch } : {}),
      ...(columnSearch
        ? { searchable: [columnSearch.field] }
        : searchableFields?.length
          ? { searchable: searchableFields }
          : {}),
      ...(Object.keys(expandedFilters).length
        ? { filter: expandedFilters }
        : {}),
    };
  }, [
    period.prev,
    period.exclude,
    period.evidence,
    period.parameter,
    period.year,
    period.month,
    period.isMttrqParameter,
    period.effectiveWeek,
    pagination,
    search,
    columnSearch,
    searchableFields,
    expandedFilters,
  ]);

  const listQuery = useRekonsiliasiListQuery(
    listParams,
    period.isReady && Boolean(period.month) && Boolean(period.year),
  );

  const rows = useMemo<RekonsiliasiRow[]>(
    () => (Array.isArray(listQuery.data?.data) ? listQuery.data.data : []),
    [listQuery.data],
  );

  const total =
    listQuery.data?.meta?.total ?? listQuery.data?.total ?? rows.length;

  // `options` ikut menyempit saat ada filter aktif, jadi daftar pilihan hanya
  // diperbarui dari response tanpa filter.
  useEffect(() => {
    if (hasActiveFilter) return;

    const options = listQuery.data?.options;
    if (!options) return;

    setFilterOptions((current) =>
      JSON.stringify(current) === JSON.stringify(options) ? current : options,
    );
  }, [hasActiveFilter, listQuery.data]);

  useEffect(() => {
    const available = listQuery.data?.meta?.searchable_available;
    if (!available?.length) return;

    setSearchableFields((current) =>
      JSON.stringify(current) === JSON.stringify(available)
        ? current
        : available,
    );
  }, [listQuery.data]);

  // Ganti periode berarti kembali ke halaman pertama.
  useEffect(() => {
    setPagination((current) =>
      current.current === 1 ? current : { ...current, current: 1 },
    );
  }, [
    period.parameter,
    period.year,
    period.month,
    period.week,
    period.prev,
    period.exclude,
    period.evidence,
    search,
    columnSearch,
    columnFilters,
  ]);

  // Kolom tiap parameter berbeda, jadi filternya direset saat parameter ganti.
  useEffect(() => {
    setColumnFilters((current) => (Object.keys(current).length ? {} : current));
    setColumnSearch((current) => (current ? null : current));
    setFilterOptions(undefined);
  }, [period.parameter]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    // Search bar dan search per kolom berbagi parameter `search`.
    if (value) setColumnSearch(null);
    setPagination((current) => ({ ...current, current: 1 }));
  }, []);

  /** Filter checkbox: beberapa kolom boleh aktif bersamaan. */
  const handleFilterChange = useCallback(
    (field: string, values: string[]) => {
      setColumnFilters((current) => {
        if (values.length) return { ...current, [field]: values };
        if (!(field in current)) return current;

        return Object.fromEntries(
          Object.entries(current).filter(([key]) => key !== field),
        );
      });
      setPagination((current) => ({ ...current, current: 1 }));
    },
    [],
  );

  /** Pencarian per kolom: hanya satu yang bisa aktif karena `search` cuma satu. */
  const handleColumnSearchChange = useCallback(
    (field: string, value: string) => {
      const trimmed = value.trim();

      setSearch("");
      setColumnSearch(trimmed ? { field, value: trimmed } : null);
      setPagination((current) => ({ ...current, current: 1 }));
    },
    [],
  );

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setPagination((current) => ({ ...current, current: page, pageSize }));
  }, []);

  return {
    rows,
    filterOptions,
    columnFilters,
    columnSearch,
    search,
    pagination: { ...pagination, total },
    isLoading: listQuery.isPending || listQuery.isFetching,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    handleSearchChange,
    handleFilterChange,
    handleColumnSearchChange,
    handlePageChange,
  };
};

export type RekonsiliasiTableState = ReturnType<typeof useRekonsiliasiTable>;
