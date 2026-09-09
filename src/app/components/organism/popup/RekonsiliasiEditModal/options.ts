/** Pasangan Grouping RCA (group1) dan RCA Rekonsiliasi (group2). */
export const GROUPING_OPTIONS = [
  { group1: "Capacity", group2: "Cap End Site Need Order" },
  { group1: "Capacity", group2: "Cap End Site Order" },
  { group1: "Capacity", group2: "Cap Intermediate / Hub" },
  { group1: "Capacity", group2: "Cap 3rd Party" },
  { group1: "Capacity", group2: "Cap OLT" },
  { group1: "Capacity", group2: "Cap Link Backup" },

  { group1: "Hardware / Software Capab", group2: "Hardware / Software Capab" },

  { group1: "Power", group2: "Power TSEL" },
  { group1: "Power", group2: "Power Non TSEL" },

  { group1: "QE", group2: "QE Redaman" },
  { group1: "QE", group2: "QE Jarak" },

  { group1: "ISR", group2: "ISR Segel Balmon" },
  { group1: "ISR", group2: "ISR Interference Internal" },
  { group1: "ISR", group2: "ISR Interference External" },

  { group1: "Warranty", group2: "Warranty New Link" },
  { group1: "Warranty", group2: "Warranty Redeploy" },

  { group1: "Gamas", group2: "Gamas SKKL" },
  { group1: "Gamas", group2: "Gamas FO Darat / SKSO" },
  { group1: "Gamas", group2: "Gamas Repetitive" },

  { group1: "Temperature", group2: "Temperature TSEL" },
  { group1: "Temperature", group2: "Temperature Non TSEL" },

  { group1: "Technical", group2: "Comcase Quality" },
  { group1: "Technical", group2: "Force Majeur" },
  { group1: "Technical", group2: "Routing TSEL" },
  { group1: "Technical", group2: "Routing TIF" },
  { group1: "Technical", group2: "Technical TSEL" },
  { group1: "Technical", group2: "Technical TIF" },
  { group1: "Technical", group2: "Technical Unknown" },
  { group1: "Technical", group2: "Vandalisme" },
  { group1: "Technical", group2: "Issue Tower" },
  { group1: "Technical", group2: "Obstacle" },
  { group1: "Technical", group2: "Sparepart Readiness" },
];

/** Update Progress, dikelompokkan mengikuti group1 yang terpilih. */
export const PROGRESS_OPTIONS = [
  { group11: "Capacity", group22: "Channel Spacing" },
  { group11: "Capacity", group22: "Upgrade Redeploy" },
  { group11: "Capacity", group22: "New Redeploy" },

  { group11: "Hardware / Software Capab", group22: "CRC Counting" },

  { group11: "Power", group22: "Perbaikan Power" },

  { group11: "QE", group22: "Request QE" },

  { group11: "ISR", group22: "ISR" },

  { group11: "Warranty", group22: "FU to DWS" },

  { group11: "Gamas", group22: "Gamas Close, Link back to Normal" },
  { group11: "Gamas", group22: "Gamas Close, Link NY back to Normal" },
  { group11: "Gamas", group22: "Gamas Open" },

  { group11: "Temperature", group22: "Perbaikan Suhu" },

  { group11: "Technical", group22: "Perbaikan Redaman" },
  { group11: "Technical", group22: "Perbaikan Routing" },
  { group11: "Technical", group22: "Perbaikan Tcont" },
];

export const MTTRQ_GROUPING_RCA_OPTIONS = [
  "QE (Quality Enhancement)",
  "Double Ticket",
  "ISR",
  "Pengiriman Sparepart Spms",
  "Pengiriman L2SW & SFP",
  "Action Butuh CRA / CRQ",
  "Ticket Ceragon",
  "Perjalanan menunggu transportasi",
  "Comcase",
  "Issue TSEL",
  "Warranty",
  "Waiting DWS",
  "Force Major",
  "3rd Party",
  "Reenginering",
];

export const STATUS_PROGRESS_OPTIONS = ["OGP", "OPEN", "CLOSED"];
