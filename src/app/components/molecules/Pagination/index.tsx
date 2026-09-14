import { useMemo } from "react";

import {
  IconChevronLeft,
  IconChevronRight,
  Select,
} from "@/app/components/atoms";

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
}

const buildPageItems = (current: number, lastPage: number) => {
  const items: (number | "gap-left" | "gap-right")[] = [];
  const push = (item: number | "gap-left" | "gap-right") => items.push(item);

  if (lastPage <= 7) {
    for (let page = 1; page <= lastPage; page += 1) push(page);
    return items;
  }

  push(1);
  if (current > 4) push("gap-left");

  const start = Math.max(2, current - 1);
  const end = Math.min(lastPage - 1, current + 1);
  for (let page = start; page <= end; page += 1) push(page);

  if (current < lastPage - 3) push("gap-right");
  push(lastPage);

  return items;
};

const Pagination = ({
  current,
  pageSize,
  total,
  onChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) => {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (current - 1) * pageSize + 1 : 0;
  const to = Math.min(current * pageSize, total);

  const pageItems = useMemo(
    () => buildPageItems(current, lastPage),
    [current, lastPage],
  );

  if (!total) return null;

  const goTo = (page: number) => {
    const safePage = Math.min(Math.max(1, page), lastPage);
    if (safePage !== current) onChange(safePage, pageSize);
  };

  const buttonClass = (active: boolean) =>
    [
      "flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm",
      active
        ? "border-brand-secondary text-brand-secondary font-medium"
        : "border-[#E5E7EB] text-[#0E2133] hover:border-brand-secondary",
      "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#E5E7EB]",
    ].join(" ");

  return (
    <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
      <span className="text-sm text-gray-500">
        {from}-{to} of {total} items
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Halaman sebelumnya"
          disabled={current <= 1}
          onClick={() => goTo(current - 1)}
          className={buttonClass(false)}
        >
          <IconChevronLeft size={14} />
        </button>

        {pageItems.map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              onClick={() => goTo(item)}
              className={buttonClass(item === current)}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="px-1 text-sm text-gray-400">
              &hellip;
            </span>
          ),
        )}

        <button
          type="button"
          aria-label="Halaman berikutnya"
          disabled={current >= lastPage}
          onClick={() => goTo(current + 1)}
          className={buttonClass(false)}
        >
          <IconChevronRight size={14} />
        </button>
      </div>

      <Select
        options={pageSizeOptions.map((size) => ({
          label: `${size} / page`,
          value: String(size),
        }))}
        value={String(pageSize)}
        onChange={(next) => onChange(1, Number(next))}
        className="w-32"
      />
    </div>
  );
};

export default Pagination;
