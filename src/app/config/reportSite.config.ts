import { PARAMETER_OPTIONS } from "@/app/config/rekonsiliasi.config";

export const REPORT_SITE_PARAMETER_OPTIONS = PARAMETER_OPTIONS;

export const REPORT_SITE_MONTH_OPTIONS = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

/** Halaman hanya menampilkan tahun ini dan tahun sebelumnya. */
export const buildReportSiteYearOptions = () =>
  Array.from({ length: 2 }, (_, index) => {
    const year = new Date().getFullYear() - index;

    return { label: String(year), value: String(year) };
  });

export const MTTRQ_DESCRIPTION =
  "MTTRQ (Mean Time To Repair and Quality) is a metric used to measure the average time taken to repair and restore a system or service after a failure or outage, including the quality of the repair process.";
