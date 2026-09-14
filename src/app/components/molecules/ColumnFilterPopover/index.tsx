import { useEffect, useMemo, useRef, useState } from "react";

import { Button, Checkbox, IconFilter, Popover } from "@/app/components/atoms";

interface ColumnFilterPopoverProps {
  options: string[];
  value: string[];
  onApply: (values: string[]) => void;
  searchable?: boolean;
}

const ColumnFilterPopover = ({
  options,
  value,
  onApply,
  searchable = true,
}: ColumnFilterPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(value);
  const [keyword, setKeyword] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(value);
      setKeyword("");
    }
  }, [isOpen, value]);

  const visibleOptions = useMemo(() => {
    if (!keyword.trim()) return options;

    const needle = keyword.trim().toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(needle));
  }, [keyword, options]);

  const toggle = (option: string) =>
    setDraft((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );

  return (
    <span className="inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Filter kolom"
        onClick={() => setIsOpen((current) => !current)}
        className={value.length ? "text-brand-secondary" : "text-gray-400"}
      >
        <IconFilter size={14} />
      </button>

      <Popover
        open={isOpen}
        anchorRef={triggerRef}
        onClose={() => setIsOpen(false)}
        align="end"
        minWidth={224}
      >
        <div className="p-2 text-left font-normal">
          {searchable ? (
            <input
              autoFocus
              value={keyword}
              placeholder="Cari..."
              onChange={(event) => setKeyword(event.target.value)}
              className="mb-2 w-full rounded border border-[#D9D9D9] px-2 py-1 text-xs font-normal focus:border-brand-secondary focus:outline-none"
            />
          ) : null}

          <div className="max-h-52 overflow-y-auto">
            {visibleOptions.length ? (
              visibleOptions.map((option) => (
                <div key={option} className="px-1 py-1">
                  <Checkbox
                    checked={draft.includes(option)}
                    onChange={() => toggle(option)}
                    className="!text-xs !font-normal"
                  >
                    {option}
                  </Checkbox>
                </div>
              ))
            ) : (
              <p className="px-1 py-2 text-xs font-normal text-gray-400">
                Tidak ada pilihan
              </p>
            )}
          </div>

          <div className="mt-2 flex justify-between gap-2 border-t border-gray-100 pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft([]);
                onApply([]);
                setIsOpen(false);
              }}
            >
              Reset
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                onApply(draft);
                setIsOpen(false);
              }}
            >
              Terapkan
            </Button>
          </div>
        </div>
      </Popover>
    </span>
  );
};

export default ColumnFilterPopover;
