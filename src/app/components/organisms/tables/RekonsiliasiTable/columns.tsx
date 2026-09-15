import { Checkbox, IconEdit } from "@/app/components/atoms";

import {
  buildFilterOptions,
  calculateTtrFinal,
  formatTableValue,
} from "@/app/utils/table.utils";

import type { TableColumn } from "@/app/types/table.types";
import type {
  RekonsiliasiFilterOptions,
  RekonsiliasiRow,
} from "@/app/types/reconsiliation/rekonsiliasi.types";

type DynamicKey = "packetloss" | "latency" | "jitter";

export interface BuildColumnsParams {
  parameter: string;
  week: string;
  pagination: { current: number; pageSize: number };
  filterOptions?: RekonsiliasiFilterOptions;
  onEdit: (row: RekonsiliasiRow) => void;
}

const getDynamicKey = (parameter: string): DynamicKey | undefined => {
  if (parameter.includes("packetloss")) return "packetloss";
  if (parameter.includes("jitter")) return "jitter";
  if (parameter.includes("latency")) return "latency";
  return undefined;
};

const getDynamicTitle = (parameter: string) => {
  if (parameter.includes("packetloss")) return "PL";
  if (parameter.includes("jitter")) return "Jitter";
  if (parameter.includes("latency")) return "Latency";
  return "";
};

const getExcludeState = (record: RekonsiliasiRow, parameter: string) => {
  const toNumber = (value: unknown) => Number(value ?? 0);

  if (parameter.includes("packetloss")) {
    return {
      isDouble:
        toNumber(record.exclude) > 1 ||
        toNumber(record.status_packetloss_15) > 1 ||
        toNumber(record.status_packetloss_5) > 1,
      isChecked:
        record.exclude === 2 ||
        record.status_packetloss_15 === 2 ||
        record.status_packetloss_5 === 2,
    };
  }

  if (parameter.includes("jitter")) {
    return {
      isDouble:
        toNumber(record.exclude) > 1 || toNumber(record.status_jitter) > 1,
      isChecked: record.exclude === 2 || record.status_jitter === 2,
    };
  }

  if (parameter.includes("latency")) {
    return {
      isDouble:
        toNumber(record.exclude) > 1 || toNumber(record.status_latency) > 1,
      isChecked: record.exclude === 2 || record.status_latency === 2,
    };
  }

  return {
    isDouble:
      toNumber(record.exclude) > 1 ||
      toNumber(record.status_latency) > 1 ||
      toNumber(record.status_jitter) > 1 ||
      toNumber(record.status_packetloss) > 1,
    isChecked:
      record.exclude === 2 ||
      record.status_latency === 2 ||
      record.status_packetloss === 2 ||
      record.status_jitter === 2,
  };
};

const createColumnBuilders = ({
  parameter,
  pagination,
  filterOptions,
  onEdit,
}: BuildColumnsParams) => {
  const checkboxFilter = (field: string) =>
    ({
      type: "checkbox",
      field,
      options: buildFilterOptions(filterOptions?.[field]),
    }) as const;

  const searchFilter = (field: string) => ({ type: "search", field }) as const;

  const numberColumn: TableColumn<RekonsiliasiRow> = {
    key: "no",
    title: "No",
    width: 56,
    align: "center",
    render: (_value, _row, index) =>
      (pagination.current - 1) * pagination.pageSize + index + 1,
  };

  const excludeColumn: TableColumn<RekonsiliasiRow> = {
    key: "req",
    title: "EXCLUDED",
    dataIndex: "button_req",
    align: "center",
    width: 90,
    render: (_value, row) => (
      <span className="flex justify-center">
        <Checkbox checked={getExcludeState(row, parameter).isChecked} />
      </span>
    ),
  };

  const actionColumn: TableColumn<RekonsiliasiRow> = {
    key: "action",
    title: "Action",
    align: "center",
    width: 70,
    fixedRight: true,
    render: (_value, row) => (
      <button
        type="button"
        aria-label="Ubah data"
        onClick={() => onEdit(row)}
        className="text-[#0E2133] hover:text-brand-secondary"
      >
        <IconEdit size={16} />
      </button>
    ),
  };

  const siteIdColumn = (title: string): TableColumn<RekonsiliasiRow> => ({
    key: "site_id",
    title,
    dataIndex: "site_id",
    align: "center",
    width: 110,
    filter: searchFilter("site_id"),
    render: (value, row) => {
      if (!getExcludeState(row, parameter).isDouble) {
        return formatTableValue(value);
      }

      return (
        <span className="flex items-center justify-center gap-2">
          <span className="italic">{formatTableValue(value)}</span>
          <span className="h-2 w-2 rounded-full bg-red-500" />
        </span>
      );
    },
  });

  return {
    checkboxFilter,
    searchFilter,
    numberColumn,
    excludeColumn,
    actionColumn,
    siteIdColumn,
  };
};

