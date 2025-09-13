// Antd
import { Button, Image, Layout, Spin } from "antd";
import "./index.css";

// React
import { useEffect, useMemo, useRef, useState } from "react";

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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useLogoutMutation } from "@/modules/auth/rtk/auth.rtk";

import { toast } from "react-toastify";

const { Header, Content } = Layout;

const AppLayoutDefault = () => {
  // Hook
  const { menuId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // const [current, setCurrent] = useState<string | undefined>("MM");
  // const [type, setType] = useState("msa");

  // Handle menu selection
  const handleMenuSelect = (menu: string) => {
    navigate(menu);
  };

  const titleNavigation = useMemo(() => {
    if (menuId === "msa") return "MONITORING ACHIEVEMENT SLA MSA";
    if (menuId === "cnop") return "MONITORING ACHIEVEMENT SLA CNOP";
    if (location.pathname.includes("site")) return "REKONSILIASI";
    // if (menuId) setType(menuId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId]);

  // Sync selected key with props (route changes)
  // useEffect(() => {
  //   if (menuId) setCurrent(menuId);
  // }, [menuId]);

  const networkOpt = [
    // { label: "Access Perf(Home)", value: "network/access-perf" },
    { label: "Core Perf", value: "network/core-perf" },
    { label: "CDN Perf", value: "network/cdn-perf" },
    { label: "Quality Healthiness", value: "network/quality-healthiness" },
  ];
  const slaOpt = [
    { label: "Achievement MSA", value: "msa" },
    { label: "Achievement CNOP", value: "cnop" },
    { label: "Reconsiliation", value: "input-site" },
    { label: "Report Reconsilation", value: "report-site" },
  ];

  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  /* --------------------------------- Logout --------------------------------- */
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        event.target instanceof Node &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout().unwrap();
      toast.dismiss();
      toast.success("Logout successful", { position: "top-right" });
      navigate("login");
    } catch (err: unknown) {
      let msg = "Logout failed. Please try again.";
      if (typeof err === "object" && err !== null) {
        // @ts-expect-error: err might have data/message
        msg = err.data?.message ?? err.message ?? msg;
      } else if (typeof err === "string") {
        msg = err;
      }
      toast.dismiss();
      toast.error(msg, { position: "top-right" });
    } finally {
      setLoading(false);
    }

    setProfileOpen(false);
  };

  return (
    <>
      {loading && <Spin fullscreen tip="Harap Tunggu..." />}
      <Layout hasSider className=" !bg-white">
        <Layout className="">
          <Header className="!bg-white flex justify-between items-center sticky !px-6 z-20">
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
                {/* <Button
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
              </Button> */}
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
                          className={`px-4 py-2 hover:bg-gray-500 cursor-pointer ${
                            location.pathname?.includes(option.value)
                              ? "!bg-[#A6AEC1] text-white"
                              : "!bg-[#576278] text-[#C6C6C6]"
                          }`}
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
                    ["/msa", "/cnop", "/input-site", "/report-site"].includes(
                      location.pathname
                    )
                      ? "!bg-[#A6AEC1] text-white"
                      : "!bg-[#576278] text-[#C6C6C6]"
                  }`}
                >
                  SLA
                  {open2 && (
                    <div className="absolute left-0 top-full -mt-2 w-[200px] bg-[#576278] border rounded shadow opacity-100">
                      {slaOpt.map((option) => (
                        <p
                          key={option.value}
                          className={`px-4 py-2 hover:bg-gray-500 cursor-pointer ${
                            location.pathname?.includes(option.value)
                              ? "!bg-[#A6AEC1] text-white"
                              : "!bg-[#576278] text-[#C6C6C6]"
                          }`}
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
                <Button
                  className={`${
                    location.pathname.includes("msa")
                      ? "!bg-[#576278]"
                      : "!bg-[#576278]"
                  } !border-0 !rounded-4xl !shadow-none`}
                  onClick={() => {
                    handleMenuSelect("msa");
                  }}
                >
                  {/* <p
                  className={
                    location.pathname.includes("dashboard-ta")
                      ? "text-white "
                      : "text-[#C6C6C6] "
                  }
                >
                  Dashboard
                </p> */}
                  <p
                    className={`cursor-pointer ${
                      location.pathname.includes("dashboard-ta")
                        ? "text-white"
                        : "text-[#C6C6C6]"
                    }`}
                    onClick={() =>
                      window.open("http://10.60.174.188:8008/", "_blank")
                    }
                  >
                    Dashboard Ta
                  </p>
                </Button>
              </div>
              <div className="flex rounded-[54px] border border-[#DBDADE] gap-4 px-3 py-1 h-12 items-center justify-center">
                <Image
                  src={notification}
                  alt="icon"
                  width={30}
                  preview={false}
                />

                {/* Profile Dropdown */}
                <div ref={profileRef} className="relative flex">
                  <Image
                    className="rounded-full cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all duration-200"
                    src={profile}
                    alt="profile"
                    width={30}
                    preview={false}
                    onClick={() => setProfileOpen(!profileOpen)}
                  />

                  {/* Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="flex flex-col divide-y divide-gray-100">
                        {/* <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          John Doe
                        </p>
                        <p className="text-xs text-gray-500">
                          john.doe@company.com
                        </p>
                      </div> */}

                        {/* <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => {
                          console.log("Profile clicked");
                          setProfileOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Profile
                        </div>
                      </button> */}

                        {/* <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => {
                          console.log("Settings clicked");
                          setProfileOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Settings
                        </div>
                      </button> */}

                        {/* <hr className="my-1 border-gray-100" /> */}

                        <button
                          className="w-full text-left px-4 py-2 text-sm text-black hover:bg-black-50 transition-colors duration-150 cursor-pointer"
                          onClick={() => {
                            navigate("/user");
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            User
                          </div>
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-black hover:bg-black-50 transition-colors duration-150 cursor-pointer"
                          onClick={() => {
                            navigate("/profile");
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {/* Original user icon path */}
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                              {/* New path for the square border */}
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M1 1h22v22H1z"
                              />
                            </svg>
                            Profile
                          </div>
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-black hover:bg-black-50 transition-colors duration-150 cursor-pointer"
                          onClick={() => {
                            navigate("/approver");
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Approve
                          </div>
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                          onClick={handleLogout}
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Logout
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Header>
          <Content className="z-10">
            {/* {menuId !== "quality-healthiness" ? (
            <div className="py-2 md:py-4 overflow-auto lg:py-6 bg-white">
              <AppRouteWrapper />
            </div>
          ) : ( */}
            <AppRouteWrapper />
            {/* )} */}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

AppLayoutDefault.displayName = "AppLayoutDefault";

export { AppLayoutDefault };
