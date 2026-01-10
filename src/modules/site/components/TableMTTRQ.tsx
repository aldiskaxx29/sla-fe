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
        const res = await getReportSite({
          query: { parameter, week, month, year },
        }).unwrap();
        setReport((res as any)?.data || res);
      } catch (err) {
        // ignore - show empty
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [parameter, week, month, year, getReportSite]);

  const resumeData = useMemo(() => {
    // transform report resume (defensive)
    const r = report?.resume || report?.resume_issue || report?.pie || [];
    if (!Array.isArray(r)) return [];
    return r.map((i: Record<string, any>, idx: number) => ({
      label: (i.label as string) || (i.name as string) || `Item ${idx + 1}`,
      value: Number(i.value ?? i.count ?? 0),
      color: (i.color as string) || undefined,
    }));
  }, [report]);

  const detailData = useMemo<Array<Record<string, unknown>>>(() => {
    return (
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
      const res = await getClearData({
        query: {
          region,
          parameter,
          status_site: statusSite,
          month,
          week,
          year,
        },
      }).unwrap();
      setModalData((res as any)?.data || (res as any) || []);
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
