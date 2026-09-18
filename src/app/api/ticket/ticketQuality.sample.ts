/**
 * Data contoh Ticket Quality. Endpoint backend belum tersedia, jadi halaman
 * memakai bentuk view model final supaya nanti cukup mengganti sumbernya
 * dengan query hook tanpa mengubah organism.
 */
import type {
  TicketAchievementDistribution,
  TicketHighestTtr,
  TicketHighlightSummary,
  TicketRegionPerformanceRow,
  TicketSeverityFilter,
  TicketSeverityMap,
  TicketTrendPoint,
} from "@/app/types/ticket/ticketQuality.types";

export const TICKET_ACCESS_OPTIONS = [
  { label: "FO", value: "fo" },
  { label: "Radio", value: "radio" },
  { label: "All", value: "all" },
] as const;

export const TICKET_COMPARISON_OPTIONS = [
  { label: "TSEL vs All", value: "tsel-vs-all" },
  { label: "TSEL only", value: "tsel" },
];

export const TICKET_AREA_OPTIONS = [
  { label: "NATIONWIDE", value: "nationwide" },
  { label: "AREA 1", value: "area-1" },
  { label: "AREA 2", value: "area-2" },
  { label: "AREA 3", value: "area-3" },
  { label: "AREA 4", value: "area-4" },
];

export const TICKET_PERIOD_OPTIONS = [
  { label: "June 2026", value: "2026-06" },
  { label: "May 2026", value: "2026-05" },
  { label: "April 2026", value: "2026-04" },
];

export const TICKET_SEVERITY_OPTIONS: Array<{
  label: string;
  value: TicketSeverityFilter;
}> = [
  { label: "All Severity", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "Major", value: "major" },
  { label: "Minor", value: "minor" },
];

export const SAMPLE_TICKET_LAST_UPDATED =
  "Week 24 (12 Juni 2026 - 18 Juni 2026)";

export const SAMPLE_TICKET_HIGHLIGHT: TicketHighlightSummary = {
  groups: [
    {
      group: "jawa",
      label: "Jawa",
      totalAch: 12,
      totalAchMom: 2,
      totalNotAch: 0,
      totalNotAchMom: -3,
      severities: [
        { severity: "critical", target: 87.8, achievement: 91.3, notAchieved: 0 },
        { severity: "major", target: 89.3, achievement: 91.1, notAchieved: 0 },
        { severity: "minor", target: 93.7, achievement: 94.8, notAchieved: 0 },
      ],
    },
    {
      group: "non_jawa",
      label: "Non Jawa",
      totalAch: 413,
      totalAchMom: 2,
      totalNotAch: 92,
      totalNotAchMom: -3,
      severities: [
        { severity: "critical", target: 87.8, achievement: 88.3, notAchieved: 0 },
        { severity: "major", target: 89.3, achievement: 88.1, notAchieved: 0 },
        { severity: "minor", target: 93.7, achievement: 93.3, notAchieved: 0 },
      ],
    },
  ],
  bestRegions: [
    { region: "JABOTABEK INNER", achievement: 100 },
    { region: "SUMBAGUT", achievement: 100 },
    { region: "KALIMANTAN", achievement: 100 },
    { region: "SUMBAGSEL", achievement: 100 },
    { region: "JAWA BARAT", achievement: 100 },
  ],
  worstRegions: [
    { region: "PUMA", achievement: 63.3 },
    { region: "BALI NUSRA", achievement: 72.5 },
    { region: "SULAWESI", achievement: 77.5 },
    { region: "JAWA TENGAH", achievement: 82.5 },
    { region: "JABOTABEK OUTER", achievement: 84.6 },
  ],
};

export const SAMPLE_TICKET_MAP: TicketSeverityMap = {
  min: 2,
  max: 280,
  totalTicketOpen: 289,
  regions: [
    { region: "JABOTABEK INNER", ticketOpen: 8 },
    { region: "JABOTABEK OUTER", ticketOpen: 12 },
    { region: "JAWA BARAT", ticketOpen: 6 },
    { region: "JAWA TENGAH", ticketOpen: 9 },
    { region: "JAWA TIMUR", ticketOpen: 4 },
    { region: "BALI NUSRA", ticketOpen: 74 },
    { region: "KALIMANTAN", ticketOpen: 280 },
    { region: "SULAWESI", ticketOpen: 95 },
    { region: "SUMBAGUT", ticketOpen: 20 },
    { region: "SUMBAGTENG", ticketOpen: 265 },
    { region: "SUMBAGSEL", ticketOpen: 105 },
    { region: "PUMA", ticketOpen: 49 },
  ],
};

