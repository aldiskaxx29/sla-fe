import type { PacketLossRow } from "../types";
import { axios } from "@/plugins/axios";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Switch, Modal, Table, Input } from "antd";
import { useState } from "react";

const ExpandableCell = ({ text, maxLength = 40 }: { text: string; maxLength?: number }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text || text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <span>
      <span>{expanded ? text : `${text.slice(0, maxLength)}... `}</span>
      <Button
        type="link"
        size="small"
        style={{ padding: 0, height: "auto", fontSize: "inherit", lineHeight: "inherit", verticalAlign: "baseline" }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setExpanded(!expanded);
        }}
      >
        {expanded ? "Show Less" : "Show More"}
      </Button>
    </span>
  );
};

type PacketLossTableProps = {
  rows?: PacketLossRow[];
  section?: string;
  isLoading?: boolean;
  showSplitToggle?: boolean;
  splitView?: boolean;
  onSplitViewChange?: (checked: boolean) => void;
  pl?: "p5" | "p15";
};

const PacketLossTable = ({
  rows,
  section,
  isLoading,
  showSplitToggle = false,
  splitView = false,
  onSplitViewChange,
  pl,
}: PacketLossTableProps) => {
  const getTrafficLightClass = (level: "good" | "warning" | "danger") => {
    switch (level) {
      case "good":
        return "bg-emerald-500";
      case "warning":
        return "bg-amber-400";
      default:
        return "bg-rose-500";
    }
  };

  const colWidths = [
    "5%",
    "24%",
    "7%",
    "11%",
    "7%",
    "7%",
    "8%",
    "8%",
    "9%",
    "14%",
  ];
  const tableRows = rows ?? [];
  const skeletonRows = Array.from({ length: 4 }, (_, index) => index);
  
  const [exportingKey, setExportingKey] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [activeDetails, setActiveDetails] = useState<{ type: "region" | "area"; value: string } | null>(null);
  const [searchText, setSearchText] = useState("");

  const filteredModalData = modalData.filter((item) => {
    if (!searchText) return true;
    return Object.values(item).some((val) =>
      String(val || "").toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const nextFrame = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

  const getFileNameFromHeaders = (contentDisposition?: string | null) => {
    if (!contentDisposition) return "";

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]);
    }

    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    return filenameMatch?.[1] ?? "";
  };

  const buildDownloadKey = (type: string, value: string) => `${type}:${value}`;

  const appendPlQuery = (url: string) => {
    if (!pl) return url;

    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}pl=${encodeURIComponent(pl)}`;
  };

  const getColumns = (data: any[]) => {
    if (!data || data.length === 0) return [];
    const first = data[0];
    const keys = Object.keys(first).filter((key) => key !== "no" && key !== "id");
    const generated = keys.map((key) => {
      let title = key.replace(/_/g, " ").toUpperCase();
      if (key === "site_id") title = "Site ID";
      if (key === "site_name") title = "Site Name";
      if (key === "region") title = "Region";
      if (key === "area") title = "Area";
      if (key === "pl") title = "Packet Loss";
      if (key === "p5") title = "PL 5%";
      if (key === "p15") title = "PL 1-5%";

      let colWidth = 110;
      if (key === "site_name") colWidth = 350;
      if (key === "site_id") colWidth = 150;
      if (key === "region") colWidth = 120;
      if (key === "area") colWidth = 120;

      return {
        title,
        dataIndex: key,
        key,
        width: colWidth,
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap" },
        }),
        render: (value: any) => {
          if (typeof value === "string") {
            return <ExpandableCell text={value} maxLength={40} />;
          }
          return value;
        },
        sorter: (a: any, b: any) => {
          const valA = a[key];
          const valB = b[key];
          if (typeof valA === "number" && typeof valB === "number") {
            return valA - valB;
          }
          return String(valA || "").localeCompare(String(valB || ""));
        },
      };
    });

    const indexColumn = {
      title: "No",
      key: "row_index",
      width: 70,
      onHeaderCell: () => ({
        style: { whiteSpace: "nowrap" },
      }),
      render: (_text: any, _record: any, index: number) => index + 1,
    };

    return [indexColumn, ...generated];
  };

  const fetchSiteDetails = async (type: "region" | "area", value: string) => {
    setSearchText("");
    setModalLoading(true);
    setModalVisible(true);
    setModalData([]);

    const formattedType = type === "region" ? "Region" : "Area";
    const plTitle = pl ? ` (PL ${pl === "p5" ? "5%" : "1-5%"})` : "";
    setModalTitle(`Site Detail - ${formattedType}: ${value}${plTitle}`);

    try {
      const queryValue = type === "region" ? value.toLowerCase() : value;
      const baseApiUrl = `daily-monitoring/pl-quality-cnop/sites?type=${encodeURIComponent(type)}&value=${encodeURIComponent(queryValue)}`;
      const url = appendPlQuery(baseApiUrl);
      
      const response = await axios<any>(url, "get", {});

      if (response.ok && response.result) {
        const data = Array.isArray(response.result) ? response.result : (response.result.data || []);
        setModalData(data);
      } else {
        setModalData([]);
      }
    } catch (err) {
      console.error("Failed to fetch site details:", err);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  const downloadBlob = async (url: string, fallbackFileName: string) => {
    const response = await axios<{
      result: Blob;
      headers?: { "content-disposition"?: string };
    }>(url, "get", {
      responseType: "blob",
    });

    const blob = response.result;
    const disposition = response.headers?.["content-disposition"];
    const fileName = getFileNameFromHeaders(disposition) || fallbackFileName;

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  const downloadPacketLossFile = async () => {
    const downloadKey = "all";
    if (exportingKey) return;

    setExportingKey(downloadKey);
    await nextFrame();

    try {
      await downloadBlob(
        appendPlQuery("daily-monitoring/pl-quality-cnop/download"),
        "packet-loss-download.xlsx",
      );
    } finally {
      setExportingKey(null);
    }
  };

  const downloadPacketLossRowFile = async (
    type: "region" | "area",
    value: string,
  ) => {
    const downloadKey = buildDownloadKey(type, value);
    if (exportingKey) return;

    setExportingKey(downloadKey);
    await nextFrame();

    try {
      const queryValue = type === "region" ? value.toLowerCase() : value;
      await downloadBlob(
        appendPlQuery(
          `daily-monitoring/pl-quality-cnop/download?type=${encodeURIComponent(type)}&value=${encodeURIComponent(queryValue)}`,
        ),
        "packet-loss-download.xlsx",
      );
    } finally {
      setExportingKey(null);
    }
  };

  return (
    <section className="rounded-2xl bg-white">
      <div className="border-b border-[#D8DEE6] px-4 py-3 flex items-center">
        <h2 className="daily-monitoring-section-title font-bold uppercase tracking-wide text-blue-600">
          {section || "A. PL 5% &amp; 1-5%"}
        </h2>
        <div className="daily-monitoring-export-controls ms-auto flex items-center gap-3">
          {showSplitToggle && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">
                Split Table
              </span>
              <Switch
                checked={splitView}
                onChange={(checked) => onSplitViewChange?.(checked)}
              />
            </div>
          )}
          <Button
            type="link"
            className="ms-auto"
            icon={<DownloadOutlined />}
            loading={exportingKey === "all"}
            onClick={() => {
              void downloadPacketLossFile();
            }}
          >
            Download Data
          </Button>
        </div>
      </div>

      <div>
        <table className="daily-monitoring-table w-full border-collapse table-fixed text-center text-[26px] lg:text-[28px]">
          <colgroup>
            {colWidths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead className="text-black">
            <tr>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                No
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                Region
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                Target
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                Site Degrade
              </th>
              <th
                colSpan={3}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                CLEAR
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Not Clear</span>
                  {/* <Tooltip title="Download Not Clear">
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      aria-label="Download Not Clear Excel"
                      className="inline-flex items-center justify-center text-black"
                      loading={exporting}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void exportNotClearToExcel();
                      }}
                    />
                  </Tooltip> */}
                </div>
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-3 py-2.5 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                Ach
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-3 py-2.5 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                Remark
              </th>
            </tr>
            <tr>
              <th className="dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[20px]">
                H-1
              </th>
              <th className="dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[20px]">
                H
              </th>
              <th className="dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[20px]">
                Growth
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? skeletonRows.map((index) => (
                  <tr key={`packetloss-skeleton-${index}`} className="bg-white">
                    {Array.from({ length: 10 }, (_, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-[#D8DEE6] px-4 py-3"
                      >
                        <div className="mx-auto h-5 w-full max-w-[120px] animate-pulse rounded bg-slate-200" />
                      </td>
                    ))}
                  </tr>
                ))
              : tableRows.map((row, index) => {
                  if (row.isSpacerRow) {
                    return (
                      <tr key={`spacer-${index}`} className="bg-white">
                        <td colSpan={10} className="border-0 px-0 py-3" />
                      </tr>
                    );
                  }

                  const rowClass = row.isTotalRow
                    ? "bg-[#d1d5db] font-bold text-black"
                    : index % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50";

                  const isArea = row.region?.startsWith("Area");
                  const isAreaOrTotal =
                    row.region?.startsWith("Area") ||
                    row.isTotalRow ||
                    row.region === "TOTAL";

                  return (
                    <tr key={`${row.region}-${index}`} className={rowClass}>
                      <td className="border border-[#D8DEE6] px-4 py-3 font-medium text-slate-700">
                        {row.no}
                      </td>
                      {/* <td
                        className={`border border-[#D8DEE6] px-4 py-3 text-slate-800 ${row.isTotalRow ? "text-center uppercase" : "font-semibold text-left"}`}
                      >
                        {row.region}
                      </td> */}

                      <td
                        className={`border border-[#D8DEE6] px-4 py-3 text-slate-800 ${
                          row.isTotalRow
                            ? "text-center uppercase"
                            : row.downloadType === "area"
                              ? "font-semibold text-left"
                              : "font-normal text-left"
                        }`}
                      >
                        {row.region}
                      </td>
                      <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                        {row.target}
                      </td>
                      <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                        {row.siteDegradeH1}
                      </td>
                      <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                        {row.siteDegradeH}
                      </td>
                      <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                        {row.clear}
                      </td>
                      <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                        {row.growth}
                      </td>
                      <td className="border border-[#D8DEE6] px-3 py-2.5 text-slate-700">
                        {row.downloadType &&
                        !row.isSpacerRow &&
                        !row.isTotalRow ? (
                          <Button
                            type="text"
                            size="small"
                            loading={
                              (modalLoading || exportingKey === buildDownloadKey(row.downloadType, row.downloadType === "region" ? row.region : row.no)) &&
                              activeDetails?.value === (row.downloadType === "region" ? row.region : row.no)
                            }
                            className="daily-monitoring-not-clear-button h-auto p-0 text-slate-700 hover:text-blue-600"
                            style={{
                              fontSize: "inherit",
                              lineHeight: "inherit",
                            }}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              const type = row.downloadType as "region" | "area";
                              const value = row.downloadType === "region" ? row.region : row.no;
                              setActiveDetails({ type, value });
                              void fetchSiteDetails(type, value);
                            }}
                          >
                            {row.notClear}
                          </Button>
                        ) : (
                          row.notClear
                        )}
                      </td>
                      {/* <td className="border border-[#D8DEE6] px-4 py-3">
                        <div className="dm-pl-ach-cell flex h-full items-center justify-center">
                          <span
                            className={`dm-badge dm-pl-ach-badge inline-flex min-w-[104px] items-center justify-center rounded-full px-3.5 py-2 font-bold leading-none`}
                          >
                            <span
                              className={`mr-2 block aspect-square h-4 w-4 shrink-0 rounded-full ${getTrafficLightClass(row.achLevel)}`}
                            />
                            {row.ach}
                          </span>
                        </div>
                      </td> */}

                    <td className="border border-[#D8DEE6] px-4 py-3">
                      <div className="dm-pl-ach-cell flex h-full items-center justify-center">
                      <span
  className={`dm-badge dm-pl-ach-badge inline-flex min-w-[104px] items-center justify-center rounded-full px-3.5 py-2 leading-none ${
    isAreaOrTotal ? "font-semibold" : "font-normal"
  }`}
