// Antd
import { Button, Checkbox, Input, InputRef, Space, Table } from "antd";
import ModalInput from "./ModalInput";
import { useMemo, useRef, useState } from "react";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import { useSite } from "../hooks/site.hooks";
import { toast } from "react-toastify";
import Highlighter from "react-highlight-words";
import { FilterDropdownProps } from "antd/es/table/interface";

const { Column, ColumnGroup } = Table;

interface TableHistoryProps {
  dataSource: Record<string, unknown>[];
  parameter: string;
  week;
  month;
  setTrigger: React.Dispatch<React.SetStateAction<number>>;
}

const TableInputSite: React.FC<TableHistoryProps> = ({
  dataSource,
  parameter,
  week,
  month,
  setTrigger,
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (
    clearFilters: () => void,
    selectedKeys,
    confirm,
    dataIndex
  ) => {
    clearFilters();
    setSearchText("");
    handleSearch(selectedKeys as string[], confirm, dataIndex);
  };

  const snakeToPascal_Mixins = (snakeCaseStr) => {
    // Split the snake_case string into words
    const words = snakeCaseStr?.split(" ");

    // Capitalize the first letter of each word and join them together
    const pascalCaseStr = words
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return pascalCaseStr;
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${snakeToPascal_Mixins(dataIndex)}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() =>
              clearFilters &&
              handleReset(
                clearFilters,
                selectedKeys as string[],
                confirm,
                dataIndex
              )
            }
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const [open, setOpen] = useState(false);
  const [dataModal, setDataModal] = useState({});
  const dynamicKey = useMemo(() => {
    if (parameter.includes("packetloss")) return "packetloss";
    if (parameter.includes("jitter")) return "jitter";
    if (parameter.includes("latency")) return "latency";
  }, [parameter]);
  const dynamicTitle = useMemo(() => {
    if (parameter.includes("packetloss")) return "PL";
    if (parameter.includes("jitter")) return "Jitter";
    if (parameter.includes("latency")) return "Latency";
  }, [parameter]);
  const monthOrWeek = useMemo(() => {
    console.log(week);

    if (week.includes("all")) return "month";
    else return "week";
  }, [week]);
  const titleMonthOrWeek = useMemo(() => {
    console.log(week);

    if (week.includes("all")) return "Month";
    else return "Week";
  }, [week]);
  const columns1 = useMemo(
    () => [
      {
        title: `${titleMonthOrWeek}`,
        dataIndex: `${monthOrWeek}`,
        key: `${monthOrWeek}`,
        search: true,
      },
      {
        title: "Region",
        dataIndex: "region_tsel",
        key: "region_tsel",
        search: true,
      },
      {
        title: "Site ID",
        dataIndex: "site_id",
        key: "site_id",
        align: "center",
        search: true,
      },
      {
        title: `${dynamicTitle} Status`,
        key: `${dynamicKey}_status`,
        dataIndex: `${dynamicKey}_status`,
      },
      ...(dynamicKey === "packetloss"
        ? [
            {
              title: "DIST PL",
              key: "distribution_pl",
              dataIndex: "distribution_pl",
            },
          ]
        : []),
      {
        title: "Value",
        dataIndex: "value",
        key: "value",
        align: "center",
        search: true,
      },
      // {
      //   title: "Assesment CNQ",
      //   align: "center",
      //   children: [
      //     {
      //       title: "GROUP RCA",
      //       dataIndex: "RCA",
      //       key: "RCA",
      //       align: "center",
      //       search: true,
      //     },
      //     {
      //       title: "DETAIL RCA",
      //       dataIndex: "detail_rca",
      //       key: "detail_rca",
      //       align: "center",
      //       onHeaderCell: () => ({
      //         className: "!w-[300px] !p-3",
      //       }),
      //     },
      //     {
      //       title: "TICKET ID",
      //       dataIndex: "ticket",
      //       key: "ticket",
      //       align: "center",
      //     },
      //   ],
      // },
      {
        title: "Gropu Rca",
        dataIndex: "RCA",
        key: "RCA",
        align: "center",
        search: true,
      },
      {
        title: "Detail Rca",
        dataIndex: "detail_rca",
        key: "detail_rca",
        align: "center",
        search: true,
      },
      // {
      //   title: "Update Regional",
      //   align: "center",
      //   children: [
      //     {
      //       title: "GROUPING RCA",
      //       dataIndex: "grouping_rca",
      //       key: "grouping_rca",
      //       align: "center",
      //     },
      //     {
      //       title: "UPDATE PROGRES",
      //       dataIndex: "note",
      //       key: "note",
      //       align: "center",
      //     },
      //   ],
      // },

      // 's.grouping_rca_packetloss_cnq',
      // 's.last_update_packetloss_cnq',
      // 's.user_update_packetloss_cnq',
      // 's.grouping_rca_packetloss_regional',
      // 's.last_update_packetloss_regional',
      // 's.user_update_packetloss_regional'
      ,
      {
        title: `Update Progres Cnq`,
        key: `grouping_rca_${dynamicKey}_cnq`,
        dataIndex: `grouping_rca_${dynamicKey}_cnq`,
      },
      
      {
        title: `Last Update Cnq`,
        key: `last_update_${dynamicKey}_cnq`,
        dataIndex: `last_update_${dynamicKey}_cnq`,
      },

      {
        title: `User Update Cnq`,
        key: `user_update_${dynamicKey}_cnq`,
        dataIndex: `user_update_${dynamicKey}_cnq`,
      },
      
      ,
      {
        title: `Update Progres Regional`,
        key: `grouping_rca_${dynamicKey}_regional`,
        dataIndex: `grouping_rca_${dynamicKey}_regional`,
      },
      
      {
        title: `Last Update Regional`,
        key: `last_update_${dynamicKey}_regional`,
        dataIndex: `last_update_${dynamicKey}_regional`,
      },

      {
        title: `User Update Regional`,
        key: `user_update_${dynamicKey}_regional`,
        dataIndex: `user_update_${dynamicKey}_regional`,
      },
      {
        title: "EXCLUDED",
        key: "req",
        dataIndex: "button_req",
        align: "center",
      },
      {
        title: "Action",
        key: "action",
        dataIndex: "action",
        align: "center",
      },
    ],
    [dynamicKey, dynamicTitle, monthOrWeek, titleMonthOrWeek]
  );

  const columns2 = useMemo(
    () => [
      {
        title: "Month",
        dataIndex: "month",
        key: "month",
        align: "center",
        search: true,
      },
      {
        title: "No Ticket",
        dataIndex: "ticket_id",
        key: "ticket_id",
        align: "center",
        search: true,
      },
      {
        title: "Site Id",
        dataIndex: "site_id",
        key: "site_id",
        align: "center",
        search: true,
      },
      {
        title: "FINAL SEVERITY",
        dataIndex: "final_severity",
        key: "final_severity",
        align: "center",
      },
      {
        title: "WITEL",
        dataIndex: "witel",
        key: "witel",
        align: "center",
        search: true,
      },
      {
        title: "TRESHOLD",
        dataIndex: "treshold",
        key: "treshold",
        align: "center",
      },
      {
        title: "TTR AWAL",
        dataIndex: "ttr_customer_jam",
        key: "ttr_customer_jam",
        align: "center",
      },
      {
        title: "TTR SELISIH",
        dataIndex: "ttr_selisih",
        key: "ttr_selisih",
        align: "center",
      },
      {
        title: "TTR FINAL",
        key: "ttr_final",
        align: "center",
        dataIndex: "ttr_final",
      },
      // {
      //   title: "GROUPING ISSUE",
      //   dataIndex: "grouping_rca",
      //   key: "grouping_issue",
      //   align: "center",
      // },
      {
        title: "KET RECON",
        dataIndex: "detail_rca",
        key: "detail_rca",
        align: "center",
      },
      // {
      //   title: "INPUT EVIDENCE",
      //   dataIndex: "input_evidence",
      //   key: "input_evidence",
      //   align: "center",
      // },
      {
        title: "EXCLUDED",
        key: "req",
        dataIndex: "button_req",
        align: "center",
      },
      // {
      //   title: "SUBMIT",
      //   dataIndex: "submit",
      //   key: "submit",
      //   align: "center",
      // },
      {
        title: "Action",
        key: "action",
        dataIndex: "action",
        align: "center",
      },
    ],
    []
  );

  const { saveSite, getSite } = useSite();
  const columns = useMemo(() => {
    if (parameter.includes("mttrq")) {
      return columns2;
    }
    return columns1;
  }, [columns1, columns2, parameter]);

  const handleSave = async (payload) => {
    try {
      console.log("payload", payload?.evidance, payload.evidence.file)
      console.log("evidence", payload.evidence.file, payload.evidence, payload.evidence[0].originFileObj)
      const formData = new FormData();
      formData.append("id", payload.id);
      formData.append("month", payload.month);
      formData.append("week", payload.week);
      
      // formData.append("grouping_rca", payload.grouping_rca);
      // formData.append("grouping_rca_regional", payload.grouping_rca_regional);
      
      formData.append("grouping_rca_packetloss_cnq", payload?.grouping_rca_packetloss_cnq ?? '');
      formData.append("grouping_rca_packetloss_regional", payload?.grouping_rca_packetloss_regional ?? '');
      formData.append("grouping_rca_latency_cnq", payload?.grouping_rca_latency_cnq ?? '');
      formData.append("grouping_rca_latency_regional", payload?.grouping_rca_latency_regional ?? '');
      formData.append("grouping_rca_jitter_cnq", payload?.grouping_rca_jitter_cnq ?? '');
      formData.append("grouping_rca_jitter_regional", payload?.grouping_rca_jitter_regional ?? '');

      formData.append("detail_rca", payload.detail_rca);
      formData.append("evidence", payload.evidence[0].originFileObj || payload.evidence.file || payload.evidence);
      formData.append("site_id", payload.site_id);
      formData.append("ttr_selisih", payload.ttr_selisih);
      formData.append("note", payload.note);
      formData.append("parameter", parameter);
      formData.append("ticket", payload.ticket_id);
      formData.append("kpi", payload.kpi);
      formData.append("site_sos", payload.site_sos);

      await saveSite(formData).unwrap();
      setOpen(false);
      toast.success("Success Edit Rekonsiliasi");
      setTrigger((value) => value + 1);
    } catch (error) {
      console.log(error);
    } finally {
      setOpen(false);
    }
  };

  const openEdit = (value) => {
    setDataModal({ ...value, parameter });
    setOpen(true);
  };

  return (
    <div className="mt-8">
      <Table dataSource={dataSource} bordered className="rounded-xl">
        {columns.map((column) =>
          column.children ? (
            <ColumnGroup
              key={column.key ?? column.title}
              title={column.title}
              onHeaderCell={() => ({
                className: "!bg-blue-pacific",
              })}
            >
              {column.children.map((child) => (
                <Column
                  key={child.dataIndex}
                  title={child.title}
                  dataIndex={child.dataIndex}
                  width="fit-content"
                  align={child.align}
                  onHeaderCell={() => ({
                    className: "!bg-blue-pacific",
                  })}
                  fixed={child.fixed}
                  {...(child.search
                    ? getColumnSearchProps(child.dataIndex)
                    : {})}
                />
              ))}
            </ColumnGroup>
          ) : (
            <Column
              key={column.dataIndex}
              title={column.title}
              dataIndex={column.dataIndex}
              width={column.width}
              onHeaderCell={() => ({
                className: "!bg-blue-pacific",
              })}
              fixed={column.fixed}
              align={column.align}
              {...(column.search ? getColumnSearchProps(column.dataIndex) : {})}
              render={(text, record) => {
                const statusDouble =
                  record.exclude > 1 ||
                  record.status_latency > 1 ||
                  record.status_jitter > 1 ||
                  record.status_packetloss_15 > 1 ||
                  record.status_packetloss_5 > 1;
                if (column.dataIndex?.startsWith("site") && statusDouble)
                  return (
                    <div className="flex justify-center items-center gap-2">
                      <span className="italic">{text}</span>
                      <span className="bg-red-500 w-2 h-2 rounded-full"></span>
                    </div>
                  );
                if (column.dataIndex?.startsWith("button")) {
                  // return <Checkbox />;
                  return (
                    <Checkbox
                      checked={
                        record.exclude === 2 ||
                        record.status_latency === 2 ||
                        record.status_packetloss_5 === 2 ||
                        record.status_packetloss_15 === 2 ||
                        record.status_jitter === 2
                      }
                      // disabled={!editable} // optional: bisa dibuat conditional
                    />
                  );
                } else if (column.dataIndex?.startsWith("input")) {
                  return <p className="italic">Input Here</p>;
                } else if (column.dataIndex?.startsWith("action")) {
                  return (
                    <EditOutlined
                      className="cursor-pointer"
                      onClick={() => openEdit(record)}
                    />
                  );
                }
                if (column.dataIndex == "ttr_final") {
                  const parseTimeToMinutes = (time) => {
                    const parts = time.split(":").map(Number);
                    const hours = parts[0] || 0;
                    const minutes = parts[1] || 0;
                    const seconds = parts[2] || 0;
                    return hours * 60 + minutes + Math.floor(seconds / 60);
                  };

                  const awalTime = record.ttr_customer_jam || "00:00";
                  const selisihTime = record.ttr_selisih || "00:00";

                  const totalAwal = parseTimeToMinutes(awalTime);
                  const totalSelisih = parseTimeToMinutes(selisihTime);
                  const finalMinutes = totalAwal - totalSelisih;

                  if (finalMinutes < 0) return "00:00";

                  const hours = Math.floor(finalMinutes / 60);
                  const mins = finalMinutes % 60;
                  return (
                    <span>
                      {`${hours.toString().padStart(2, "0")}:${mins
                        .toString()
                        .padStart(2, "0")}`}
                    </span>
                  );
                }
                return text;
              }}
            />
          )
        )}
      </Table>
      <ModalInput
        open={open}
        parameter={parameter}
        dataModal={dataModal}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        week={week}
      />
    </div>
  );
};

export { TableInputSite };
