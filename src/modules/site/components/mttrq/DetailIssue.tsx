import React, { useMemo } from "react";
import { Table } from "antd";

interface DetailIssueProps {
  data: Array<Record<string, unknown>>;
  onCellClick?: (region: string, status: string) => void;
}

const defaultColumns: Array<Record<string, any>> = [
  { title: "REGION", dataIndex: "region_tsel", key: "region", width: 200 },
  {
    title: "TOTAL TICKET NOT CLEAR",
    dataIndex: "total_not_clear",
    key: "total_not_clear",
    align: "center" as any,
  },
  {
    title: "SPMS",
    dataIndex: "spms",
    key: "spms",
    align: "center" as any,
    openDetail: true,
    statusSite: "spms",
  },
  {
    title: "ISR",
    dataIndex: "isr",
    key: "isr",
    align: "center" as any,
    openDetail: true,
    statusSite: "isr",
  },
  {
    title: "MENUNGGU TRANSPORTASI",
    dataIndex: "menunggu_transportasi",
    key: "menunggu_transportasi",
    align: "center" as any,
    openDetail: true,
    statusSite: "menunggu_transportasi",
  },
  {
    title: "QE",
    dataIndex: "qe",
    key: "qe",
    align: "center" as any,
    openDetail: true,
    statusSite: "qe",
  },
  {
    title: "ISSUE TSEL",
    dataIndex: "issue_tsel",
    key: "issue_tsel",
    align: "center" as any,
    openDetail: true,
    statusSite: "issue_tsel",
  },
  {
    title: "WARRANTY",
    dataIndex: "waranty",
    key: "waranty",
    align: "center" as any,
    openDetail: true,
    statusSite: "waranty",
  },
  {
    title: "COMCASE",
    dataIndex: "comcase",
    key: "comcase",
    align: "center" as any,
    openDetail: true,
    statusSite: "comcase",
  },
  {
    title: "CERAGON",
    dataIndex: "ceragon",
    key: "ceragon",
    align: "center" as any,
    openDetail: true,
    statusSite: "ceragon",
  },
  {
    title: "WAITING CRA / CRQ",
    dataIndex: "waiting_cra",
    key: "waiting_cra",
    align: "center" as any,
    openDetail: true,
    statusSite: "waiting_cra",
  },
  {
    title: "ISSUE DWS",
    dataIndex: "issue_dws",
    key: "issue_dws",
    align: "center" as any,
    openDetail: true,
    statusSite: "issue_dws",
  },
  {
    title: "LATE RESPONSE TIF / MITRA",
    dataIndex: "late_response",
    key: "late_response",
    align: "center" as any,
    openDetail: true,
    statusSite: "late_response",
  },
];

const DetailIssue: React.FC<DetailIssueProps> = ({
  data = [],
  onCellClick,
}) => {
  const columns = useMemo(() => {
    return defaultColumns.map((col) => ({
      ...col,
      onHeaderCell: () => ({ className: "!bg-[#d9d9d9] !p-3" }),
      render: (text: unknown, record: Record<string, unknown>) => {
        const isNationwide = String(record?.region_tsel || "")
          .toLowerCase()
          .includes("nation");
        if (col.openDetail && onCellClick) {
          const status = String(col.statusSite ?? col.dataIndex);
          const regionText = String(record["region_tsel"] ?? "");
          return (
            <button
              type="button"
              aria-label={"open " + status + " for " + regionText}
              className="text-[#5546ff] font-bold cursor-pointer bg-transparent border-0 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onCellClick(regionText, status);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCellClick(regionText, status);
                }
              }}
            >
              {String(text ?? "-")}
            </button>
          );
        }
        if (isNationwide) {
          return <span className="!font-bold">{text}</span>;
        }
        return text ?? "-";
      },
    }));
  }, [onCellClick]);

  return (
    <div>
      <h3 className="text-red-600 font-bold mb-3">DETAIL ISSUE</h3>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        rowKey={(r) => String(r.region_tsel ?? JSON.stringify(r))}
        summary={() => null}
        sticky
        expandable={{
          expandedRowRender: () => null,
        }}
      >
        {/* Render logic inside table cell is handled via column `render` below */}
      </Table>
    </div>
  );
};

export default DetailIssue;
