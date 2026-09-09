import { useEffect, useRef, useState } from "react";
import { LuCheck, LuChevronDown } from "react-icons/lu";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectMenuSize = "xs" | "sm" | "md";

type SelectMenuProps = {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: SelectMenuSize;
  variant?: "white" | "gray";
};

const sizeStyles: Record<SelectMenuSize, { button: string; option: string }> = {
  xs: {
    button: "min-w-20 px-1.5 py-0.5 text-[10px]",
    option: "px-1.5 py-1 text-[10px]",
  },
  sm: {
    button: "min-w-28 px-2 py-1 text-xs",
    option: "px-2 py-1.5 text-xs",
  },
  md: {
    button: "min-w-36 px-3 py-1.5 text-sm",
    option: "px-3 py-2 text-sm",
  },
};

export function SelectMenu({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
  className = "",
  size = "md",
  variant = "white",
}: SelectMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      {label ? (
        <span className="whitespace-nowrap text-sm text-gray-500">{label}</span>
      ) : null}

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`flex items-center justify-between gap-2 rounded-md border border-gray-300 ${
            variant === "gray" ? "bg-slate-50 hover:bg-slate-100" : "bg-white hover:bg-gray-50/50"
          } text-gray-700 transition-colors hover:border-gray-400 ${sizeStyles[size].button}`}
        >
          <span className={selected ? "" : "text-gray-400"}>
            {selected ? selected.label : placeholder}
          </span>
          <LuChevronDown
            size={size === "xs" ? 11 : size === "sm" ? 13 : 15}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen ? (
          <ul
            role="listbox"
            className="absolute right-0 z-20 mt-1 max-h-64 w-full min-w-32 overflow-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-md text-left transition-colors ${sizeStyles[size].option} ${
                      isSelected
                        ? "bg-blue-50 font-medium text-highlight"
                        : "text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                    {isSelected ? <LuCheck size={size === "xs" ? 10 : 14} /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
