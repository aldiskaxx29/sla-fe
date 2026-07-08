import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  GlobalOutlined,
  WifiOutlined,
} from "@ant-design/icons";

const TutelaLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // Determine active tab
  const getActiveTab = () => {
    if (path.includes("mobile-experience")) return "mobile";
    if (path.includes("isp-provider")) return "isp";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-slate-50 text-slate-800 p-6">
      {/* Top Module Header Navigation */}
      <div className="flex flex-row gap-4 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex-wrap">
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
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default TutelaLayout;
