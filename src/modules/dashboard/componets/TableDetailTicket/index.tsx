import { useMemo } from "react";
import { Table } from "antd";

const { Column } = Table;

// Function to categorize data
const categorizeData = (data) => {
  const baseColumns = [
    { 
      title: "No", 
      dataIndex: "no", 
      key: "no", 
      width: 60,
      align: "center", 
    },
    {
      title: "Region",
      dataIndex: "region_tsel",
      key: "region_tsel",
      width: 100,
    },
    { title: "Kategori", dataIndex: "sitegroup", key: "sitegroup", width: 100 },
    { title: "Ticket", dataIndex: "ticket_id", key: "ticket_id", width: 150 },
    { title: "Status", dataIndex: "status", key: "status", width: 100 },
    { title: "Site ID", dataIndex: "site_id", key: "site_id", width: 100 },
    {
      title: "Open Date",
      dataIndex: "creationdate",
      key: "creationdate",
      width: 200,
    },
    {
      title: "Headline",
      dataIndex: "trouble_headline",
      key: "trouble_headline",
      width: 300,
    },
    {
      title: "TTR Customer Jam",
      dataIndex: "ttr_customer_jam",
      key: "ttr_customer_jam",
      width: 110,
    },
    {
      title: "Last Update",
      dataIndex: "resolvedate",
      key: "resolvedate",
      width: 200,
    },
    {
      title: "Last Worklog",
      dataIndex: "last_worklog",
      key: "last_worklog",
      width: 300,
    },
    {
      title: "Latest Position",
      dataIndex: "work_group",
      key: "work_group",
      width: 100,
    },
    { title: "Witel", dataIndex: "witel", key: "witel", width: 100 },
    {
      title: "TTR Witel",
      dataIndex: "ttr_witel",
      key: "ttr_witel",
      width: 100,
    },
    {
      title: "Reported By",
      dataIndex: "reportedby",
      key: "reportedby",
      width: 100,
    },
  ];

  return baseColumns;
};

const TableDetailTicket = ({ data }) => {
  const dataWithIndex = useMemo(
    () => data.map((item, index) => ({ ...item, no: index + 1 })),
    [data]
  );

  const categorizedData = useMemo(
    () => categorizeData(dataWithIndex),
    [dataWithIndex]
  );

  return (
    <Table
      dataSource={dataWithIndex}
      rowKey={(record) => record.ticket_id}
      bordered
      pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
      scroll={{
        y: 30 * 10,
      }}
    >
      {categorizedData.map((column) => (
        <Column
          key={column.dataIndex}
          title={column.title}
          dataIndex={column.dataIndex}
          onHeaderCell={() => ({
            className: "!bg-[#EEF0F2] !h-[40px] !text-center",
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

export { TableDetailTicket };
