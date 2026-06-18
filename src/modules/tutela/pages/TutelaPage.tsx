import { useEffect, useMemo, useState } from "react";

const TUTELA_ORIGIN = "http://10.62.205.124:3001";

const MENU_PATHS: Record<string, string> = {
  dashboard: "/onx/dashboard",
  "mobile-experience": "/onx/mobile-experience",
  "isp-provider": "/onx/isp-provider-experience",
  "isp-provider-experience": "/onx/isp-provider-experience",
};

const getMenuFromPath = (pathname: string) => {
  const cleanPath = pathname.replace(/^\/onx\/?/, "").toLowerCase();
  if (cleanPath in MENU_PATHS) {
    return cleanPath;
  }

  return "dashboard";
};

const TutelaPage = () => {
  const [menu, setMenu] = useState(() => getMenuFromPath(window.location.pathname));

  const src = useMemo(() => {
    return `${TUTELA_ORIGIN}${MENU_PATHS[menu] || MENU_PATHS.dashboard}`;
  }, [menu]);

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

      const normalizedRoute = route.toLowerCase();
      if (normalizedRoute in MENU_PATHS) {
        setMenu(normalizedRoute);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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
