// Shared ISP provider palette & helpers — mirrors the reference tutela app
// (src/constants/reference/provider.ts). Keep colors in sync with the reference
// so the map winner rendering matches http://.../onx/isp-provider-experience.

export interface ProviderDef {
  /** canonical id, always lowercase — matches the API `winner` / `provider` value */
  id: string;
  /** display label used in legends / checklists */
  label: string;
  color: string;
}

// Nine benchmark providers (Provider Priority = "nine").
// Order mirrors reference NINE_PROVIDER_PRIORITY_LIST.
export const NINE_PROVIDERS: ProviderDef[] = [
  { id: "indihome", label: "Indihome", color: "#E42313" },
  { id: "iconnets", label: "Iconnets", color: "#0293AE" },
  { id: "indosat hifi", label: "Indosat HiFi", color: "#d9117c" },
  { id: "xl home", label: "XL Home", color: "#00B38F" },
  { id: "cbn", label: "CBN", color: "#0066B3" },
  { id: "myrepublic", label: "MyRepublic", color: "#922A8F" },
  { id: "biznet", label: "Biznet", color: "#F05422" },
  { id: "oxygen.id", label: "Oxygen", color: "#0B8344" },
  { id: "megavision", label: "Megavision", color: "#EAB308" },
];

// All providers (Provider Priority = "all").
// Order mirrors reference NEW_PROVIDER_LIST.
export const ALL_PROVIDERS: ProviderDef[] = [
  { id: "indihome", label: "Indihome", color: "#E42313" },
  { id: "wifi.id", label: "Wifi.id", color: "#72120A" },
  { id: "telkomsel wifi", label: "Telkomsel Wifi", color: "#ED1D61" },
  { id: "biznet", label: "Biznet", color: "#F05422" },
  { id: "myrepublic", label: "MyRepublic", color: "#922A8F" },
  { id: "cbn", label: "CBN", color: "#0066B3" },
  { id: "mnc", label: "MNC", color: "#F0D12C" },
  { id: "firstmedia", label: "FirstMedia", color: "#E9C874" },
  { id: "iconnets", label: "Iconnets", color: "#0293AE" },
  { id: "oxygen.id", label: "Oxygen", color: "#0B8344" },
  { id: "xl home", label: "XL Home", color: "#00B38F" },
  { id: "starlink", label: "Starlink", color: "#262626" },
  { id: "megavision", label: "Megavision", color: "#EAB308" },
  { id: "indosat hifi", label: "Indosat HiFi", color: "#d9117c" },
];

const DEFAULT_COLOR = "#7F8C8D";

// Map any provider / winner string (e.g. "Oxygen.id", "XL HOME", "Indosat HiFi")
// to its canonical id. Order matters: check more specific names first.
export const normalizeProviderId = (name?: string | null): string => {
  const n = (name ?? "").toLowerCase().trim();
  if (!n) return "default";
  if (n.includes("indihome")) return "indihome";
  if (n.includes("indosat")) return "indosat hifi";
  if (n.includes("iconnets")) return "iconnets";
  if (n.includes("myrepublic")) return "myrepublic";
  if (n.includes("biznet")) return "biznet";
  if (n.includes("cbn")) return "cbn";
  if (n.includes("oxygen")) return "oxygen.id";
  if (n.includes("megavision")) return "megavision";
  if (n.includes("firstmedia") || n.includes("first media")) return "firstmedia";
  if (n.includes("telkomsel")) return "telkomsel wifi";
  if (n.includes("wifi")) return "wifi.id";
  if (n.includes("mnc")) return "mnc";
  if (n.includes("starlink")) return "starlink";
  if (n.includes("xl")) return "xl home";
  return n;
};

const COLOR_BY_ID: Record<string, string> = [...ALL_PROVIDERS].reduce(
  (acc, p) => {
    acc[p.id] = p.color;
    return acc;
  },
  {} as Record<string, string>
);

export interface ResolvedProviderConfig {
  color: string;
  bg: string;
  text: string;
}

// Drop-in replacement for the per-file getProviderConfig helpers.
export const getProviderConfig = (name: string): ResolvedProviderConfig => {
  const id = normalizeProviderId(name);
  const color = COLOR_BY_ID[id] ?? DEFAULT_COLOR;
  return { color, bg: `bg-[${color}]`, text: `text-[${color}]` };
};

// Providers considered for a winner computation, given the priority mode.
export const winnerProviderList = (priority: "nine" | "all"): ProviderDef[] =>
  priority === "nine" ? NINE_PROVIDERS : ALL_PROVIDERS;

const LABEL_BY_ID: Record<string, string> = [...ALL_PROVIDERS].reduce(
  (acc, p) => {
    acc[p.id] = p.label;
    return acc;
  },
  {} as Record<string, string>
);

// Human-friendly label for any provider name / id (e.g. "oxygen.id" → "Oxygen").
export const getProviderLabel = (name: string): string => {
  const id = normalizeProviderId(name);
  return LABEL_BY_ID[id] ?? name;
};

// Canonical ids of the nine benchmark providers (used as default selection).
export const NINE_PROVIDER_IDS = NINE_PROVIDERS.map((p) => p.id);