export const SAMPLE_TICKET_REGION_PERFORMANCE: TicketRegionPerformanceRow[] = [
  {
    region: "Jawa",
    parent: true,
    target: 89.3,
    achieved: 12,
    notAchieved: 0,
    achievement: 100,
    totalTicket: 12,
    ticketOpen: { green: 4, yellow: 3, red: 5 },
  },
  {
    region: "JABOTABEK INNER",
    target: 91.2,
    achieved: 2,
    notAchieved: 0,
    achievement: 100,
    totalTicket: 2,
    ticketOpen: { green: 1, yellow: 1, red: 0 },
  },
  {
    region: "JAWA BARAT",
    target: 90.3,
    achieved: 0,
    notAchieved: 0,
    achievement: 100,
    totalTicket: 0,
    ticketOpen: { green: 0, yellow: 0, red: 0 },
  },
  {
    region: "JAWA TENGAH",
    target: 91.35,
    achieved: 2,
    notAchieved: 0,
    achievement: 100,
    totalTicket: 2,
    ticketOpen: { green: 0, yellow: 1, red: 1 },
  },
  {
    region: "JAWA TIMUR",
    target: 93.2,
    achieved: 0,
    notAchieved: 0,
    achievement: 100,
    totalTicket: 0,
    ticketOpen: { green: 0, yellow: 0, red: 0 },
  },
  {
    region: "JABOTABEK OUTER",
    target: 92.2,
    achieved: 0,
    notAchieved: 0,
    achievement: 100,
    totalTicket: 8,
    ticketOpen: { green: 3, yellow: 2, red: 3 },
  },
  {
    region: "Non Jawa",
    parent: true,
    target: 90.2,
    achieved: 413,
    notAchieved: 92,
    achievement: 81.8,
    totalTicket: 505,
    ticketOpen: { green: 233, yellow: 151, red: 121 },
  },
  {
    region: "SUMBAGUT",
    target: 93.2,
    achieved: 17,
    notAchieved: 3,
    achievement: 85,
    totalTicket: 20,
    ticketOpen: { green: 10, yellow: 6, red: 4 },
  },
  {
    region: "SUMBAGSEL",
    target: 94.2,
    achieved: 93,
    notAchieved: 12,
    achievement: 88.6,
    totalTicket: 105,
    ticketOpen: { green: 48, yellow: 31, red: 26 },
  },
  {
    region: "BALI NUSRA",
    target: 91.2,
    achieved: 69,
    notAchieved: 5,
    achievement: 93.2,
    totalTicket: 74,
    ticketOpen: { green: 32, yellow: 22, red: 20 },
  },
  {
    region: "KALIMANTAN",
    target: 90.2,
    achieved: 81,
    notAchieved: 26,
    achievement: 75.7,
    totalTicket: 107,
    ticketOpen: { green: 46, yellow: 34, red: 27 },
  },
  {
    region: "SULAWESI",
    target: 88.2,
    achieved: 74,
    notAchieved: 21,
    achievement: 77.9,
    totalTicket: 95,
    ticketOpen: { green: 41, yellow: 30, red: 24 },
  },
  {
    region: "SUMBAGTENG",
    target: 88.2,
    achieved: 48,
    notAchieved: 7,
    achievement: 87.3,
    totalTicket: 55,
    ticketOpen: { green: 25, yellow: 16, red: 14 },
  },
  {
    region: "PUMA",
    target: 89.2,
    achieved: 31,
    notAchieved: 18,
    achievement: 63.3,
    totalTicket: 49,
    ticketOpen: { green: 22, yellow: 12, red: 15 },
  },
];

export const SAMPLE_TICKET_HIGHEST_TTR: TicketHighestTtr = {
  area: "Area 1",
  totalTicket: 80,
  slices: [
    { label: "TIER1TELKOMSEL", value: 64, percentage: 80 },
    { label: "TIF ASR MOBILE SERV OPS AREA 1", value: 8, percentage: 10 },
    { label: "TIF MSO-6", value: 8, percentage: 10 },
  ],
};

export const SAMPLE_TICKET_TREND: TicketTrendPoint[] = [
  { month: "Jan", jawa: 95.0, nonJawa: 92.6 },
  { month: "Feb", jawa: 94.2, nonJawa: 93.0 },
  { month: "Mar", jawa: 90.1, nonJawa: 94.0 },
  { month: "Apr", jawa: 90.3, nonJawa: 94.0 },
  { month: "Mei", jawa: 96.3, nonJawa: 91.0 },
  { month: "Jun", jawa: 90.3, nonJawa: 94.0 },
  { month: "Jul", jawa: 91.3, nonJawa: 94.0 },
  { month: "Agu", jawa: 96.3, nonJawa: 90.6 },
  { month: "Sep", jawa: 96.5, nonJawa: 90.3 },
];

export const SAMPLE_TICKET_DISTRIBUTION: TicketAchievementDistribution = {
  totalAchieved: 425,
  totalNotAchieved: 92,
};
