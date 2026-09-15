import { useEffect, useMemo, useRef, useState } from "react";

import dayjs from "dayjs";

import {
  DEFAULT_PARAMETER,
  EVIDENCE_OPTIONS,
  EXCLUDE_OPTIONS,
  MTTRQ_PARAMETERS,
  PARAMETER_OPTIONS,
  SITE_TYPE_OPTIONS,
} from "@/app/config/rekonsiliasi.config";

import { useYearWeekQuery } from "@/app/hooks/query/reconsiliation/useRekonsiliasiQueries";

import type { FilterWeekGroup } from "@/app/types/reconsiliation/rekonsiliasi.types";

export const useRekonsiliasiPeriod = () => {
  const { data: yearWeek, isPending: isYearWeekPending } = useYearWeekQuery();

  const [parameter, setParameter] = useState(DEFAULT_PARAMETER);
  const [prev, setPrev] = useState("corrective");
  const [exclude, setExclude] = useState("all");
  const [evidence, setEvidence] = useState("all");
  const [year, setYear] = useState(String(dayjs().year()));
  const [month, setMonth] = useState(String(dayjs().month() + 1));
  const [week, setWeek] = useState("");

  const hasAppliedActivePeriod = useRef(false);
  const [hasActivePeriod, setHasActivePeriod] = useState(false);

  const isMttrqParameter = MTTRQ_PARAMETERS.includes(parameter);

  const filterWeeks = useMemo<FilterWeekGroup[]>(() => {
    const fromApi = yearWeek?.filterWeeks;
    if (!Array.isArray(fromApi) || !fromApi.length) return [];

    return fromApi.map((item) => ({
      month: String(item?.month ?? ""),
      value: Array.isArray(item?.value) ? item.value.map(String) : [],
    }));
  }, [yearWeek]);

  const selectedWeeks = useMemo(
    () => filterWeeks.find((item) => item.month === month)?.value ?? [],
    [filterWeeks, month],
  );

  const effectiveWeek = useMemo(() => {
    if (isMttrqParameter) return "";
    if (week) return week;
    return selectedWeeks.find((item) => item !== "all") ?? selectedWeeks[0] ?? "";
  }, [isMttrqParameter, selectedWeeks, week]);

  useEffect(() => {
    if (!yearWeek || hasAppliedActivePeriod.current) return;
    hasAppliedActivePeriod.current = true;
    setHasActivePeriod(true);

    const activeYear = String(yearWeek.active_yearweek ?? "").slice(0, 4);
    if (activeYear) setYear(activeYear);
    if (yearWeek.active_month) setMonth(String(yearWeek.active_month));
    if (yearWeek.active_week) setWeek(String(yearWeek.active_week));
  }, [yearWeek]);

  useEffect(() => {
    if (isMttrqParameter || !selectedWeeks.length) return;

    const fallbackWeek =
      selectedWeeks.find((item) => item !== "all") ?? selectedWeeks[0];

    if (!week || !selectedWeeks.includes(week)) setWeek(fallbackWeek);
  }, [isMttrqParameter, selectedWeeks, week]);

  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        (yearWeek?.data ?? [])
          .map((item) => String(item ?? "").slice(0, 4))
          .filter(Boolean),
      ),
    ).sort();

    return years.map((item) => ({ label: item, value: item }));
  }, [yearWeek]);

  const monthOptions = useMemo(
    () =>
      filterWeeks.map((item) => ({
        label: dayjs()
          .month(Number(item.month) - 1)
          .format("MMMM"),
        value: item.month,
      })),
    [filterWeeks],
  );

  const weekOptions = useMemo(
    () =>
      selectedWeeks.map((item) => ({
        label: item === "all" ? "Week All" : `Week ${item}`,
        value: item,
      })),
    [selectedWeeks],
  );

  return {
    parameter,
    setParameter,
    prev,
    setPrev,
    exclude,
    setExclude,
    evidence,
    setEvidence,
    year,
    setYear,
    month,
    setMonth,
    week,
    setWeek,
    effectiveWeek,
    isMttrqParameter,
    isReady: !isYearWeekPending,
    isSettled:
      !isYearWeekPending &&
      (!yearWeek ||
        (hasActivePeriod &&
          (isMttrqParameter ||
            !selectedWeeks.length ||
            selectedWeeks.includes(week)))),
    options: {
      parameter: PARAMETER_OPTIONS,
      siteType: SITE_TYPE_OPTIONS,
      exclude: EXCLUDE_OPTIONS,
      evidence: EVIDENCE_OPTIONS,
      year: yearOptions,
      month: monthOptions,
      week: weekOptions,
    },
  };
};

export type RekonsiliasiPeriod = ReturnType<typeof useRekonsiliasiPeriod>;
