

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

import Traffic from "./Traffic";
import React, { useEffect, useState } from "react";
import MTTR from "./MTTR";
import PopupUpload from "./PopupUpload";
import { qosmoUrl } from "@/modules/vaccess/utils/qosmoApi";

interface WeekFilterItem {
  year: number;
  week: number;
  start: string;
  end: string;
}

interface WeekRcaItem {
  year: number;
  month: number;
  week: string | number;
  label: string;
  start: string;
  end: string;
}

interface HeaderType {
  headers: {
    Rtoken: string;
  };
}

let HEADER: HeaderType = { headers: { Rtoken: "" } };
try {
  const data = JSON.parse(localStorage.getItem("user_data") ?? "{}");
  HEADER = {
    headers: {
      Rtoken: btoa(data.level_user ?? ""),
    },
  };
} catch (error) {
  // console.log(error)
}

function getFriday(date: string | number | Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Min ... 5=Jum
  const diff = day >= 5 ? day - 5 : day + 2;
  d.setDate(d.getDate() - diff);
  return d;
}

function formatYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekNumberFriday(date: string | number | Date): number {
  const d = new Date(date);
  const year = d.getFullYear();

  // 1 Januari tahun tersebut
  const jan1 = new Date(year, 0, 1);

  // Cari Jumat pertama
  const firstFriday = new Date(jan1);
  const day = jan1.getDay(); // 0=Sun ... 5=Fri
  const diff = (5 - day + 7) % 7;
  firstFriday.setDate(jan1.getDate() + diff);

  // Kalau tanggal sebelum Jumat pertama,
  // berarti masuk week terakhir tahun sebelumnya
  if (d < firstFriday) {
    return getWeekNumberFriday(new Date(year - 1, 11, 31));
  }

  const daysDiff = Math.floor((d.getTime() - firstFriday.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7) + 1;
}

function generate52Weeks(max_year = 0, max_week = 0, totalWeeks = 52, today = new Date()): WeekFilterItem[] {
  const result: WeekFilterItem[] = [];

  const currentFriday = getFriday(today);

  const startFriday = new Date(currentFriday);
  startFriday.setDate(startFriday.getDate() - (totalWeeks - 1) * 7);

  const cursor = new Date(startFriday);

  while (cursor <= currentFriday) {
    const start = new Date(cursor);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    if (start.getFullYear() === max_year && getWeekNumberFriday(start) > max_week) {
      // do nothing
    } else {
      result.push({
        year: start.getFullYear(),
        week: getWeekNumberFriday(start),
        start: formatYMD(start),
        end: formatYMD(end),
      });
    }

    cursor.setDate(cursor.getDate() + 7);
  }

  return result.reverse();
}

function generateWeeksByMonth(year: number, month: number): WeekRcaItem[] {
  const result: WeekRcaItem[] = [];

  const jan1 = new Date(year, 0, 1);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);

  // Cari Kamis pertama di tahun itu
  const firstThursday = new Date(jan1);
  const day = firstThursday.getDay();
  const diff = (4 - day + 7) % 7; // 4 = Kamis
  firstThursday.setDate(firstThursday.getDate() + diff);

  const cursor = new Date(firstThursday);
  let week = 1;

  while (cursor <= lastDayOfMonth) {
    const start = new Date(cursor);
    const end = new Date(cursor);
    end.setDate(start.getDate() + 6); // Kamis → Rabu
    // Kalau bersinggungan dengan bulan
    if (end >= firstDayOfMonth && start <= lastDayOfMonth) {
      result.push({
        year,
        month,
        week,
        label: `W${week}`,
        start: formatYMD(start < firstDayOfMonth ? firstDayOfMonth : start),
        end: formatYMD(end > lastDayOfMonth ? lastDayOfMonth : end),
      });
    }

    week++;
    cursor.setDate(cursor.getDate() + 7);
  }

  // Full Month
  result.push({
    year,
    month,
    week: "FM",
    label: "FM",
    start: formatYMD(firstDayOfMonth),
    end: formatYMD(lastDayOfMonth),
  });

  return result;
}

