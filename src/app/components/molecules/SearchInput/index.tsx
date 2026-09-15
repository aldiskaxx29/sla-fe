import { IconClose, IconSearch } from "@/app/components/atoms/icon";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className = "w-56",
}: SearchInputProps) => {
  return (
    <div
      className={`flex h-11 items-center gap-2 rounded-lg border border-[#D9D9D9] bg-white px-3 focus-within:border-brand-secondary ${className}`}
    >
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSearch?.(value);
        }}
        className="min-w-0 flex-1 bg-transparent text-sm text-[#0E2133] placeholder:text-gray-400 focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          aria-label="Bersihkan pencarian"
          onClick={() => onChange("")}
          className="text-gray-400 hover:text-gray-600"
        >
          <IconClose size={14} />
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Cari"
        onClick={() => onSearch?.(value)}
        className="text-gray-400 hover:text-brand-secondary"
      >
        <IconSearch size={16} />
      </button>
    </div>
  );
};

export default SearchInput;
