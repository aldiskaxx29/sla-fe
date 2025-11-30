import React, { useCallback, useEffect, useState } from "react";
import { Modal, Table, Typography } from "antd";
import { useLazyGetDetailRegionQuery } from "../rtk/site.rtk";

const { Text, Link } = Typography;

const ModalTableBreakRegion = ({ open, onCancel, name }) => {
  const [tableData, setTableData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [loadingRow, setLoadingRow] = useState(null); // optional: show per-row loading
  const [getDetailRegion] = useLazyGetDetailRegionQuery();

  const region = ""; // change if needed

  // Initial load when `name` changes
  const loadInitial = useCallback(async () => {
    if (!name) return;
    try {
      const res = await getDetailRegion({ query: { name, region } });
      setTableData(res?.data ?? []);
    } catch (err) {
      console.error("Failed to load initial region detail:", err);
      setTableData([]);
    }
  }, [name, getDetailRegion]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Helper to compute a stable row key for each record
  const getRowKey = (record, index) => {
    // prefer an id-like field if you have one (identIndex, id, no, etc.)
    return record.identIndex ?? record.no ?? record.key ?? index;
  };

  // When user clicks the issue text (or breakdown button), fetch children and expand the row
  const handleIssueClick = async (record) => {
    const key = getRowKey(record);

    // If children already loaded, just toggle expansion
    if (record.children && record.children.length > 0) {
      setExpandedRowKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
      return;
    }

    try {
      setLoadingRow(key);
      // trigger RTK Query fetch: pass issue as name
      const res = await getDetailRegion({
        query: { name, region: record.issue },
      });
      const children = res?.data ?? [];

      // attach children to that row
      setTableData((prev) =>
        prev.map((r, idx) => {
          const rk = getRowKey(r, idx);
          if (rk === key) {
            return { ...r, children };
          }
          return r;
        })
      );

      // expand the row
      setExpandedRowKeys((prev) =>
        prev.includes(key) ? prev : [...prev, key]
      );
    } catch (err) {
      console.error("Failed to load breakdown for", record.issue, err);
    } finally {
      setLoadingRow(null);
    }
  };

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      onHeaderCell: () => ({
        className: "!p-1 !text-center !bg-neutral-800 !text-white",
      }),
      width: 60,
    },
    {
      title: "Issue",
      dataIndex: "issue",
      key: "issue",
      onHeaderCell: () => ({
        className: "!p-1 !text-center !bg-neutral-800 !text-white",
      }),
      // make issue clickable to fetch breakdown
      render: (text, record) => (
        <div
          onClick={(e) => {
            e.preventDefault();
            handleIssueClick(record);
          }}
        >
          {text}
          {loadingRow === getRowKey(record) ? " (loading...)" : ""}
        </div>
      ),
    },
    {
      title: "Jumlah",
      dataIndex: "jumlah",
      key: "jumlah",
      onHeaderCell: () => ({
        className: "!p-1 !text-center !bg-neutral-800 !text-white",
      }),
    },
    {
      title: "Open",
      dataIndex: "open",
      key: "open",
      onHeaderCell: () => ({
        className: "!p-1 !text-center !bg-neutral-800 !text-white",
      }),
    },
    {
      title: "On Progress",
      dataIndex: "on_progress",
      key: "on_progress",
      onHeaderCell: () => ({
        className: "!p-1 !text-center !bg-neutral-800 !text-white",
      }),
    },
    {
      title: "Done",
      dataIndex: "done",
      key: "done",
      onHeaderCell: () => ({
        className: "!p-1 !text-center !bg-neutral-800 !text-white",
      }),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      title={(name ?? "").toUpperCase() + " PER REGION "}
    >
      <Table
        columns={columns}
        pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
        dataSource={tableData}
        rowKey={(r, idx) => getRowKey(r, idx)}
        expandable={{
          expandedRowKeys,
          rowExpandable: (record) =>
            Array.isArray(record.children) && record.children.length > 0,
          // hide default icon if you want only clickable issue to expand:
          expandIcon: () => <div></div>,
          // optional: show a simple expanded row render, or let antd render children as nested rows automatically
          // expandedRowRender: (row) => <pre>{JSON.stringify(row.children, null, 2)}</pre>,
        }}
      />
    </Modal>
  );
};

export { ModalTableBreakRegion };