function getInitialWeekSelection() {
  const todayFriday = getFriday(new Date());
  const week = getWeekNumberFriday(todayFriday);
  const year = todayFriday.getFullYear();
  return `${week}-${year}`;
}

const ResumeRCA = () => {
  const [PARAMETER, setParameter] = useState("packetloss_>5%");
  const [FILTER] = useState({ max_year: 0, max_week: 0, years: [] });
  const [_LOADING, setLOADING] = useState(false);
  const [WEEK, setWeek] = useState(getInitialWeekSelection());
  const [WEEKStart, setWeekStart] = useState<string | number>("");
  const [WEEKEnd, setWeekEnd] = useState<string | number>("");
  const [YEAR, setYear] = useState(0);
  const [MONTH, setMonth] = useState(0);
  const [MAXYEAR, setMaxYear] = useState(0);
  const [MAXWEEK, setMaxWeek] = useState(0);
  const [MAXMONTH, setMaxMonth] = useState(0);
  const [YEARS] = useState<number[]>([]);
  const [POPUPLOAD, setPOPUPLOAD] = useState(false);
  const [_BOOTSTRAPPING, setBOOTSTRAPPING] = useState(true);

  const MONTHS = [
    { month: 1, name: "January" },
    { month: 2, name: "February" },
    { month: 3, name: "March" },
    { month: 4, name: "April" },
    { month: 5, name: "May" },
    { month: 6, name: "June" },
    { month: 7, name: "July" },
    { month: 8, name: "August" },
    { month: 9, name: "September" },
    { month: 10, name: "October" },
    { month: 11, name: "November" },
    { month: 12, name: "December" },
  ];

  const WEEKS52 = React.useMemo(() => {
    return generate52Weeks(FILTER.max_year, FILTER.max_week);
  }, [FILTER.max_year, FILTER.max_week]);

  const [WEEKSRCA, setWeekRCA] = useState<WeekRcaItem[]>([]);

  async function setWeekFilter() {
    setBOOTSTRAPPING(true);
    try {
      let D: any = {};
      if (!PARAMETER.includes("MTTR")) {
        const res = await fetch(qosmoUrl("/baseapi/vrca.php?cmd=last-week-twamp"), HEADER);
        const { data } = await res.json();
        D = data;
      } else {
        const res = await fetch(qosmoUrl("/baseapi/vrca.php?cmd=last-week-ticket"), HEADER);
        const { data } = await res.json();
        D = data;
      }

      const maxWeek = Number(D.max_week);
      const maxYear = Number(D.max_year);
      setYear(D.max_year);
      setMaxYear(Number(maxYear));
      setMaxWeek(Number(maxWeek));
      if (PARAMETER.includes("MTTR")) {
        setMaxMonth(Number(D.max_month));
        setMonth(Number(D.max_month));
      }
      setWeek(`${maxWeek}-${maxYear}`);
    } finally {
      setBOOTSTRAPPING(false);
    }
  }

  useEffect(() => {
    setWeekFilter();
    const now = new Date();
    for (let i = Number(now.getFullYear()); i >= 2025; i--) {
      if (!YEARS.includes(i)) {
        YEARS.push(i);
      }
    }
  }, [PARAMETER]);

  useEffect(() => {
    if (PARAMETER.includes("MTTR")) {
      const wrca = generateWeeksByMonth(2026, MONTH).filter((a) => (typeof a.week === "number" && a.week < MAXWEEK) || a.week === "FM").reverse();
      if (wrca[1]) {
        setWeekRCA([...wrca]);
        setWeek(`${Number(wrca[1].week) > MAXWEEK ? MAXWEEK : wrca[1].week}-${YEAR}`);
        setWeekStart(wrca[wrca.length - 1].week);
        setWeekEnd(wrca[1].week);
      }
    }
  }, [MONTH, PARAMETER]);

  return (
    <div className="bg-white text-gray-800 p-2 grid grid-cols-2 gap-2 overflow-hidden" style={{ fontFamily: "Poppins", height: "auto" }}>
      {POPUPLOAD && <PopupUpload close={() => setPOPUPLOAD(false)}></PopupUpload>}
      <div className="flex gap-2" style={{ fontSize: "0.8em", height: "fit-content" }}>
        <div className="flex">
          <div className="border px-4 py-1 rounded-l-sm">PARAMETER</div>
          <select
            onChange={(e) => setParameter(e.target.value)}
            value={PARAMETER}
            className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100"
          >
            <option value="packetloss_>5%">Packetloss 5%</option>
            <option value={"packetloss_1-5%"}>Packetloss 1-5%</option>
            <option value={"latency"}>LATENCY</option>
            <option value={"jitter"}>JITTER</option>
            <option>MTTRq Critical</option>
            <option>MTTRq Major</option>
            <option>MTTRq Minor</option>
          </select>
        </div>
        {PARAMETER.includes("MTTR") && (
          <React.Fragment>
            <div className="flex">
              <div className="border px-4 py-1 rounded-l-sm">Year</div>
              <select
                onChange={(e) => setYear(Number(e.target.value))}
                value={YEAR}
                className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100"
              >
                {YEARS.map((a, i) => {
                  return (
                    <option value={a} key={i}>
                      {a}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex">
              <div className="border px-4 py-1 rounded-l-sm">Month</div>
              <select
                onChange={(e) => setMonth(Number(e.target.value))}
                value={MONTH}
                className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100"
              >
                {MONTHS.map((a, i) => {
                  if (YEAR === new Date().getFullYear() && a.month <= MAXMONTH) {
                    return (
                      <option value={a.month} key={i}>
                        {a.name}
                      </option>
                    );
                  } else if (YEAR < new Date().getFullYear()) {
                    return (
                      <option value={a.month} key={i}>
                        {a.name}
                      </option>
                    );
                  }
                  return null;
                })}
              </select>
            </div>
            <div className="flex">
              <div className="border px-4 py-1 rounded-l-sm">WEEK</div>
              <select
                onChange={(e) => setWeek(e.target.value)}
                value={WEEK}
                className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100"
              >
                {WEEKSRCA.map((a, i) => {
                  if (String(a.week).includes("FM")) {
                    return (
                      <option value={`${a.week}-${YEAR}`} key={i}>
                        {`${a.week} ${YEAR}`}
                      </option>
                    );
                  } else if (YEAR === new Date().getFullYear() && Number(a.week) <= MAXWEEK) {
                    return (
                      <option value={`${a.week}-${YEAR}`} key={i}>
                        {`W${a.week} ${YEAR}`}
                      </option>
                    );
                  } else if (YEAR < new Date().getFullYear()) {
                    return (
                      <option value={`${a.week}-${YEAR}`} key={i}>
                        {`W${a.week} ${YEAR}`}
                      </option>
                    );
                  }
                  return null;
                })}
              </select>
            </div>
          </React.Fragment>
        )}
        {!PARAMETER.includes("MTTR") && (
          <div className="flex">
            <div className="border px-4 py-1 rounded-l-sm">WEEK</div>
            <select
              onChange={(e) => setWeek(e.target.value)}
              value={WEEK}
              className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100"
            >
              {WEEKS52.map((a, i) => {
                if (Number(a.year) < MAXYEAR || (Number(a.year) === MAXYEAR && a.week <= MAXWEEK)) {
                  return (
                    <option value={`${a.week}-${a.year}`} key={i}>
                      {`W${a.week} ${a.year}`}
                    </option>
                  );
                }
                return null;
              })}
            </select>
          </div>
        )}
      </div>
      <div></div>
      {PARAMETER !== "MTTRq Major" && PARAMETER !== "MTTRq Minor" && PARAMETER !== "MTTRq Critical" ? (
        <Traffic mode={PARAMETER} week={WEEK} setLOADING={setLOADING} />
      ) : (
        <MTTR parameter={PARAMETER} week={WEEK} weekstart={String(WEEKStart)} weekend={String(WEEKEnd)} setLOADING={setLOADING} />
      )}
    </div>
  );
};

export default ResumeRCA;
