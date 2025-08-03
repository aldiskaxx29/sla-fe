// Antd
import { Table } from "antd";

const { Column, ColumnGroup } = Table;

interface ColumnType {
  key?: string;
  title: string;
  dataIndex?: string;
  children?: ColumnType[];
}

interface TableDashboardProps {
  dataSource: Record<string, unknown>[];
  columns: ColumnType[];
}

const TableDashboard: React.FC<TableDashboardProps> = ({
  columns,
  dataSource,
}) => {
  const snakeToPascal_Mixins = (snakeCaseStr) => {
    // Split the snake_case string into words
    const words = snakeCaseStr?.split(" ");

    // Capitalize the first letter of each word and join them together
    const pascalCaseStr = words
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return pascalCaseStr;
  };

  return (
    <Table
      dataSource={dataSource}
      bordered
      pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
      scroll={{
        x: "calc-size(calc-size(max-content, size), size + 400px)",
        y: 55 * 10,
      }}
    >
      {columns.map((column) =>
        column.children ? (
          <ColumnGroup key={column.key ?? column.title} title={column.title}>
            {column.children.map((child) => (
              <Column
                key={child.dataIndex}
                onHeaderCell={() => ({
                  className: "!bg-[#C5E3E6]",
                })}
                title={child.title}
                dataIndex={child.dataIndex}
                className={
                  child.dataIndex?.includes("fm") ? "bg-[#EDF6F7]" : ""
                }
                render={(text, record) => {
                  const isBelowTarget = Number(text) < Number(record.target);
                  if (child.dataIndex?.startsWith("ach")) {
                    return (
                      <span style={{ color: isBelowTarget ? "red" : "black" }}>
                        {text}
                      </span>
                    );
                  }
                  return text;
                }}
              />
            ))}
          </ColumnGroup>
        ) : (
          <Column
            key={column.dataIndex}
            title={column.title}
            dataIndex={column.dataIndex}
            render={(text, record, index) => {
              if (column.dataIndex?.startsWith("ach")) {
                const isBelowTarget = Number(text) < Number(record.target);
                return (
                  <span style={{ color: isBelowTarget ? "red" : "inherit" }}>
                    {text}
                  </span>
                );
              } else if (column.dataIndex?.includes("parameter")) {
                return (
                  <span
                    className={
                      text.includes("credit") || text.includes("weighted")
                        ? "font-bold"
                        : ""
                    }
                  >
                    {snakeToPascal_Mixins(text)}
                  </span>
                );
              } else if (column.dataIndex == "no") {
                return index + 1;
              }
              return text;
            }}
          />
        )
      )}
    </Table>
  );
};

export { TableDashboard };
