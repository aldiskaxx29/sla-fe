import { DownOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";

export interface SlaSelectOption {
  label: string;
  value: string;
}

interface SlaSelectProps {
  placeholder: string;
  options: SlaSelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  allowClear?: boolean;
  loading?: boolean;
}

const SlaSelect = ({
  placeholder,
  options,
  value,
  onChange,
  allowClear = true,
  loading = false,
}: SlaSelectProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 text-sm text-[#3F3F46] transition-colors hover:border-[#D4D4D8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={selectedLabel ? "text-[#18181B]" : "text-[#71717A]"}>
          {selectedLabel ?? placeholder}
        </span>
        <DownOutlined
          className={`text-[10px] text-[#A1A1AA] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 max-h-[320px] min-w-[200px] overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
          {allowClear && value && (
            <button
              type="button"
              className="block w-full px-4 py-2 text-left text-sm text-[#71717A] hover:bg-[#F4F4F5]"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              {placeholder}
            </button>
          )}

          {!options.length && (
            <p className="px-4 py-2 text-sm text-[#A1A1AA]">
              Opsi belum tersedia
            </p>
          )}

          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#F4F4F5] ${
                option.value === value
                  ? "bg-[#F4F4F5] font-medium text-[#18181B]"
                  : "text-[#3F3F46]"
              }`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SlaSelect;
