import { useMemo } from "react";
import { Table } from "antd";

const { Column } = Table;

// Function to categorize data
const categorizeData = (data, tipe) => {
  const baseColumns = [
    { title: "No", dataIndex: "no", key: "no", width: 60 },
    { title: "Site ID", dataIndex: "site_id", key: "site_id", width: 100 },
    {
      title: "Region",
      dataIndex: "region_tsel",
      key: "region_tsel",
      width: 100,
      align: "center",
    },
    {
      title: "Treg",
      dataIndex: "region",
      key: "region",
      width: 100,
      align: "center",
    },
    { title: "Witel", dataIndex: "witel", key: "witel", width: 100 },
  ];
  let colDynamic = [{}];

  if (tipe === "R") {
    colDynamic = [
      {
        title: "Status",
        dataIndex: "latency_status",
        key: "latency_status",
        width: 100,
      },
      { title: "Latency", dataIndex: "latency", key: "latency", width: 100 },
      { title: "Treshold", dataIndex: "treshold", key: "treshold", width: 100 },
      {
        title: "Jarak total",
        dataIndex: "jarak_total",
        key: "jarak_total",
        width: 100,
      },
    ];
  }
  if (tipe === "P") {
    colDynamic = [
      {
        title: "Status",
        dataIndex: "packetloss_status",
        key: "packetloss_status",
        width: 100,
      },
      {
        title: "Packetloss",
        dataIndex: "packetloss",
        key: "packetloss",
        width: 100,
      },
    ];
  }
  if (tipe === "J") {
    colDynamic = [
      {
        title: "Status",
        dataIndex: "jitter_status",
        key: "jitter_status",
        width: 100,
      },
      { title: "Jitter", dataIndex: "jitter", key: "jitter", width: 100 },
    ];
  }

  return [...baseColumns, ...colDynamic];
};

const TableDetailSite = ({ data, tipe }) => {
  const dataWithIndex = useMemo(
    () => data.map((item, index) => ({ ...item, no: index + 1 })),
    [data]
  );

  const categorizedData = useMemo(
    () => categorizeData(dataWithIndex, tipe),
    [dataWithIndex]
  );

  return (
    <Table
      dataSource={dataWithIndex}
      rowKey={(record) => record.ticket_id}
      bordered
      pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
      scroll={{
        y: 30 * 20,
      }}
    >
      {categorizedData.map((column) => (
        <Column
          key={column.dataIndex}
          title={column.title}
          dataIndex={column.dataIndex}
          onHeaderCell={() => ({
            className: "!bg-[#EEF0F2] !h-[40px] !text-center !p-3",
          })}
          onCell={() => ({
            className: "!p-3",
          })}
          width={column.width}
          render={(text, record, index) => {
            if (column.dataIndex === "no") return index + 1;
            return text;
          }}
        />
      ))}
    </Table>
  );
};

export { TableDetailSite };
