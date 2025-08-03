// Antd
import { Table } from "antd";

const { Column, ColumnGroup } = Table;

interface ColumnType {
  key?: string;
  title: string;
  dataIndex?: string;
  children?: ColumnType[];
}

interface AppTableProps {
  dataSource: Record<string, unknown>[];
  columns: ColumnType[];
}

const AppTable: React.FC<AppTableProps> = ({ columns, dataSource }) => {
  return (
    <Table dataSource={dataSource} bordered>
      {columns.map((column) =>
        column.children ? (
          <ColumnGroup key={column.key ?? column.title} title={column.title}>
            {column.children.map((child) => (
              <Column
                key={child.dataIndex}
                title={child.title}
                dataIndex={child.dataIndex}
                render={(text, record) => {
                  if (child.dataIndex?.startsWith("ach")) {
                    const isBelowTarget = Number(text) < Number(record.target);
                    return (
                      <span
                        style={{ color: isBelowTarget ? "red" : "inherit" }}
                      >
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
            render={(text, record) => {
              if (column.dataIndex?.startsWith("ach")) {
                const isBelowTarget = Number(text) < Number(record.target);
                return (
                  <span style={{ color: isBelowTarget ? "red" : "inherit" }}>
                    {text}
                  </span>
                );
              }
              return text;
            }}
          />
        )
      )}
    </Table>
  );
};

export { AppTable };
