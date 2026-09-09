// Antd
import {
  Button,
  Checkbox,
  Input,
  InputRef,
  Skeleton,
  Space,
  Table,
} from "antd";
import ModalInput from "./ModalInput";
import { useMemo, useRef, useState } from "react";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import { useSite } from "../hooks/site.hooks";
import { toast } from "react-toastify";
import Highlighter from "react-highlight-words";
import { FilterDropdownProps } from "antd/es/table/interface";
import type { Key } from "react";

const { Column, ColumnGroup } = Table;

const RCA_FILTER_FALLBACK = [
  "Technical Unknown",
  "Technical TSEL",
  "Cap End Site Need Order",
  "Temperature TSEL",
  "Cap End Site Order",
  "Technical TIF",
  "Routing TSEL",
  "Routing TIF",
  "Cap Intermediate / Hub",
  "QE Redaman",
  "Power TSEL",
  "Hardware / Software Capability",
  "Gamas SKKL",
  "Gamas Repetitive",
  "Gamas FO Darat / SKSO",
  "Cap OLT",
  "Warranty Redeploy",
  "Obstacle",
  "Force Majeur",
  "ISR Segel Balmon",
  "ISR Interference Internal",
  "ISR Interference External",
  "Cap 3rd Party",
];

type ColumnSearch = { field: string; value: string } | null;

// Kolom yang difilter lewat filter[field][] di backend. Kolom lain memakai
// kotak search bebas (search + searchable).
const CHECKBOX_FILTER_FIELDS = [
  "region_tsel",
  "status_saat_ini",
  "distribution_pl",
  "grouping_rca",
];

interface TableHistoryProps {
  dataSource: Record<string, unknown>[];
  isLoading?: boolean;
  parameter: string;
  week;
  month;
  year;
  tableKey: string;
  setTrigger: React.Dispatch<React.SetStateAction<number>>;
  pagination;
  setPagination: React.Dispatch<any>;
  columnFilters: Record<string, string[]>;
  setColumnFilters: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >;
  columnSearch: ColumnSearch;
  setColumnSearch: React.Dispatch<React.SetStateAction<ColumnSearch>>;
  filterOptions?: Record<string, string[]>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const TableInputSite: React.FC<TableHistoryProps> = ({
  dataSource,
  isLoading = false,
  parameter,
  week,
  month,
  year,
  tableKey,
  setTrigger,
  pagination,
  setPagination,
  columnFilters,
  setColumnFilters,
  columnSearch,
  setColumnSearch,
  filterOptions,
  setSearch,
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const formatTableValue = (value: unknown): string | number => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    // Sebagian baris menyimpan string "undefined"/"null" dari data lama.
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (!normalized || normalized === "undefined" || normalized === "null") {
        return "-";
      }
    }

    return typeof value === "number" ? value : String(value);
  };

  const renderTableValue = (value: unknown) => formatTableValue(value);

  // Semua penyaringan dikerjakan di server: checkbox lewat filter[field][],
  // kotak search per kolom lewat search + searchable.
  const getCheckboxFilterValue = (field: string): Key[] =>
    columnFilters[field] ?? [];

  const getColumnSearchValue = (dataIndex: string): Key[] =>
    columnSearch?.field === dataIndex ? [columnSearch.value] : [];

  const setColumnSearchValue = (dataIndex: string, values: Key[]) => {
    const value = values.length ? String(values[0]) : "";
    setSearch("");
    setColumnSearch(value ? { field: dataIndex, value } : null);
  };

  // Opsi filter diambil dari `options` pada response, fallback ke daftar statis.
  const buildFilters = (
    optionKey: string,
    fallback: string[],
    mergeFallback = false,
  ) => {
    const fromResponse = filterOptions?.[optionKey] ?? [];
    const source = mergeFallback
      ? [...fallback, ...fromResponse]
      : fromResponse.length
        ? fromResponse
        : fallback;
    const seen = new Set<string>();

    return source
      .map((item) => String(item ?? "").trim())
      .filter((item) => {
        if (!item || item.toLowerCase() === "undefined") return false;
        const key = item.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((item) => ({ text: item, value: item }));
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    setColumnSearchValue(dataIndex, selectedKeys as Key[]);
  };

  const handleReset = (
    clearFilters: () => void,
    selectedKeys,
    confirm,
    dataIndex,
  ) => {
    clearFilters();
    setSearchText("");
    setColumnSearchValue(dataIndex, []);
    confirm();
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
    filteredValue: getColumnSearchValue(dataIndex),
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
                dataIndex,
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
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      formatTableValue(text) === "-" ? (
        "-"
      ) : searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={String(formatTableValue(text))}
        />
      ) : (
        formatTableValue(text)
      ),
  });

