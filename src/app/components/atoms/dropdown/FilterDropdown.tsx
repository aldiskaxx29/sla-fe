// Atoms
import Select from "./Select";
import type { SelectOption } from "./Select";

interface FilterDropdownProps {
  title: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Dropdown berbentuk pil dengan label menempel di kirinya. */
const FilterDropdown = ({
  title,
  options,
  value,
  onChange,
  placeholder = "All",
  className = "",
}: FilterDropdownProps) => (
  <div className={`flex items-center ${className}`}>
    <div className="w-[90px] shrink-0 rounded-l-full border border-[#DBDADE] py-2.5 pl-4 text-xs">
      {title}
    </div>
    <div className="min-w-[140px] flex-1 rounded-r-full border border-[#DBDADE] pr-2">
      <Select
        options={options}
        value={value}
        placeholder={placeholder}
        onChange={(next) => onChange?.(String(next))}
        triggerClassName="flex w-full cursor-pointer items-center gap-2 bg-transparent px-2 py-2 text-left text-xs"
      />
    </div>
  </div>
);

export default FilterDropdown;
