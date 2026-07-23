import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  GlobalOutlined,
  WifiOutlined,
  TableOutlined,
} from "@ant-design/icons";

const TutelaLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // Determine active tab
  const getActiveTab = () => {
    if (path.includes("city-performance")) return "city-performance";
    if (path.includes("mobile-experience")) return "mobile";
    if (path.includes("isp-provider")) return "isp";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 text-slate-800 p-6 overflow-hidden">
      {/* Top Module Header Navigation */}
      <div className="flex flex-row gap-4 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex-wrap flex-shrink-0">
        <button
          onClick={() => navigate("/onx")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <DashboardOutlined />
          Dashboard
        </button>
        <button
          onClick={() => navigate("/onx/city-performance")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 cursor-pointer ${
            activeTab === "city-performance"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <TableOutlined />
          City Performance
        </button>
        <button
          onClick={() => navigate("/onx/mobile-experience")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 cursor-pointer ${
            activeTab === "mobile"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <GlobalOutlined />
          Mobile Experience
        </button>
        <button
          onClick={() => navigate("/onx/isp-provider")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 cursor-pointer ${
            activeTab === "isp"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <WifiOutlined />
          ISP Provider Experience
        </button>
      </div>

      {/* Renders Active Sub-Page Element */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default TutelaLayout;