>
  <span
    className={`mr-2 block aspect-square h-4 w-4 shrink-0 rounded-full ${getTrafficLightClass(row.achLevel)}`}
  />
  {row.ach}
</span>
                      </div>
                    </td>
                      <td className="border border-[#D8DEE6] px-4 py-3 text-left text-slate-700">
                        {row.remark || "-"}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      <div className="daily-monitoring-notes space-y-2 border-t border-[#D8DEE6] bg-white px-4 py-5 text-4xl leading-[1.5] text-slate-600">
        <p className="font-semibold text-slate-700">
          *Pembaruan Data Weekly Setiap Hari Kamis
        </p>
        <p>
          <p className="font-semibold text-slate-700">Sumber Data:</p>
          <a
            href="https://qosmo.telkom.co.id/daily-monitoring"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-sky-700 underline"
          >
            Packet Loss: https://qosmo.telkom.co.id/daily-monitoring
          </a>
        </p>
      </div>

      <Modal
        title={<span className="text-xl font-bold text-slate-800">{modalTitle}</span>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            loading={exportingKey === buildDownloadKey(activeDetails?.type || "", activeDetails?.value || "")}
            onClick={() => {
              if (activeDetails) {
                void downloadPacketLossRowFile(activeDetails.type, activeDetails.value);
              }
            }}
          >
            Download Excel
          </Button>
        ]}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Input.Search
            placeholder="Search by Site ID, Name, Region, Area, etc..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => setSearchText(value)}
            style={{ width: "100%", maxWidth: 360 }}
          />
          <div className="overflow-auto max-h-[60vh]">
            <Table
              dataSource={filteredModalData}
              columns={getColumns(modalData)}
              loading={modalLoading}
              rowKey={(record, idx) => record.site_id || record.id || idx}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: "max-content" }}
            />
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default PacketLossTable;
