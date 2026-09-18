import { useEffect, useMemo, useState } from "react";

import { useLastWeekQuery } from "@/app/hooks/query/resume-rca/resumeRca";

import {
  generate52Weeks,
  generateWeeksByMonth,
  getInitialWeekSelection,
  isMttrParameter,
  MONTH_OPTIONS,
} from "@/app/utils/resumeRca.utils";

const DEFAULT_PARAMETER = "packetloss_>5%";
const FIRST_YEAR = 2025;

export const RESUME_RCA_PARAMETER_OPTIONS = [
  { label: "Packetloss 5%", value: "packetloss_>5%" },
  { label: "Packetloss 1-5%", value: "packetloss_1-5%" },
  { label: "Latency", value: "latency" },
  { label: "Jitter", value: "jitter" },
  { label: "MTTRq Critical", value: "MTTRq Critical" },
  { label: "MTTRq Major", value: "MTTRq Major" },
  { label: "MTTRq Minor", value: "MTTRq Minor" },
];

/**
 * State filter halaman Resume RCA: parameter, tahun/bulan (khusus MTTRq), dan
 * minggu. Nilai maksimum minggu/bulan diambil dari API `last-week-*`.
 */
export const useResumeRcaFilter = () => {
  const [parameter, setParameter] = useState(DEFAULT_PARAMETER);
  const [week, setWeek] = useState(getInitialWeekSelection());
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");

  const isMttr = isMttrParameter(parameter);
  const lastWeek = useLastWeekQuery(isMttr);

  const maxWeek = lastWeek.data?.maxWeek ?? 0;
  const maxYear = lastWeek.data?.maxYear ?? 0;
  const maxMonth = lastWeek.data?.maxMonth ?? 0;

  useEffect(() => {
    if (!lastWeek.data) return;

    setYear(maxYear);
    if (isMttr) setMonth(maxMonth);
    setWeek(`${maxWeek}-${maxYear}`);
  }, [isMttr, lastWeek.data, maxMonth, maxWeek, maxYear]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];

    for (let value = currentYear; value >= FIRST_YEAR; value -= 1) {
      years.push(value);
    }

    return years;
  }, []);

  const weeks52 = useMemo(() => generate52Weeks(), []);

  const monthWeeks = useMemo(() => {
    if (!isMttr || !year || !month) return [];

    return generateWeeksByMonth(year, month)
      .filter(
        (item) =>
          (typeof item.week === "number" && item.week < maxWeek) ||
          item.week === "FM",
      )
      .reverse();
  }, [isMttr, maxWeek, month, year]);

  useEffect(() => {
    if (!monthWeeks[1]) return;

    const latest = monthWeeks[1];
    const selected = Number(latest.week) > maxWeek ? maxWeek : latest.week;

    setWeek(`${selected}-${year}`);
    setWeekStart(String(monthWeeks[monthWeeks.length - 1].week));
    setWeekEnd(String(latest.week));
  }, [maxWeek, monthWeeks, year]);

  /** Opsi minggu TWAMP dibatasi sampai minggu terakhir yang punya data. */
  const weekOptions = useMemo(() => {
    if (isMttr) {
      return monthWeeks
        .filter((item) => {
          if (String(item.week).includes("FM")) return true;
          if (year === new Date().getFullYear()) return Number(item.week) <= maxWeek;

          return true;
        })
        .map((item) => ({
          label: String(item.week).includes("FM")
            ? `FM ${year}`
            : `W${item.week} ${year}`,
          value: `${item.week}-${year}`,
        }));
    }

    return weeks52
      .filter(
        (item) =>
          item.year < maxYear || (item.year === maxYear && item.week <= maxWeek),
      )
      .map((item) => ({
        label: `W${item.week} ${item.year}`,
        value: `${item.week}-${item.year}`,
      }));
  }, [isMttr, maxWeek, maxYear, monthWeeks, weeks52, year]);

  const monthOptions = useMemo(
    () =>
      MONTH_OPTIONS.filter((item) =>
        year === new Date().getFullYear() ? item.month <= maxMonth : true,
      ).map((item) => ({ label: item.name, value: String(item.month) })),
    [maxMonth, year],
  );

  return {
    parameter,
    setParameter,
    week,
    setWeek,
    year,
    setYear,
    month,
    setMonth,
    weekStart,
    weekEnd,
    isMttr,
    isLoadingPeriod: lastWeek.isPending,
    options: {
      parameter: RESUME_RCA_PARAMETER_OPTIONS,
      year: yearOptions.map((value) => ({
        label: String(value),
        value: String(value),
      })),
      month: monthOptions,
      week: weekOptions,
    },
  };
};

export type ResumeRcaFilter = ReturnType<typeof useResumeRcaFilter>;
