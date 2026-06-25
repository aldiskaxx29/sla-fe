// Antd
import { Button, Image, Layout, Spin } from "antd";
import "./index.css";

// React
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

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
import { useLocation, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@/modules/auth/rtk/auth.rtk";

import { toast } from "react-toastify";
import type { RootState } from "@/plugins/redux";
import {
  ADMIN_MENU_CONFIG,
  getVisibleMenus,
  MENU_CONFIG,
  type MenuConfigItem,
} from "@/app/config/menuConfig";

const { Header, Content } = Layout;

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user_data") ?? "null");
  } catch {
    return null;
  }
};

const AppLayoutDefault = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const authenticatedUser = useSelector(
    (state: RootState) => state.auth.auth_authenticatedUser
  );

  // Handle menu selection
  const handleMenuSelect = (menu: string) => {
    navigate(menu);
  };

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

  const user = authenticatedUser ?? getStoredUser();
  const userRole = user?.level;
  const visibleMenus = getVisibleMenus(userRole, MENU_CONFIG);
  const visibleAdminMenus = getVisibleMenus(userRole, ADMIN_MENU_CONFIG);

  const isActiveMenu = (menu: MenuConfigItem) =>
    menu.activePaths.some((path) => location.pathname.includes(path));

  const renderMenuButton = (menu: MenuConfigItem) => (
    <Button
      key={menu.key}
      className={`${
        isActiveMenu(menu) ? "!bg-[#A6AEC1]" : "!bg-[#576278]"
      } !border-0 !rounded-4xl !shadow-none`}
      onClick={() => {
        if (menu.type === "external" && menu.externalUrl) {
          window.open(menu.externalUrl, "_blank");
          return;
        }

        if (menu.path) {
          handleMenuSelect(menu.path);
        }
      }}
    >
      <p className={isActiveMenu(menu) ? "text-white " : "text-[#C6C6C6] "}>
        {menu.label}
      </p>
    </Button>
  );

  const renderDropdownMenu = (menu: MenuConfigItem) => {
    const isOpen = menu.key === "sla" ? open2 : open1;
    const setOpen = menu.key === "sla" ? setOpen2 : setOpen1;

    return (
      <div
        key={menu.key}
        ref={containerRef}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`relative inline-block px-4 py-2 rounded-full cursor-pointer ${
          isActiveMenu(menu)
            ? "!bg-[#A6AEC1] text-white"
            : "!bg-[#576278] text-[#C6C6C6]"
        }`}
      >
        {menu.label}
        {isOpen && (
          <div
            className={`absolute left-0 top-full -mt-2 bg-[#576278] border rounded shadow ${
              menu.key === "sla" ? "z-100 w-[300px]" : "z-10 w-full"
            }`}
          >
            {menu.options?.map((option) => (
              <p
                key={option.value}
                className={`px-4 py-2 hover:bg-gray-500 cursor-pointer ${
                  location.pathname?.includes(option.value)
                    ? "!bg-[#A6AEC1] text-white"
                    : "!bg-[#576278] text-[#C6C6C6]"
                }`}
                onClick={() => {
                  handleMenuSelect(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMainMenu = (menu: MenuConfigItem) =>
    menu.type === "dropdown" ? renderDropdownMenu(menu) : renderMenuButton(menu);

  return (
    <>
      {loading && <Spin fullscreen tip="Harap Tunggu..." />}
      <Layout hasSider className="min-h-screen !bg-white">
        <Layout className="min-h-screen flex flex-col">
          <Header className="!bg-white flex justify-between items-center sticky !px-6 z-20">
            <div className="flex items-center gap-4">
              <Image src={qosmo} alt="icon" width={128} preview={false} />
              {/* <div className=" rounded-[54px] px-3 py-2 h-12 flex justify-center items-center">
                <p className="font-semibold text-[#0E2133] text-2xl">
                  {titleNavigation}
                </p>
              </div> */}
            </div>
            <div className="flex gap-4">
              {visibleMenus.length > 0 && (
                <div className="text-sm flex justify-between items-center bg-[#576278] rounded-[54px] px-3 py-2">
                  {visibleMenus.map(renderMainMenu)}
                </div>
              )}

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
                        {visibleAdminMenus.length > 0 && (
                          <>
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
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
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
                          </>
                        )}
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
          <Content className="z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <AppRouteWrapper />
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

AppLayoutDefault.displayName = "AppLayoutDefault";

export { AppLayoutDefault };
