export const USER_ROLES = {
  ADMIN: "administrator",
  ADMIN_ALIAS: "admin",
  TIF_HO: "tif ho",
  TIF_REGIONAL: "tif regional",
  MITRA: "mitra",
  VICE_PRESIDENT: "vice president",
  TSEL: "tsel",
  GUEST: "guest",
} as const;

const ADMIN_ROLES = [USER_ROLES.ADMIN, USER_ROLES.ADMIN_ALIAS];
const ALL_MAIN_MENU_ROLES = [
  ...ADMIN_ROLES,
  USER_ROLES.TIF_HO,
  USER_ROLES.TIF_REGIONAL,
  USER_ROLES.MITRA,
];

const normalizeRole = (role?: string | null) =>
  role?.trim().toLowerCase() ?? "";

export type MenuType = "button" | "dropdown" | "external";

export interface MenuOption {
  label: string;
  value: string;
}

export interface MenuConfigItem {
  key: string;
  label: string;
  path?: string;
  type: MenuType;
  activePaths: string[];
  allowedRoles: string[];
  options?: MenuOption[];
  externalUrl?: string;
}

export const SLA_OPTIONS: MenuOption[] = [
  { label: "Achievement WISA", value: "msa" },
  { label: "Daily Monitoring", value: "daily-monitoring" },
  { label: "Report Reconsilation", value: "report-site" },
  { label: "Resume RCA", value: "resume-rca" },
  { label: "Week-to-Date Achievement", value: "access-prediction" },
];

export const NETWORK_OPTIONS: MenuOption[] = [
  { label: "Core Perf", value: "network/core-perf" },
  { label: "CDN Perf", value: "network/cdn-perf" },
  { label: "Quality Healthiness", value: "network/quality-healthiness" },
  { label: "Monitoring PE-HSI", value: "network/pe-hsi" },
];

export const TICKET_OPTIONS: MenuOption[] = [
  { label: "Dashboard", value: "ticket/dashboard" },
];

export const ONX_OPTIONS: MenuOption[] = [
  { label: "Dashboard", value: "onx" },
  { label: "City Performance", value: "onx/city-performance" },
];

export const MENU_CONFIG: MenuConfigItem[] = [
  {
    key: "monday",
    label: "Monday Monitoring",
    path: "monday",
    type: "button",
    activePaths: ["monday"],
    allowedRoles: [
      ...ALL_MAIN_MENU_ROLES,
      USER_ROLES.VICE_PRESIDENT,
      USER_ROLES.GUEST,
    ],
  },
  {
    key: "sla",
    label: "SLA",
    type: "dropdown",
    activePaths: [
      "msa",
      "cnop",
      "daily-monitoring",
      "report-site",
      "resume-rca",
      "access-prediction",
      "report-support-needed",
    ],
    allowedRoles: ALL_MAIN_MENU_ROLES,
    options: SLA_OPTIONS,
  },
  {
    key: "network",
    label: "Network Performance",
    type: "dropdown",
    activePaths: ["network"],
    allowedRoles: ALL_MAIN_MENU_ROLES,
    options: NETWORK_OPTIONS,
  },
  {
    key: "input-site",
    label: "Reconsiliation",
    path: "input-site",
    type: "button",
    activePaths: ["input-site"],
    allowedRoles: ALL_MAIN_MENU_ROLES,
  },
  {
    key: "one",
    label: "One Visibility",
    path: "one",
    type: "button",
    activePaths: ["one"],
    allowedRoles: [
      ...ALL_MAIN_MENU_ROLES,
      USER_ROLES.VICE_PRESIDENT,
      USER_ROLES.TSEL,
    ],
  },
  {
    key: "ticket",
    label: "Ticket Quality",
    type: "dropdown",
    activePaths: ["ticket", "ticket/dashboard"],
    allowedRoles: ALL_MAIN_MENU_ROLES,
    options: TICKET_OPTIONS,
  },
  {
    key: "elibrary",
    label: "E-Library",
    path: "elibrary",
    type: "button",
    activePaths: ["elibrary"],
    allowedRoles: ALL_MAIN_MENU_ROLES,
  },
  {
    key: "onx",
    label: "ONX",
    type: "dropdown",
    activePaths: ["onx", "onx/city-performance"],
    allowedRoles: [
      ...ALL_MAIN_MENU_ROLES,
      USER_ROLES.VICE_PRESIDENT,
      USER_ROLES.TSEL,
      USER_ROLES.GUEST,
    ],
    options: ONX_OPTIONS,
  },
  {
    key: "telkom-akses",
    label: "Telkom Akses",
    type: "external",
    activePaths: ["dashboard-ta"],
    allowedRoles: ALL_MAIN_MENU_ROLES,
    externalUrl: "http://10.60.174.188:8008/",
  },
];