  const [open, setOpen] = useState(false);
  const [dataModal, setDataModal] = useState({});
  const skeletonRows = useMemo(
    () =>
      Array.from({ length: 17 }, (_, index) => ({
        __skeleton: true,
        id: `skeleton-${index}`,
      })),
    [],
  );
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
  const groupingRcaCnq: Record<"packetloss" | "latency" | "jitter", any> = {
    packetloss: {
      title: `Update Progres`,
      key: `update_progress_packetloss`,
      dataIndex: `update_progress_packetloss`,
      search: true,
    },
    latency: {
      title: `Update Progres`,
      key: `update_progress_latency`,
      dataIndex: `update_progress_latency`,
      search: true,
    },
    jitter: {
      title: `Update Progres`,
      key: `update_progress_jitter`,
      dataIndex: `update_progress_jitter`,
      search: true,
    },
  } as const;

  type DynamicKey = "packetloss" | "latency" | "jitter";

  const columns1 = useMemo(
    () => [
      {
        title: "No",
        key: "no",
        render: (text, record, index) =>
          (pagination.current - 1) * pagination.pageSize + index + 1,
      },
      {
        title: "Week",
        dataIndex: "week",
        key: "week",
        search: true,
        render: (_text, record) => formatTableValue(week || record.week || _text),
      },
      {
        title: "Region",
        dataIndex: "region_tsel",
        key: "region_tsel",
        filters: buildFilters("region_tsel", [
          "SUMBAGUT",
          "SUMBAGTENG",
          "SUMBAGSEL",
          "JABOTABEK INNER",
          "JABOTABEK OUTER",
          "JAWA BARAT",
          "JAWA TENGAH",
          "JAWA TIMUR",
          "BALI NUSRA",
          "KALIMANTAN",
          "SULAWESI",
          "PUMA",
        ]),
        filterSearch: true,
        filterMultiple: true,
        filteredValue: getCheckboxFilterValue("region_tsel"),
      },
      { title: "Area", dataIndex: "area", key: "area", search: true },
      {
        title: "District",
        dataIndex: "district",
        key: "district",
        search: true,
      },
      {
        title: "Site ID",
        dataIndex: "site_id",
        key: "site_id",
        align: "center",
        search: true,
      },
      ...(parameter.includes("packetloss")
        ? [
            {
              title: "Status Saat Ini",
              dataIndex: "status_saat_ini",
              key: "status_saat_ini",
              align: "center",
              filters: buildFilters("status_saat_ini", [
                "CLEAR",
                "CONSECUTIVE",
                "NOT CLEAR",
              ]),
              filterSearch: true,
              filterMultiple: true,
              filteredValue: getCheckboxFilterValue("status_saat_ini"),
            },
          ]
        : []),
      {
        title: `${dynamicTitle} Status`,
        key: `${dynamicKey}_status`,
        dataIndex: `${dynamicKey}_status`,
        search: true,
      },
      ...(dynamicKey === "packetloss"
        ? [
            // {
            //   title: "DIST PL",
            //   key: "distribution_pl",
            //   dataIndex: "distribution_pl",
            //   search: true,
            // },
            {
              title: "DIST PL",
              dataIndex: "distribution_pl",
              key: "distribution_pl",
              filters: buildFilters("distribution_pl", ["1-5%", ">5%"]),
              filterSearch: true,
              filterMultiple: true,
              filteredValue: getCheckboxFilterValue("distribution_pl"),
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
      // {
      //   title: "Group RCA",
      //   dataIndex: "RCA",
      //   key: "RCA",
      //   align: "center",
      //   search: true,
      // },
      {
        title: "Group RCA",
        // Field yang ditampilkan sengaja sama dengan field yang difilter
        // (filter[grouping_rca][]) supaya isi kolom dan hasil filter cocok.
        dataIndex: "grouping_rca",
        key: "grouping_rca",
        filters: buildFilters("grouping_rca", RCA_FILTER_FALLBACK),
        filterSearch: true,
        filterMultiple: true,
        filteredValue: getCheckboxFilterValue("grouping_rca"),
      },
      {
        title: "Detail RCA",
        dataIndex: "detail_rca",
        key: "detail_rca",
        align: "center",
        search: true,
        width: 220,
        ellipsis: true,
        render: renderTableValue,
      },
      // {
      //   title: `Update Progres Cnq`,
      //   key: `grouping_rca_${dynamicKey}_cnq`,
      //   dataIndex: `grouping_rca_${dynamicKey}_cnq`,
      // },
      ...(groupingRcaCnq[dynamicKey as DynamicKey]
        ? [groupingRcaCnq[dynamicKey as DynamicKey]]
        : []),
      {
        title: `Last Update`,
        key: `last_update_${dynamicKey}_cnq`,
        dataIndex: `last_update_${dynamicKey}_cnq`,
      },

      {
        title: `User Update`,
        key: `user_update_${dynamicKey}_cnq`,
        dataIndex: `user_update_${dynamicKey}_cnq`,
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
    [
      columnFilters,
      columnSearch,
      filterOptions,
      dynamicKey,
      dynamicTitle,
      parameter,
    ],
  );

  const columns2 = useMemo(
    () => [
      {
        title: "No",
        key: "no",
        render: (text, record, index) =>
          (pagination.current - 1) * pagination.pageSize + index + 1,
      },
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
        title: "District",
        dataIndex: "district",
        key: "district",
        align: "center",
        search: true,
      },
      ...(parameter.includes("packetloss")
        ? [
            {
              title: "Status Saat Ini",
              dataIndex: "status_saat_ini",
              key: "status_saat_ini",
              align: "center",
              filters: buildFilters("status_saat_ini", [
                "CLEAR",
                "CONSECUTIVE",
                "NOT CLEAR",
              ]),
              filterSearch: true,
              filterMultiple: true,
              filteredValue: getCheckboxFilterValue("status_saat_ini"),
            },
          ]
        : []),
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
        width: 220,
        ellipsis: true,
        render: renderTableValue,
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
    [columnFilters, columnSearch, filterOptions, parameter],
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
      console.log("payload", payload);
      // console.log(
      //   "evidence",
      //   payload.evidence.file,
      //   payload.evidence,
      //   payload.evidence[0].originFileObj
      // );
      const formData = new FormData();
      formData.append("id", payload.id);
      formData.append("year", payload.year);
      formData.append("month", payload.month);
      formData.append("week", payload.week);

      formData.append(
        "rca_rekonsiliasi",
        payload?.rca_packetloss ?? payload?.rca_latency ?? payload?.rca_jitter,
      );
      // formData.append("update_progress", payload?.update_progress_packetloss ?? payload?.update_progress_latency ?? payload?.update_progress_jitter);
      formData.append("update_progress", payload?.group22);

      formData.append("grouping_rca", payload.grouping_rca);
      // formData.append("grouping_rca_regional", payload.grouping_rca_regional);

      switch (parameter) {
        case "packetloss ran to core":
          formData.append(
            "grouping_rca_packetloss_cnq_1",
            payload?.group1 ?? "",
          );

          // formData.append(
          //   "grouping_rca_packetloss_regional_1",
          //   payload?.group1 ?? ""
          // );
          formData.append(
            "grouping_rca_packetloss_cnq_2",
            payload?.group2 ?? "",
          );
          // formData.append(
          //   "grouping_rca_packetloss_regional_2",
          //   payload?.group2 ?? ""
          // );
          // formData.append("update_progress_packetloss", payload?.group22);
          break;
        case "latency ran to core":
          formData.append("grouping_rca_latency_cnq_1", payload?.group1 ?? "");
          // formData.append(
          //   "grouping_rca_latency_regional_1",
          //   payload?.grouping_rca_latency_regional_1 ?? ""
          // );
          formData.append("grouping_rca_latency_cnq_2", payload?.group2 ?? "");
          // formData.append(
          //   "grouping_rca_latency_regional_2",
          //   payload?.grouping_rca_latency_regional_2 ?? ""
          // );
          // formData.append("update_progress_latency", payload?.group22);
          break;
        case "jitter ran to core":
          formData.append("grouping_rca_jitter_cnq_1", payload?.group1 ?? "");
          // formData.append(
          //   "grouping_rca_jitter_regional_1",
          //   payload?.grouping_rca_jitter_regional_1 ?? ""
          // );
          formData.append("grouping_rca_jitter_cnq_2", payload?.group2 ?? "");
          // formData.append(
          //   "grouping_rca_jitter_regional_2",
          //   payload?.grouping_rca_jitter_regional_2 ?? ""
          // );
          // formData.append("update_progress_jitter", payload?.group22);
          break;

        default:
          break;
      }

      switch (parameter) {
        case "packetloss ran to core":
          formData.append(
            "status_progress_packetloss",
            payload?.status_progress ?? "",
          );
          formData.append("tanggal_action_packetloss", payload?.date ?? "");
          break;
        case "latency ran to core":
          formData.append(
            "status_progress_latency",
            payload?.status_progress ?? "",
          );
          formData.append("tanggal_action_latency", payload?.date ?? "");
          break;
        case "jitter ran to core":
          formData.append(
            "status_progress_jitter",
            payload?.status_progress ?? "",
          );
          formData.append("tanggal_action_jitter", payload?.date ?? "");
          break;

        default:
          break;
      }

      formData.append("detail_rca", payload?.detail_rca);
      // formData.append(
      //   "evidence",
      //   payload?.evidence[0]?.originFileObj ||
      //     payload?.evidence?.file ||
      //     payload?.evidence
      // );
      let evidenceFile = null;
      if (Array.isArray(payload?.evidence) && payload.evidence.length > 0) {
        evidenceFile = payload.evidence[0]?.originFileObj;
      } else if (payload?.evidence?.file) {
        evidenceFile = payload.evidence.file;
      } else if (payload?.evidence) {
        evidenceFile = payload.evidence;
      }

      if (evidenceFile) {
        formData.append("evidence", evidenceFile);
      }
      formData.append("site_id", payload.site_id);
      formData.append("ttr_selisih", payload.ttr_selisih);
      formData.append("note", payload.note);
      formData.append("parameter", parameter);
      formData.append("ticket", payload.ticket_id);
      formData.append("kpi", payload.kpi);
      formData.append("site_sos", payload.site_sos);
      formData.append("site_exclude", payload.site_exclude);

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

  const tableData = isLoading ? skeletonRows : dataSource;
  const isSkeletonRow = (record: Record<string, unknown>) =>
    Boolean((record as { __skeleton?: boolean }).__skeleton);
  const resolvedTableData = useMemo(() => {
    if (isLoading) return skeletonRows;

    return tableData.map((record, index) => ({
      ...record,
      __tableKey: `${tableKey}-${index}-${String(
        record.id ??
          record.site_id ??
          record.ticket_id ??
          record.no ??
          record.month ??
          record.week ??
          record.RCA ??
          record.detail_rca ??
          record.action ??
          record.button_req,
      )}`,
    }));
  }, [isLoading, skeletonRows, tableData, tableKey]);

  return (
    <div key={tableKey} className="mt-8 min-w-max">
      <Table
        key={tableKey}
        dataSource={resolvedTableData}
        bordered
        className="rounded-xl"
        pagination={
          pagination
            ? {
                current: pagination.current || 1,
                pageSize: pagination.pageSize || 10,
                defaultPageSize: 10,
                total: pagination.total || 0,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }
            : false
        }
        rowKey={(record) =>
          String(
            (record as Record<string, unknown>).__tableKey ??
              `${tableKey}-${
                record.id ??
                record.site_id ??
                record.ticket_id ??
                record.no ??
                record.month ??
                record.week ??
                record.RCA ??
                record.detail_rca ??
                record.action ??
                record.button_req
              }`,
          )
        }
        onChange={(pag, filters) => {
          // Kolom checkbox boleh aktif bersamaan (filter[field][]), sedangkan
          // kotak search per kolom hanya satu karena berbagi param `search`.
          const nextColumnFilters: Record<string, string[]> = {};
          const searchEntries: (readonly [string, string[]])[] = [];

          Object.entries(filters).forEach(([key, value]) => {
            const values = (value ?? []).map(String);
            if (!values.length) return;
            if (CHECKBOX_FILTER_FIELDS.includes(key)) {
              nextColumnFilters[key] = values;
              return;
            }
            searchEntries.push([key, values] as const);
          });

          const changedSearch = searchEntries.find(
            ([key, values]) =>
              key !== columnSearch?.field || values[0] !== columnSearch?.value,
          );
          const nextColumnSearch: ColumnSearch = changedSearch
            ? { field: changedSearch[0], value: changedSearch[1][0] }
            : searchEntries.length
              ? columnSearch
              : null;

          const filtersChanged =
            JSON.stringify(nextColumnFilters) !== JSON.stringify(columnFilters);
          const searchChanged =
            nextColumnSearch?.field !== columnSearch?.field ||
            nextColumnSearch?.value !== columnSearch?.value;

          setPagination((prev: any) => ({
            ...prev,
            ...pag,
            current:
              filtersChanged || searchChanged ? 1 : (pag.current ?? 1),
            pageSize: pag.pageSize ?? prev?.pageSize ?? 10,
          }));

          if (filtersChanged) setColumnFilters(nextColumnFilters);
          if (searchChanged) {
            setSearch("");
            setColumnSearch(nextColumnSearch);
          }
        }}
      >
        {columns.map((column, columnIndex) =>
          column.children ? (
            <ColumnGroup
              key={
                column.key ?? column.dataIndex ?? column.title ?? columnIndex
              }
              title={column.title}
              onHeaderCell={() => ({
                className: "!bg-blue-pacific",
              })}
            >
              {column.children.map((child, childIndex) => (
                <Column
                  key={
                    child.key ?? child.dataIndex ?? child.title ?? childIndex
                  }
                  title={child.title}
                  dataIndex={child.dataIndex}
                  width="fit-content"
                  align={child.align}
                  onHeaderCell={() => ({
                    className: "!bg-blue-pacific",
                  })}
                  fixed={child.fixed}
                  render={child.render ?? renderTableValue}
                  {...(child.search
                    ? getColumnSearchProps(child.dataIndex)
                    : {})}
                />
              ))}
            </ColumnGroup>
          ) : (
            <Column
              key={
                column.key ?? column.dataIndex ?? column.title ?? columnIndex
              }
              title={column.title}
              dataIndex={column.dataIndex}
              width={column.width}
              onHeaderCell={() => ({
                className: "!bg-blue-pacific",
              })}
              fixed={column.fixed}
              align={column.align}
              filters={column.filters}
              filteredValue={column.filteredValue}
              filterSearch={column.filterSearch}
              filterMultiple={column.filterMultiple}
              onFilter={column.onFilter}
              {...(column.search ? getColumnSearchProps(column.dataIndex) : {})}
              render={(text, record, index) => {
                if (isSkeletonRow(record)) {
                  if (column.key === "no") {
                    return (
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: 40 }}
                      />
                    );
                  }

                  if (
                    column.dataIndex?.startsWith("button") ||
                    column.dataIndex === "action"
                  ) {
                    return (
                      <div className="flex justify-center">
                        <Skeleton.Avatar active size="small" shape="square" />
                      </div>
                    );
                  }

                  return (
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: column.width || "100%" }}
                    />
                  );
                }

                if (column.key === "no") {
                  return (
                    (pagination.current - 1) * pagination.pageSize + index + 1
                  );
                }
                let statusDouble = false;
                let isChecked = false;

                if (parameter?.includes("packetloss")) {
                  statusDouble =
                    Number(record.exclude) > 1 ||
                    Number(record.status_packetloss_15) > 1 ||
                    Number(record.status_packetloss_5) > 1;
                  isChecked =
                    record.exclude === 2 ||
                    record.status_packetloss_15 === 2 ||
                    record.status_packetloss_5 === 2;
                } else if (parameter?.includes("jitter")) {
                  statusDouble =
                    Number(record.exclude) > 1 ||
                    Number(record.status_jitter) > 1;
                  isChecked =
                    record.exclude === 2 ||
                    record.status_jitter === 2;
                } else if (parameter?.includes("latency")) {
                  statusDouble =
                    Number(record.exclude) > 1 ||
                    Number(record.status_latency) > 1;
                  isChecked =
                    record.exclude === 2 ||
                    record.status_latency === 2;
                } else {
                  statusDouble =
                    Number(record.exclude) > 1 ||
                    Number(record.status_latency) > 1 ||
                    Number(record.status_jitter) > 1 ||
                    Number(record.status_packetloss) > 1;
                  isChecked =
                    record.exclude === 2 ||
                    record.status_latency === 2 ||
                    record.status_packetloss === 2 ||
                    record.status_jitter === 2;
                }
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
                      checked={isChecked}
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
                  if (
                    record.ttr_customer_jam === null ||
                    record.ttr_customer_jam === undefined ||
                    record.ttr_selisih === null ||
                    record.ttr_selisih === undefined ||
                    record.ttr_customer_jam === "" ||
                    record.ttr_selisih === ""
                  ) {
                    return "-";
                  }

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
                return formatTableValue(text);
              }}
            />
          ),
        )}
      </Table>
      <ModalInput
        open={open}
        parameter={parameter}
        dataModal={dataModal}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        week={week}
        year={year}
      />
    </div>
  );
};

export { TableInputSite };