export const buildAccessColumns = (
  params: BuildColumnsParams,
): TableColumn<RekonsiliasiRow>[] => {
  const { parameter, week } = params;
  const {
    checkboxFilter,
    searchFilter,
    numberColumn,
    excludeColumn,
    actionColumn,
    siteIdColumn,
  } = createColumnBuilders(params);

  const dynamicKey = getDynamicKey(parameter);
  const dynamicTitle = getDynamicTitle(parameter);

  return [
    numberColumn,
    {
      key: "week",
      title: "Week",
      dataIndex: "week",
      width: 80,
      align: "center",
      filter: searchFilter("week"),
      render: (value, row) => formatTableValue(week || row.week || value),
    },
    {
      key: "region_tsel",
      title: "Region",
      dataIndex: "region_tsel",
      width: 130,
      filter: checkboxFilter("region_tsel"),
    },
    {
      key: "area",
      title: "Area",
      dataIndex: "area",
      width: 90,
      filter: searchFilter("area"),
    },
    {
      key: "district",
      title: "District",
      dataIndex: "district",
      width: 120,
      filter: searchFilter("district"),
    },
    siteIdColumn("Site ID"),
    ...(parameter.includes("packetloss")
      ? [
          {
            key: "status_saat_ini",
            title: "Status Saat Ini",
            dataIndex: "status_saat_ini",
            align: "center" as const,
            width: 160,
            filter: checkboxFilter("status_saat_ini"),
          },
        ]
      : []),
    {
      key: `${dynamicKey}_status`,
      title: `${dynamicTitle} Status`,
      dataIndex: `${dynamicKey}_status`,
      width: 120,
      align: "center",
      filter: searchFilter(`${dynamicKey}_status`),
    },
    ...(dynamicKey === "packetloss"
      ? [
          {
            key: "distribution_pl",
            title: "DIST PL",
            dataIndex: "distribution_pl",
            align: "center" as const,
            width: 100,
            filter: checkboxFilter("distribution_pl"),
          },
        ]
      : []),
    {
      key: "value",
      title: "Value",
      dataIndex: "value",
      align: "center",
      width: 90,
      filter: searchFilter("value"),
    },
    {
      key: "grouping_rca",
      title: "Group RCA",
      dataIndex: "grouping_rca",
      width: 170,
      filter: checkboxFilter("grouping_rca"),
    },
    {
      key: "detail_rca",
      title: "Detail RCA",
      dataIndex: "detail_rca",
      align: "center",
      width: 290,
      wrap: true,
      filter: searchFilter("detail_rca"),
    },
    ...(dynamicKey
      ? [
          {
            key: `update_progress_${dynamicKey}`,
            title: "Update Progres",
            dataIndex: `update_progress_${dynamicKey}`,
            width: 170,
            filter: searchFilter(`update_progress_${dynamicKey}`),
          },
        ]
      : []),
    {
      key: `last_update_${dynamicKey}_cnq`,
      title: "Last Update",
      dataIndex: `last_update_${dynamicKey}_cnq`,
      width: 180,
      align: "center",
    },
    {
      key: `user_update_${dynamicKey}_cnq`,
      title: "User Update",
      dataIndex: `user_update_${dynamicKey}_cnq`,
      width: 110,
      align: "center",
    },
    excludeColumn,
    actionColumn,
  ];
};

export const buildMttrqColumns = (
  params: BuildColumnsParams,
): TableColumn<RekonsiliasiRow>[] => {
  const { parameter } = params;
  const {
    checkboxFilter,
    searchFilter,
    numberColumn,
    excludeColumn,
    actionColumn,
    siteIdColumn,
  } = createColumnBuilders(params);

  return [
    numberColumn,
    {
      key: "month",
      title: "Month",
      dataIndex: "month",
      align: "center",
      width: 90,
      filter: searchFilter("month"),
    },
    {
      key: "ticket_id",
      title: "No Ticket",
      dataIndex: "ticket_id",
      align: "center",
      width: 140,
      filter: searchFilter("ticket_id"),
    },
    siteIdColumn("Site Id"),
    {
      key: "district",
      title: "District",
      dataIndex: "district",
      align: "center",
      width: 120,
      filter: searchFilter("district"),
    },
    ...(parameter.includes("packetloss")
      ? [
          {
            key: "status_saat_ini",
            title: "Status Saat Ini",
            dataIndex: "status_saat_ini",
            align: "center" as const,
            width: 160,
            filter: checkboxFilter("status_saat_ini"),
          },
        ]
      : []),
    {
      key: "final_severity",
      title: "FINAL SEVERITY",
      dataIndex: "final_severity",
      align: "center",
      width: 130,
    },
    {
      key: "witel",
      title: "WITEL",
      dataIndex: "witel",
      align: "center",
      width: 110,
      filter: searchFilter("witel"),
    },
    {
      key: "treshold",
      title: "TRESHOLD",
      dataIndex: "treshold",
      align: "center",
      width: 100,
    },
    {
      key: "ttr_customer_jam",
      title: "TTR AWAL",
      dataIndex: "ttr_customer_jam",
      align: "center",
      width: 100,
    },
    {
      key: "ttr_selisih",
      title: "TTR SELISIH",
      dataIndex: "ttr_selisih",
      align: "center",
      width: 110,
    },
    {
      key: "ttr_final",
      title: "TTR FINAL",
      align: "center",
      width: 100,
      render: (_value, row) =>
        calculateTtrFinal(row.ttr_customer_jam, row.ttr_selisih),
    },
    {
      key: "ket_recon",
      title: "KET RECON",
      dataIndex: "detail_rca",
      align: "center",
      width: 250,
      wrap: true,
    },
    excludeColumn,
    actionColumn,
  ];
};
