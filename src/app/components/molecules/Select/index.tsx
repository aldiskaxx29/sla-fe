import { useEffect, useMemo, useRef, useState } from "react";

import {
  IconCheck,
  IconChevronDown,
  IconClose,
} from "@/app/components/atoms/icon";
import Popover from "@/app/components/atoms/popover/Popover";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  triggerClassName?: string;
  className?: string;
}

const toArray = (value?: string | string[]) =>
  Array.isArray(value) ? value : value ? [value] : [];

const Select = ({
  options,
  value,
  onChange,
  placeholder = "Pilih",
  multiple = false,
  searchable = false,
  disabled = false,
  invalid = false,
  triggerClassName,
  className = "",
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedValues = toArray(value);

  useEffect(() => {
    if (!isOpen) setKeyword("");
  }, [isOpen]);

  const visibleOptions = useMemo(() => {
    if (!searchable || !keyword.trim()) return options;

    const needle = keyword.trim().toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(needle),
    );
  }, [keyword, options, searchable]);

  const selectedLabels = selectedValues.map(
    (item) => options.find((option) => option.value === item)?.label ?? item,
  );

  const handlePick = (optionValue: string) => {
    if (multiple) {
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter((item) => item !== optionValue)
        : [...selectedValues, optionValue];

      onChange?.(next);
      return;
    }

    onChange?.(optionValue);
    setIsOpen(false);
  };

  const defaultTrigger = [
    "flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-left text-sm",
    invalid ? "border-red-500" : "border-[#D9D9D9]",
    disabled ? "cursor-not-allowed bg-gray-50 text-gray-400" : "cursor-pointer",
  ].join(" ");

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className={triggerClassName ?? defaultTrigger}
      >
        <span
          className={`flex-1 truncate ${selectedLabels.length ? "text-[#0E2133]" : "text-gray-400"}`}
        >
          {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
        </span>
        {multiple && selectedLabels.length ? (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Kosongkan pilihan"
            onClick={(event) => {
              event.stopPropagation();
              onChange?.([]);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <IconClose size={12} />
          </span>
        ) : null}
        <IconChevronDown size={14} className="shrink-0 text-gray-400" />
      </button>

      <Popover
        open={isOpen && !disabled}
        anchorRef={triggerRef}
        onClose={() => setIsOpen(false)}
        matchAnchorWidth
        className="py-1"
      >
        {searchable ? (
          <div className="px-2 pb-1">
            <input
              autoFocus
              value={keyword}
              placeholder="Cari..."
              onChange={(event) => setKeyword(event.target.value)}
              className="w-full rounded border border-[#D9D9D9] px-2 py-1 text-xs focus:border-brand-secondary focus:outline-none"
            />
          </div>
        ) : null}

        <div className="max-h-60 overflow-y-auto">
          {visibleOptions.length ? (
            visibleOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handlePick(option.value)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-[#EDFFFD] ${
                    isSelected
                      ? "bg-[#EDFFFD] font-medium text-brand-secondary"
                      : "text-[#0E2133]"
                  }`}
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected ? <IconCheck size={14} /> : null}
                </button>
              );
            })
          ) : (
            <p className="px-3 py-2 text-xs text-gray-400">Tidak ada pilihan</p>
          )}
        </div>
      </Popover>
    </div>
  );
};

export default Select;
