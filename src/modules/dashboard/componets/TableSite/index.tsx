// Antd
import { snakeToPascal_Utils } from "@/app/utils/wording.utils";
import { Modal, Skeleton, Spin, Table } from "antd";
import { useMemo, useState } from "react";
import { useDashboard } from "../../hooks/dashboard.hooks";
import { TableDetailTicket } from "../TableDetailTicket";
import { TableDetailSite } from "../TableDetailSite";
import {
  AlertOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
  StopOutlined,
} from "@ant-design/icons";

const { Column, ColumnGroup } = Table;

const iconMap = {
  Clear: <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 16 }} />,
  Quality: <StarOutlined style={{ color: "#faad14", fontSize: 16 }} />,
  SOS: <AlertOutlined style={{ color: "#eb2f96", fontSize: 16 }} />,
  Blacklist: <StopOutlined style={{ color: "#f5222d", fontSize: 16 }} />,
  Preventive: (
    <SafetyCertificateOutlined style={{ color: "#1890ff", fontSize: 16 }} />
  ),
};

interface TableSiteProps {
  dataSource: Record<string, unknown>[];
  showTicket: boolean;
  month: string;
  week: string;
  site: string;
}

const TableSite: React.FC<TableSiteProps> = ({
  dataSource,
  showTicket,
  month,
  week,
  site,
}) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [tipeDetail, setTipeDetail] = useState("");

  const { getDetailTicket, getDetailSite, dataDetailSite, dataDetailTicket } =
    useDashboard();

  const dataWithIndex = useMemo(
    () => dataSource.map((item, index) => ({ ...item, no: index + 1 })),
    [dataSource]
  );
  const fetchDetailTicket = async (record, dataIndex, tipe) => {
    try {
      setLoading(true);
      const parameter = { P: "packetloss", R: "latency", J: "jitter" };
      const payload = {
        parameter: parameter[site],
        region: record.region_tsel,
        status_site:
          tipe === "ticket" ? dataIndex : dataIndex.replace("ticket_", ""),
        month,
        week,
      };
      if (tipe === "ticket")
        await getDetailTicket({
          query: { ...payload },
        }).unwrap();
      else
        await getDetailSite({
          query: { ...payload },
        }).unwrap();
      setIsOpen(!isOpen);
    } catch (error) {
      console.error("Error fetching Worksheet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (record, dataIndex, tipe) => {
    setTipeDetail(tipe);
    fetchDetailTicket(record, dataIndex, tipe);
  };

  const columns = useMemo(() => {
    // Extract month keys from sample data
    const sampleRecord = dataWithIndex[0];

    return [
      { title: "No", dataIndex: "no", key: "no" },
      { title: "Regional", dataIndex: "region_tsel", key: "regional" },
      {
        title: "Max Site Not Clear",
        dataIndex: "max_site_not_clear",
        key: "max_site_not_clear",
        width: 160,
      },
      {
        title: "Status",
        key: "status",
        children: [
          {
            title: "Quality",
            dataIndex: "ticket_quality",
            key: `quality`,
          },
          {
            title: "SOS",
            dataIndex: "ticket_icu",
            key: `icu`,
          },
          {
            title: "Blacklist",
            dataIndex: "ticket_blacklist",
            key: `blacklist`,
          },
          {
            title: "Preventive",
            dataIndex: "ticket_preventiv",
            key: `preventiv`,
          },
          {
            title: "Clear",
            dataIndex: "ticket_clear",
            key: `clear`,
          },
        ],
      },
      { title: "Total Site", dataIndex: "total", key: "total" },
    ];
  }, [dataWithIndex]);
  return (
    <>
      {loading && (
        <Spin fullscreen tip="Sedang Memuat Data..." className="z-100" />
      )}
      <Table
        dataSource={dataWithIndex}
        bordered
        pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
        scroll={{
          x: "calc-size(calc-size(max-content, size), size + 400px)",
          y: 55 * 10,
        }}
      >
        {columns.map((column) =>
          column.children ? (
            <ColumnGroup
              key={column.key ?? column.title}
              title={column.title}
              onHeaderCell={() => ({
                className: "!bg-[#EEF0F2]",
              })}
            >
              {column.children.map((child) => (
                <Column
                  key={child.dataIndex}
                  onHeaderCell={() => ({
                    className: "!bg-[#C5E3E6]", // ✅ This applies to <th> directly
                  })}
                  title={
                    <div className="flex">
                      <span className="flex items-center gap-1 mr-2">
                        {child.title}
                      </span>
                      {iconMap[child.title]}
                    </div>
                  }
                  dataIndex={child.dataIndex}
                  className={
                    child.dataIndex?.includes("fm") ? "bg-[#EDF6F7]" : ""
                  }
                  render={(text, record, index) => {
                    if (child.dataIndex?.includes("ticket")) {
                      return (
                        <span>
                          <span
                            className="p-2 rounded-md cursor-pointer hover:bg-[#C5E3E6] hover:text-white"
                            onClick={() =>
                              openModal(record, child.dataIndex, "data")
                            }
                          >
                            {record[child.dataIndex.split("_")[1]]}
                          </span>
                          {showTicket && (
                            <span
                              onClick={() =>
                                openModal(record, child.dataIndex, "ticket")
                              }
                              className="ml-1 bg-[#FFBE01] rounded-full text-xs text-white px-2 py-0.5 "
                            >
                              {text}
                            </span>
                          )}
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
              onHeaderCell={() => ({
                className: "!bg-[#EEF0F2]",
              })}
              width={column.width}
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
                      {snakeToPascal_Utils(text)}
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
      {/* Modal for worksheet */}
      <Modal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width={"90%"}
      >
        {tipeDetail === "ticket" ? (
          dataDetailTicket ? (
            <div>
              <p className="text-xl font-medium text-center">
                Ticket Management Quality CNOP
              </p>
              <TableDetailTicket
                data={dataDetailTicket?.data as Record<string, unknown>}
              />
            </div>
          ) : (
            <Skeleton active />
          )
        ) : dataDetailSite ? (
          <div>
            <p className="text-xl font-medium text-center">
              Site Management Quality CNOP
            </p>
            <TableDetailSite
              data={dataDetailSite?.data as Record<string, unknown>}
              tipe={site}
            />
          </div>
        ) : (
          <Skeleton active />
        )}
      </Modal>
    </>
  );
};

export { TableSite };
