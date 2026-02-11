import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Spin } from "antd";
import ResumeIssue from "./mttrq/ResumeIssue";
import DetailIssue from "./mttrq/DetailIssue";
import ActionPlan from "./mttrq/ActionPlan";
import ModalIssueDetail from "./mttrq/ModalIssueDetail";
import { useSite } from "../hooks/site.hooks";

interface TableMTTRQProps {
  parameter: string;
  week?: string;
  month?: string;
  year?: string;
}

const TableMTTRQ: React.FC<TableMTTRQProps> = ({
  parameter,
  week,
  month,
  year,
}) => {
  const { getReportSite, getClearData } = useSite();
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState<Array<Record<string, unknown>>>(
    []
  );

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      try {
        // fetch report data
        const res = (await getReportSite({
          query: { parameter, week, month, year },
        }).unwrap()) as any;
        setReport(res?.data);
      } catch (err) {
        // ignore - show empty
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [parameter, week, month, year, getReportSite]);

  const resumeData = useMemo(() => {
    const chart = (report as any)?.chart;
    if (!chart || Object.keys(chart).length === 0) return [];

    // normalize keys (remove non-alphanumeric and lowercase) for tolerant matching
    const normalize = (s: any) =>
      String(s || "")
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase();
    const normalizedChart: Record<string, number> = {};
    Object.entries(chart).forEach(([k, v]) => {
      normalizedChart[normalize(k)] = Number(v) || 0;
    });

    const fieldMap = [
      ["spms", "SPMS", "#2f5bd8"],
      ["isr", "ISR", "#f97316"],
      ["menunggu", "MENUNGGU TRANSPORTASI", "#10b981"],
      ["qe", "QE", "#06b6d4"],
      ["tsel", "ISSUE TSEL", "#f43f5e"],
      ["warranty", "WARRANTY", "#7c3aed"],
      ["comcase", "COMCASE", "#f59e0b"],
      ["ceragon", "CERAGON", "#8b5cf6"],
      ["waiting_cra_crq", "WAITING CRA / CRQ", "#ef4444"],
      ["issue_dws", "ISSUE DWS", "#14b8a6"],
      ["late_response", "LATE RESPONSE TIF / MITRA", "#374151"],
    ];

    return fieldMap
      .map(([key, label, color]) => {
        const desired = normalize(key);
        // find first chart key that contains desired token OR its prefix (tolerant to minor variations)
        const prefix = desired.slice(0, Math.min(5, desired.length));
        const match = Object.keys(normalizedChart).find(
          (nk) => nk.includes(desired) || (prefix && nk.includes(prefix))
        );
        const value = match ? normalizedChart[match] : 0;
        return { label, value: Number(value || 0), color };
      })
      .filter((i) => i.value > 0);
  }, [report]);

  const detailData = useMemo<Array<Record<string, unknown>>>(() => {
    // API now returns rows under `data` (e.g. { data: { data: [...], chart: {...} }})
    return (
      (report?.data as Array<Record<string, unknown>>) ||
      ((report?.data as any)?.data as Array<Record<string, unknown>>) ||
      (report?.detail as Array<Record<string, unknown>>) ||
      (report?.table as Array<Record<string, unknown>>) ||
      []
    );
  }, [report]);

  const actionPlan = useMemo<Array<Record<string, unknown>>>(() => {
    return (
      (report?.action_plan as Array<Record<string, unknown>>) ||
      (report?.actionPlan as Array<Record<string, unknown>>) ||
      (report?.tickets as Array<Record<string, unknown>>) ||
      []
    );
  }, [report]);

  const openDetail = async (region: string, statusSite: string) => {
    try {
      setIsLoading(true);
      const res = (await getClearData({
        query: {
          region,
          parameter,
          status_site: statusSite,
          month,
          week,
          year,
        },
      }).unwrap()) as any;
      setModalData(res?.data || res || []);
      setModalTitle(`${region} - ${statusSite}`);
      setOpenModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {isLoading && <Spin fullscreen tip="Sedang Memuat Data..." />}
      <Row gutter={24} align="top">
        <Col span={6}>
          <ResumeIssue data={resumeData} />
        </Col>
        <Col span={18}>
          <DetailIssue
            data={detailData}
            onCellClick={(region, status) => openDetail(region, status)}
          />
        </Col>
      </Row>

      <ActionPlan data={actionPlan} />

      <ModalIssueDetail
        open={openModal}
        onCancel={() => setOpenModal(false)}
        data={modalData}
        title={modalTitle}
      />
    </div>
  );
};

export default TableMTTRQ;