export const ADMIN_MENU_CONFIG: MenuConfigItem[] = [
  {
    key: "user",
    label: "User",
    path: "/user",
    type: "button",
    activePaths: ["user"],
    allowedRoles: ADMIN_ROLES,
  },
  {
    key: "approve",
    label: "Approve",
    path: "/approver",
    type: "button",
    activePaths: ["approver"],
    allowedRoles: ADMIN_ROLES,
  },
];

export const getVisibleMenus = (
  currentLevel?: string | null,
  menuConfig: MenuConfigItem[] = MENU_CONFIG,
) => {
  const normalizedLevel = normalizeRole(currentLevel);

  return menuConfig.filter((menu) =>
    menu.allowedRoles.some((role) => normalizeRole(role) === normalizedLevel),
  );
};

export const getMenuRedirectPath = (menu: MenuConfigItem) => {
  if (menu.path) return `/${menu.path.replace(/^\//, "")}`;
  return `/${menu.options?.[0]?.value ?? "msa"}`;
};

/**
 * Kandidat path untuk pencocokan menu. Route dashboard ada yang berbentuk
 * `dashboard/:menuId/...`, jadi bagian setelah `dashboard/` ikut dijadikan kandidat.
 */
const getPathCandidates = (pathname: string) => {
  const normalizedPath = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  const withoutDashboardPrefix = normalizedPath.startsWith("dashboard/")
    ? normalizedPath.slice("dashboard/".length)
    : "";

  return [
    normalizedPath,
    ...(withoutDashboardPrefix ? [withoutDashboardPrefix] : []),
  ];
};

/** Cocok kalau path sama persis atau merupakan turunannya, bukan sekadar substring. */
const matchesPath = (candidate: string, path: string) => {
  const normalizedTarget = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return (
    candidate === normalizedTarget ||
    candidate.startsWith(`${normalizedTarget}/`)
  );
};

export const isMenuActive = (menu: MenuConfigItem, pathname: string) => {
  const candidates = getPathCandidates(pathname);
  const paths = [...(menu.path ? [menu.path] : []), ...menu.activePaths];

  return candidates.some((candidate) =>
    paths.some((path) => matchesPath(candidate, path)),
  );
};

/**
 * Opsi paling spesifik yang menang, mis. di `/onx/city-performance` yang aktif
 * "City Performance", bukan "Dashboard" (`onx`).
 */
export const isMenuOptionActive = (
  menu: MenuConfigItem,
  option: MenuOption,
  pathname: string,
) => {
  const candidates = getPathCandidates(pathname);
  const matched = (menu.options ?? []).filter((menuOption) =>
    candidates.some((candidate) => matchesPath(candidate, menuOption.value)),
  );

  if (!matched.length) return false;

  const mostSpecific = matched.reduce((longest, current) =>
    current.value.length > longest.value.length ? current : longest,
  );

  return mostSpecific.value === option.value;
};

export const getMenuByPath = (
  pathname: string,
  menuConfig: MenuConfigItem[] = [...MENU_CONFIG, ...ADMIN_MENU_CONFIG],
) => {
  const pathCandidates = getPathCandidates(pathname);

  return menuConfig.find((menu) => {
    const menuPath = menu.path?.replace(/^\/+/, "");
    const optionPaths = menu.options?.map((option) => option.value) ?? [];
    const paths = [
      ...(menuPath ? [menuPath] : []),
      ...menu.activePaths,
      ...optionPaths,
    ];

    return pathCandidates.some((candidate) =>
      paths.some((path) => matchesPath(candidate, path)),
    );
  });
};

export const canAccessAdminMenu = (currentLevel?: string | null) =>
  getVisibleMenus(currentLevel, ADMIN_MENU_CONFIG).length > 0;
