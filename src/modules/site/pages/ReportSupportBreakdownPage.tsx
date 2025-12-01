import { Button, Spin, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLazyGetDetailSiteQuery } from "../rtk/site.rtk";
import { EditOutlined } from "@ant-design/icons";

const ReportSupportBreakdown = () => {
  const navigate = useNavigate();
  const { breakdown, issue, monthnow, parameter } = useParams();
  const [getSite] = useLazyGetDetailSiteQuery();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  const getDetail = useCallback(async () => {
    setLoading(true);
    const { data } = await getSite({
      query: { name: breakdown, issue, month: monthnow, parameter },
    });
    setDataSource(data);
    setLoading(false);
  }, [breakdown, issue, monthnow]);

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
      onHeaderCell: () => ({
        className: "!p-1 !text-center !bg-neutral-800 !text-white",
      }),
    },
    {
      title: "Region",
      dataIndex: "Region",
      key: "Region",
      onHeaderCell: () => ({
        className: "!text-center !bg-neutral-800 !text-white",
      }),
    },
    {
      title: "RCA",
      dataIndex: "RCA",
      key: "RCA",
      onHeaderCell: () => ({
        className: "!text-center !bg-neutral-800 !text-white",
      }),
    },
    {
      title: "Site ID",
      dataIndex: "Site ID",
      key: "Site ID",
      onHeaderCell: () => ({
        className: "!text-center !bg-neutral-800 !text-white",
      }),
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      onHeaderCell: () => ({
        className: "!text-center !bg-neutral-800 !text-white",
      }),
    },
    {
      title: "No. Order",
      dataIndex: "No. Order",
      key: "No. Order",
      onHeaderCell: () => ({
        className: "!text-center !bg-neutral-800 !text-white",
      }),
    },
    {
      title: "Last Update",
      dataIndex: "Last Update",
      key: "Last Update",
      onHeaderCell: () => ({
        className: "!text-center !bg-neutral-800 !text-white",
      }),
    },
    {
      title: "Action",
      dataIndex: "Action",
      key: "Action",
      onHeaderCell: () => ({
        className: "!text-center !bg-neutral-800 !text-white",
      }),
      render: (record) => (
        <div className="flex justify-center">
          <EditOutlined
            className="text-blue-600 cursor-pointer hover:text-blue-800"
            onClick={() => console.log(record)}
            />
        </div>
      ),
    },
  ];

  useEffect(() => {
    getDetail();
  }, []);
  return (
    <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 m-6">
      {loading && <Spin fullscreen tip="Sedang Memuat Data..." />}
      <div className="flex gap-4 mb-4">
        <Button onClick={() => navigate("/report-support-needed")}>Back</Button>
      </div>
      <Table columns={columns} dataSource={dataSource} />
    </div>
  );
};

export default ReportSupportBreakdown;
