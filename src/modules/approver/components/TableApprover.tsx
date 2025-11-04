// Antd
import { Button, Checkbox, Input, InputRef, Space, Table } from "antd";
import ModalInput from "./ModalInput";
import { useMemo, useRef, useState } from "react";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import {
  useLazyApprover_fetchDataQuery,
  useSaveApproverMutation,
} from "../rtk/approver.rtk";
import { toast } from "react-toastify";
import Highlighter from "react-highlight-words";
import { FilterDropdownProps } from "antd/es/table/interface";

const { Column, ColumnGroup } = Table;

const TableApprover = ({ data }) => {
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

  const columns = useMemo(
    () => [
      {
        title: "Week",
        dataIndex: "week",
        key: "week",
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
        title: "Status",
        key: "status",
        dataIndex: "status",
        render: (value) => {
          console.log("value", value);
          switch (value) {
            case 1:
              return "Pending";
            case 2:
              return "Disetujui";
            case 3:
              return "Ditolak";
            default:
              return "-";
          }
        },
      },
      {
        title: "Assesment CNQ",
        align: "center",
        children: [
          {
            title: "GROUP RCA",
            dataIndex: "RCA",
            key: "RCA",
            align: "center",
            search: true,
          },
          {
            title: "DETAIL RCA",
            dataIndex: "detail_rca",
            key: "detail_rca",
            align: "center",
            onHeaderCell: () => ({
              className: "!w-[300px] !p-3",
            }),
          },
          {
            title: "TICKET ID",
            dataIndex: "ticket_id",
            key: "ticket_id",
            align: "center",
          },
        ],
      },
      {
        title: "Update Regional",
        align: "center",
        children: [
          {
            title: "GROUPING RCA",
            dataIndex: "grouping_rca",
            key: "grouping_rca",
            align: "center",
          },
          {
            title: "UPDATE PROGRES",
            dataIndex: "note",
            key: "note",
            align: "center",
          },
        ],
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
    []
  );

  const [getApprover] = useLazyApprover_fetchDataQuery();
  const [saveApprover] = useSaveApproverMutation();

  const handleSave = async (payload) => {
    try {
      const formData = new FormData();
      formData.append("id", payload.id);
      formData.append("month", payload.month);
      formData.append("week", payload.week);
      formData.append("grouping_rca", payload.grouping_rca);
      formData.append("detail_rca", payload.detail_rca);
      formData.append("evidence", payload.evidence.file || payload.evidence);
      formData.append("site_id", payload.site_id);
      formData.append("ttr_selisih", payload.ttr_selisih);
      formData.append("note", payload.note);
      formData.append("ticket", payload.ticket_id);
      formData.append("status", payload.status);
      formData.append("site_sos", payload.site_sos);

      await saveApprover(formData).unwrap();
      await getApprover({}).unwrap();
      setOpen(false);
      toast.success("Success Edit Rekonsiliasi");
    } catch (error) {
      toast.error("Failed Edit Rekonsiliasi");
      console.log(error);
    } finally {
      setOpen(false);
    }
  };

  const openEdit = (value) => {
    setDataModal({ ...value });
    setOpen(true);
  };

  return (
    <div className="mt-8">
      <Table dataSource={data?.data} bordered className="rounded-xl">
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
                  record.status_latency > 1 ||
                  record.status_jitter > 1 ||
                  record.status_packetloss_15 > 1 ||
                  record.status_packetloss_5 > 1;
                if (column.dataIndex?.startsWith("site") && statusDouble)
                  return (
                    <div className="flex gap-2 items-center">
                      <span className="italic">{text} </span>
                      <span className="bg-red-500 w-2 h-2 rounded-full">
                        &nbsp;
                      </span>
                    </div>
                  );
                if (column.dataIndex?.startsWith("button")) {
                  // return <Checkbox />;
                  return (
                    <Checkbox
                      checked={
                        record.status_latency === 2 ||
                        record.status_packetloss_5 === 2 ||
                        record.status_packetloss_15 === 2 ||
                        record.status_jitter === 2 ||
                        record.status === 2
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
                if (column.dataIndex == "status") {
                  switch (text) {
                    case 1:
                      return "Pending";
                    case 2:
                      return "Disetujui";
                    case 3:
                      return "Ditolak";
                    default:
                      return "-";
                  }
                }
                return text;
              }}
            />
          )
        )}
      </Table>
      <ModalInput
        open={open}
        dataModal={dataModal}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export { TableApprover };
