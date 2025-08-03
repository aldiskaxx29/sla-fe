// Antd
import { Radio } from "antd";
import type { CheckboxGroupProps } from "antd/es/checkbox";

import React from "react";

interface AppRadioGroupProps {
  options: CheckboxGroupProps<string>["options"];
  defaultValue?: string;
  optionsType?: string;
  onChange?: (e: string) => string | void;
}

const AppRadioGroup: React.FC<AppRadioGroupProps> = ({
  options,
  defaultValue,
  optionsType,
  onChange,
}) => {
  return (
    <Radio.Group
      options={options}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      optionType={optionsType as "default" | "button" | undefined} // Ensure correct type
    />
  );
};

export { AppRadioGroup };
