import { formatTableValue } from "@/app/utils/table.utils";

interface TableValueProps {
  value: unknown;
  className?: string;
}

const TableValue = ({ value, className }: TableValueProps) => (
  <span className={className}>{formatTableValue(value)}</span>
);

export default TableValue;
