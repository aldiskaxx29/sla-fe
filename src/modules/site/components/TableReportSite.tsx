// Antd
import { Checkbox, Image, Spin, Table } from "antd";
import ModalInput from "./ModalInput";
import { useMemo, useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import ModalClear from "./ModalClear";
import { useSite } from "../hooks/site.hooks";

const { Column, ColumnGroup } = Table;

interface TableHistoryProps {
  dataSource: Record<string, unknown>[];
  parameter: string;
  week: string;
  month: string;
  year: string;
}

const TableReportSite: React.FC<TableHistoryProps> = ({
  dataSource,
  parameter,
  month,
  week,
  year,
}) => {
  const [open, setOpen] = useState(false);
  const [openClear, setOpenClear] = useState(false);
  const [dataModal, setDataModal] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatusSite, setCurrentStatusSite] = useState(""); // State untuk menyimpan status_site
  const { getClearData } = useSite();

  const columns1 = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
    {
      title: "Regional",
      dataIndex: "region_tsel",
      key: "regional",
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
    {
      title: "Total Site",
      dataIndex: "total",
      key: "total",
      align: "center",
      width: 160,
      onHeaderCell: () => ({
        className: "!bg-[#d9d9d9] !p-3",
      }),
    },
    {
      title: "Clear",
      dataIndex: "clear",
      key: `clear`,
      align: "center",
      openDetail: true,
      statusSite: "clear", // Tambah property statusSite
      onHeaderCell: () => ({
        className: "!bg-[#bdeed3] !p-3",
      }),
    },
    {
      title: "Preventive",
      dataIndex: "preventive",
      align: "center",
      openDetail: true,
      key: `preventive`,
      statusSite: "preventive", // Tambah property statusSite
      onHeaderCell: () => ({
        className: "!bg-[#fde6b9] !p-3",
      }),
    },
    {
      title: "Quality",
      dataIndex: "quality",
      align: "center",
      openDetail: true,
      key: `quality`,
      statusSite: "quality", // Tambah property statusSite
      onHeaderCell: () => ({
        className: "!bg-[#fde6b9] !p-3",
      }),
    },
    {
      title: "SOS",
      dataIndex: "sos",
      align: "center",
      key: `sos`,
      statusSite: "sos", // Tambah property statusSite untuk parent SOS
      onHeaderCell: () => ({
        className: "!bg-[#f5c3c3] !p-3",
      }),
      children: [
        {
          title: "Capacity",
          dataIndex: "sos_capacity",
          align: "center",
          openDetail: true,
          key: `sos_capacity`,
          statusSite: "sos_capacity", // Tambah property statusSite
          onHeaderCell: () => ({
            className: "!bg-[#f5c3c3] !p-3 cursor-pointer",
          }),
        },
        {
          title: "Warranty",
          dataIndex: "sos_waranty",
          align: "center",
          openDetail: true,
          key: `sos_waranty`,
          statusSite: "sos_waranty", // Tambah property statusSite
          onHeaderCell: () => ({
            className: "!bg-[#f5c3c3] !p-3",
          }),
        },
        {
          title: "Power",
          dataIndex: "sos_power",
          align: "center",
          openDetail: true,
          key: `sos_power`,
          statusSite: "sos_power", // Tambah property statusSite
          onHeaderCell: () => ({
            className: "!bg-[#f5c3c3] !p-3",
          }),
        },
        {
          title: "Qual TSEL",
          dataIndex: "sos_qual_tsel",
          align: "center",
          openDetail: true,
          key: `sos_qual_tsel`,
          statusSite: "sos_qual_tsel", // Tambah property statusSite
          onHeaderCell: () => ({
            className: "!bg-[#f5c3c3] !p-3",
          }),
        },
        {
          title: "QE",
          dataIndex: "sos_qe",
          align: "center",
          openDetail: true,
          key: `sos_qe`,
          statusSite: "sos_qe", // Tambah property statusSite
          onHeaderCell: () => ({
            className: "!bg-[#f5c3c3] !p-3",
          }),
        },
        {
          title: "Others",
          dataIndex: "sos",
          align: "center",
          openDetail: true,
          key: `sos`,
          statusSite: "sos", // Tambah property statusSite
          onHeaderCell: () => ({
            className: "!bg-[#f5c3c3] !p-3",
          }),
        },
      ],
    },
    {
      title: "Blacklist",
      dataIndex: "blacklist",
      align: "center",
      openDetail: true,
      key: `blacklist`,
      statusSite: "blacklist", // Tambah property statusSite
      onHeaderCell: () => ({
        className: "!bg-black !text-white !p-3",
      }),
    },
  ];

  const columns = useMemo(() => {
    return columns1;
  }, []);

  const dataWithIndex = useMemo(
    () =>
      dataSource.map((item, index) => {
        if (!item.region_tsel.includes("NATION"))
          return { ...item, no: index + 1 };
        else return item;
      }),
    [dataSource]
  );

  const handleSave = () => {
    console.log("Pajangan");
  };

  const openModalClear = async (record, statusSite) => {
    try {
      setIsLoading(true);
      const response = await getClearData({
        query: {
          region: record.region_tsel,
          parameter: parameter,
          status_site: statusSite, // Gunakan statusSite dari parameter
          month,
          week,
          year,
        },
      }).unwrap();

      setDataModal(response?.data);
      setOpenClear(true);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mendapatkan statusSite berdasarkan dataIndex
  const getStatusSiteFromColumn = (dataIndex) => {
    const column = columns1.find((col) => col.dataIndex === dataIndex);
    return column?.statusSite || dataIndex;
  };

  return (
    <div className="mt-8">
      {isLoading && <Spin fullscreen tip="Sedang Memuat Data..." />}
      <Table
        dataSource={dataWithIndex}
        bordered
        className="rounded-xl "
        pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
      >
        {columns.map((column) =>
          column.children ? (
            <ColumnGroup
              key={column.key ?? column.title}
              title={column.title}
              onHeaderCell={column.onHeaderCell}
            >
              {column.children.map((child) => (
                <Column
                  key={child.dataIndex}
                  title={child.title}
                  dataIndex={child.dataIndex}
                  width="fit-content"
                  align={child.align}
                  onHeaderCell={child.onHeaderCell}
                  fixed={child.fixed}
                  render={(text, record) => {
                    const isLast = record?.region_tsel
                      ?.toLowerCase()
                      .includes("nation");
                    if (child.openDetail) {
                      return (
                        <div
                          className="text-[#5546ff] font-bold cursor-pointer"
                          onClick={() => {
                            const statusSite =
                              child.statusSite || child.dataIndex;
                            openModalClear(record, statusSite);
                          }}
                        >
                          {text}
                        </div>
                      );
                    }
                    if (isLast) {
                      return <span className="!font-bold">{text}</span>;
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
              width={column.width}
              onHeaderCell={column.onHeaderCell}
              fixed={column.fixed}
              align={column.align}
              render={(text, record) => {
                const isLast = record?.region_tsel
                  ?.toLowerCase()
                  .includes("nation");
                if (column.openDetail) {
                  return (
                    <div
                      className="text-[#5546ff] font-bold cursor-pointer"
                      onClick={() => {
                        const statusSite =
                          column.statusSite || column.dataIndex;
                        openModalClear(record, statusSite);
                      }}
                    >
                      {text}
                    </div>
                  );
                }
                if (column.dataIndex?.startsWith("button")) {
                  return <Checkbox />;
                } else if (column.dataIndex?.startsWith("input")) {
                  return <p className="italic">Input Here</p>;
                } else if (column.dataIndex?.startsWith("action")) {
                  return (
                    <EditOutlined
                      className="cursor-pointer"
                      onClick={() => setOpen(true)}
                    />
                  );
                } else if (isLast) {
                  return <span className="!font-bold">{text}</span>;
                }
                return text;
              }}
            />
          )
        )}
      </Table>
      <ModalInput
        open={open}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
      />
      <ModalClear
        open={openClear}
        data={dataModal}
        parameter={parameter}
        onCancel={() => {
          setOpenClear(false);
        }}
      />
    </div>
  );
};

export { TableReportSite };
