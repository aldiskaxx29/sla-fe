import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TUTELA_ORIGIN = "http://10.62.205.124:3001";

const MENU_PATHS: Record<string, string> = {
  dashboard: "/onx/dashboard",
  "mobile-experience": "/onx/mobile-experience",
  "isp-provider": "/onx/isp-provider-experience",
  "isp-provider-experience": "/onx/isp-provider-experience",
};

const getMenuFromHash = (hash: string) => {
  const cleanHash = hash.replace(/^#/, "").toLowerCase();
  return MENU_PATHS[cleanHash] || MENU_PATHS.dashboard;
};

const getHashFromMenu = (menu: string) => {
  const normalized = menu.toLowerCase();
  if (
    normalized === "isp-provider-experience" ||
    normalized === "isp-provider"
  ) {
    return "#isp-provider";
  }

  if (normalized === "mobile-experience") {
    return "#mobile-experience";
  }

  return "#dashboard";
};

const TutelaPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const src = useMemo(() => {
    return `${TUTELA_ORIGIN}${getMenuFromHash(location.hash)}`;
  }, [location.hash]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== TUTELA_ORIGIN) return;

      const data = event.data as
        | { type?: string; route?: string }
        | string
        | undefined;

      const route =
        typeof data === "string"
          ? data
          : data && data.type === "onx-route"
            ? data.route
            : null;

      if (!route) return;

      const nextHash = getHashFromMenu(route);
      const nextUrl = `/onx${nextHash}`;

      if (`${location.pathname}${location.hash}` !== nextUrl) {
        navigate(nextUrl, { replace: true });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [location.hash, location.pathname, navigate]);

  return (
    <iframe
      key={src}
      title="Tutela"
      src={src}
      className="w-full min-h-[100vh] border-0"
    />
  );
};

export default TutelaPage;
