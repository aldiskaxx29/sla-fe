// Antd
import type { MenuProps } from "antd";
import { Button, Image, Layout, Select } from "antd";
import "./index.css";

// React
import React, { useEffect, useMemo, useRef, useState } from "react";

// Components
import {
  //   AppBaseLayout,
  //   AppBaseLayoutContent,
  AppRouteWrapper,
} from "@/app/components";

// Assets
import qosmo from "@/assets/1_Qosmo.png";
import notification from "@/assets/notification.svg";
import profile from "@/assets/profile.svg";

// Router
import { useLocation, useParams } from "react-router-dom";
const { Header, Content } = Layout;

const AppLayoutDefault = () => {
  // Hook
  const { menuId } = useParams();
  const location = useLocation();
  const [current, setCurrent] = useState<string | undefined>("MM");
  const [type, setType] = useState("msa");

  // Handle menu selection
  const handleMenuSelect = (menu: string) => {
    setType(menu);
    console.log(menu);
    window.location.href = `/${menu}`; // Update URL on menu click
  };

  const titleNavigation = useMemo(() => {
    if (menuId === "msa") return "MONITORING ACHIEVEMENT SLA MSA";
    if (menuId === "cnop") return "MONITORING ACHIEVEMENT SLA CNOP";
    if (location.pathname.includes("site")) return "REKONSILIASI";
    if (menuId) setType(menuId);
  }, [menuId]);

  // Sync selected key with props (route changes)
  useEffect(() => {
    if (menuId) setCurrent(menuId);
  }, [menuId]);

  const networkOpt = [
    { label: "Access Perf(Home)", value: "network/access-perf" },
    { label: "Core Perf", value: "network/core-perf" },
    { label: "CDN Perf", value: "network/cdn-perf" },
    // { label: "Quality Healthiness", value: "network/quality" },
  ];
  const slaOpt = [
    { label: "Achievement MSA", value: "msa" },
    { label: "Achievement CNOP", value: "cnop" },
    { label: "Reconsiliation", value: "input-site" },
    { label: "Report Reconsilation", value: "report-site" },
  ];

  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const containerRef = useRef(null);

  return (
    <Layout hasSider className=" !bg-white">
      <Layout className="">
        <Header className="!bg-white flex justify-between items-center sticky !px-6">
          <div className="flex items-center gap-4">
            <Image src={qosmo} alt="icon" width={128} preview={false} />
            <div className=" rounded-[54px] px-3 py-2 h-12 flex justify-center items-center">
              <p className="font-semibold text-[#0E2133] text-2xl">
                {titleNavigation}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-sm flex justify-between items-center bg-[#576278] rounded-[54px] px-3 py-2">
              <Button
                className={`${
                  location.pathname.includes("executive")
                    ? "!bg-[#A6AEC1]"
                    : "!bg-[#576278]"
                } !border-0 !rounded-4xl !shadow-none`}
                onClick={() => {
                  handleMenuSelect("executive");
                }}
              >
                <p
                  className={
                    location.pathname.includes("executive")
                      ? "text-white "
                      : "text-[#C6C6C6] "
                  }
                >
                  Executive Summary
                </p>
              </Button>
              <Button
                className={`${
                  location.pathname.includes("quality-healthiness")
                    ? "!bg-[#A6AEC1]"
                    : "!bg-[#576278]"
                } !border-0 !rounded-4xl !shadow-none`}
                onClick={() => {
                  handleMenuSelect("quality-healthiness");
                }}
              >
                <p
                  className={
                    location.pathname.includes("quality-healthiness")
                      ? "text-white "
                      : "text-[#C6C6C6] "
                  }
                >
                  Quality Healthiness
                </p>
              </Button>
              <Button
                className={`${
                  location.pathname.includes("monday")
                    ? "!bg-[#A6AEC1]"
                    : "!bg-[#576278]"
                } !border-0 !rounded-4xl !shadow-none`}
                onClick={() => {
                  handleMenuSelect("monday");
                }}
              >
                <p
                  className={
                    location.pathname.includes("monday")
                      ? "text-white "
                      : "text-[#C6C6C6] "
                  }
                >
                  Monday Monitoring
                </p>
              </Button>
              <div
                ref={containerRef}
                onMouseEnter={() => setOpen1(true)}
                onMouseLeave={() => setOpen1(false)}
                className={`relative inline-block px-4 py-2 rounded-full cursor-pointer ${
                  location.pathname?.includes("network")
                    ? "!bg-[#A6AEC1] text-white"
                    : "!bg-[#576278] text-[#C6C6C6]"
                }`}
              >
                Network Performance
                {open1 && (
                  <div className="absolute left-0 top-full -mt-2 w-full bg-[#576278] border rounded shadow z-10">
                    {networkOpt.map((option) => (
                      <p
                        key={option.value}
                        className="px-4 py-2 hover:bg-gray-500 cursor-pointer"
                        onClick={() => {
                          handleMenuSelect(option.value);
                          setOpen1(false);
                        }}
                      >
                        {option.label}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div
                ref={containerRef}
                onMouseEnter={() => setOpen2(true)}
                onMouseLeave={() => setOpen2(false)}
                className={`relative inline-block px-4 py-2 rounded-full cursor-pointer ${
                  location.pathname?.includes("sla")
                    ? "!bg-[#A6AEC1] text-white"
                    : "!bg-[#576278] text-[#C6C6C6]"
                }`}
              >
                SLA
                {open2 && (
                  <div className="absolute left-0 top-full -mt-2 w-[200px] bg-[#576278] border rounded shadow z-50">
                    {slaOpt.map((option) => (
                      <p
                        key={option.value}
                        className="px-4 py-2 hover:bg-gray-500 cursor-pointer"
                        onClick={() => {
                          handleMenuSelect(option.value);
                          setOpen2(false);
                        }}
                      >
                        {option.label}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <Button
                className={`${
                  location.pathname.includes("one")
                    ? "!bg-[#A6AEC1]"
                    : "!bg-[#576278]"
                } !border-0 !rounded-4xl !shadow-none`}
                onClick={() => {
                  handleMenuSelect("one");
                }}
              >
                <p
                  className={
                    location.pathname.includes("one")
                      ? "text-white "
                      : "text-[#C6C6C6] "
                  }
                >
                  One Visibility
                </p>
              </Button>
              <Button
                className={`${
                  location.pathname.includes("ticket")
                    ? "!bg-[#A6AEC1]"
                    : "!bg-[#576278]"
                } !border-0 !rounded-4xl !shadow-none`}
              >
                <p
                  className={
                    location.pathname.includes("ticket")
                      ? "text-white "
                      : "text-[#C6C6C6] "
                  }
                  onClick={() => {
                    handleMenuSelect("ticket");
                  }}
                  // onClick={() =>
                  //   window.open(
                  //     "http://10.60.174.187/ticket_quality_v3/",
                  //     "_blank"
                  //   )
                  // }
                >
                  Ticket Quality
                </p>
              </Button>
              <Button
                className={`${
                  location.pathname.includes("elibrary")
                    ? "!bg-[#A6AEC1]"
                    : "!bg-[#576278]"
                } !border-0 !rounded-4xl !shadow-none`}
                onClick={() => {
                  handleMenuSelect("elibrary");
                }}
              >
                <p
                  className={
                    location.pathname.includes("elibrary")
                      ? "text-white "
                      : "text-[#C6C6C6] "
                  }
                >
                  E-Library
                </p>
              </Button>
            </div>
            <div className="flex rounded-[54px] border border-[#DBDADE] gap-4 px-3 py-1 h-12 items-center justify-center">
              <Image src={notification} alt="icon" width={30} preview={false} />
              <Image
                className="rounded-full"
                src={profile}
                alt="logo"
                width={30}
                height={30}
                preview={false}
              />
            </div>
          </div>
        </Header>
        <Content>
          {menuId !== "quality-healthiness" ? (
            <div className="py-2 md:py-4 overflow-auto lg:py-6 bg-white">
              <AppRouteWrapper />
            </div>
          ) : (
            <AppRouteWrapper />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

AppLayoutDefault.displayName = "AppLayoutDefault";

export { AppLayoutDefault };
