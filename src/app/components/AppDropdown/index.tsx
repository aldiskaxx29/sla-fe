import { Select } from "antd";
import type {
  SelectProps,
  DefaultOptionType,
  LabeledValue,
} from "antd/es/select";

interface AppDropdownProps<
  ValueType extends string | number | LabeledValue = string
> extends SelectProps<ValueType, DefaultOptionType> {
  title: string;
  className?: string;
}

const AppDropdown = <
  ValueType extends string | number | LabeledValue = string
>({
  title,
  className,
  ...selectProps
}: AppDropdownProps<ValueType>) => {
  return (
    <div className={`flex items-center ${className || ""}`}>
      <div className="border border-[#DBDADE] rounded-l-full pl-4 py-2.5 text-xs w-[90px] shrink-0">
        {title}
      </div>
      <div
        className="border border-[#DBDADE] rounded-r-full pr-4 py-0.5 text-xs flex-1 min-w-[140px]"
      >
        <Select<ValueType, DefaultOptionType>
          style={{ width: "100%", overflow: "hidden" }}
          variant="borderless"
          {...selectProps}
        />
      </div>
    </div>
  );
};

export default AppDropdown;
