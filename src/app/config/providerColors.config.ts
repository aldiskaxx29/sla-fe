export const PROVIDER_COLORS: Record<string, string> = {
  myrepublic: "#662D91",
  "indosat hifi": "#FFC000",
  indibiz: "#E31E24",
  starlink: "#000000",
  "oxygen.id": "#00A9E0",
  "telkomsel wifi": "#EC1C24",
  "pt telkom indonesia - wifi.id": "#E31E24",
  iconnets: "#00A3E0",
  "indihome - telkomsel": "#EC1C24",
  indihome: "#FF0000",
  cbn: "#0055A5",
  "indihome - all": "#FF0000",
  "wifi.id": "#E31E24",
  "xl home": "#0040C0",
  biznet: "#FF9900",
  firstmedia: "#ED1C24",
  megavision: "#FF6600",
  mnc: "#001B44",
};

export const UNKNOWN_PROVIDER_COLOR = "#94A3B8";

const normalizeProvider = (name?: string | null) =>
  String(name ?? "")
    .toLowerCase()
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();

const PROVIDER_KEYS_BY_LENGTH = Object.keys(PROVIDER_COLORS).sort(
  (left, right) => right.length - left.length,
);

export const getProviderColor = (name?: string | null) => {
  const normalized = normalizeProvider(name);
  if (!normalized || normalized === "-") return UNKNOWN_PROVIDER_COLOR;

  const exact = PROVIDER_COLORS[normalized];
  if (exact) return exact;

  const compact = normalized.replace(/\s/g, "");
  const partial = PROVIDER_KEYS_BY_LENGTH.find(
    (key) => normalized.includes(key) || compact.includes(key.replace(/\s/g, "")),
  );

  return partial ? PROVIDER_COLORS[partial] : UNKNOWN_PROVIDER_COLOR;
};
