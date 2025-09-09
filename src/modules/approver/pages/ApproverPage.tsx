import { use, useCallback, useEffect, useState } from "react";
import { TableApprover } from "../components/TableApprover";
import AppDropdown from "@/app/components/AppDropdown";
import { Spin } from "antd";
import { useLazyApprover_fetchDataQuery } from "../rtk/approver.rtk";

const ApproverPage = () => {
  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const filterYear = Array.from({ length: 2 }, (_, i) => {
    const currentYear = new Date().getFullYear();
    const year = currentYear - i;
    return {
      label: `${year}`,
      value: `${year}`,
    };
  });
  const filterMonth = [
    {
      label: "January",
      value: "1",
    },
    {
      label: "February",
      value: "2",
    },
    {
      label: "March",
      value: "3",
    },
    {
      label: "April",
      value: "4",
    },
    {
      label: "May",
      value: "5",
    },
    {
      label: "June",
      value: "6",
    },
    {
      label: "July",
      value: "7",
    },
    {
      label: "August",
      value: "8",
    },
    {
      label: "September",
      value: "9",
    },
    {
      label: "October",
      value: "10",
    },
    {
      label: "November",
      value: "11",
    },
    {
      label: "December",
      value: "12",
    },
  ];
  const filterWeek = Array.from({ length: 52 }, (_, i) => ({
    label: `Week ${i + 1}`,
    value: `${i + 1}`,
  }));

  const [getApprover, { data }] = useLazyApprover_fetchDataQuery();

  const fetchApprover = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await getApprover({
        query: {},
      }).unwrap();
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [month, year, week]);

  const getDateWeek = (date) => {
    const currentDate = typeof date === "object" ? date : new Date();
    const januaryFirst = new Date(currentDate.getFullYear(), 0, 1);
    const daysToNextMonday =
      januaryFirst.getDay() === 1 ? 0 : (7 - januaryFirst.getDay()) % 7;
    const nextMonday = new Date(
      currentDate.getFullYear(),
      0,
      januaryFirst.getDate() + daysToNextMonday
    );

    return currentDate < nextMonday
      ? 52
      : currentDate > nextMonday
      ? Math.ceil((currentDate - nextMonday) / (24 * 3600 * 1000) / 7)
      : 1;
  };
  useEffect(() => {
    setWeek(getDateWeek(new Date()));
  }, []);

  useEffect(() => {
    fetchApprover();
  }, [year, week, month]);

  return (
    <div className="p-6">
      {loading && <Spin fullscreen tip="Sedang Memuat Data..." />}
      <div className="flex justify-end gap-4">
        <AppDropdown
          title="Month"
          placeholder="All"
          options={filterMonth}
          onChange={(value) => setMonth(Number(value))}
          value={month}
        />
        <AppDropdown
          title="Week"
          placeholder="All"
          options={filterWeek}
          onChange={(value) => setWeek(value)}
          value={week}
        />
        <AppDropdown
          title="Year"
          placeholder="All"
          options={filterYear}
          onChange={(value) => setYear(Number(value))}
          value={year}
        />
      </div>
      <TableApprover data={data} />
    </div>
  );
};

export default ApproverPage;
