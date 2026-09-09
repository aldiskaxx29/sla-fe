export const MTTRQ_PARAMETERS = [
  "mttrq critical",
  "mttrq major",
  "mttrq minor",
];

export const DEFAULT_PARAMETER = "packetloss ran to core";

export const PARAMETER_OPTIONS = [
  { label: "Packetloss", value: "packetloss ran to core" },
  { label: "Jitter", value: "jitter ran to core" },
  { label: "Latency", value: "latency ran to core" },
  { label: "Mttrq Critical", value: "mttrq critical" },
  { label: "Mttrq Major", value: "mttrq major" },
  { label: "Mttrq Minor", value: "mttrq minor" },
];

export const SITE_TYPE_OPTIONS = [
  { label: "Corrective", value: "corrective" },
  { label: "Preventive", value: "preventive" },
];

export const EXCLUDE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Exclude", value: "2" },
  { label: "Non Exclude", value: "1" },
];

export const EVIDENCE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Sudah Ada Evidence", value: "with" },
  { label: "Belum Ada Evidence", value: "without" },
];
