import { Select } from "antd";

const AppDropdown = ({ title, options, setOption, placeholder, className }) => {
  return (
    <div className="flex items-center">
      <div className="border border-[#DBDADE] rounded-l-full pl-4 py-2.5 text-xs w-[90px]">
        {title}
      </div>
      <div className="border border-[#DBDADE] rounded-r-full pr-4 py-0.5 text-xs w-[150px]">
        <Select
          style={{ width: 150, overflow: "hidden" }}
          variant="borderless"
          placeholder={placeholder}
          options={options}
          onChange={setOption}
        />
      </div>
    </div>
  );
};

export { AppDropdown };
