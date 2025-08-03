import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const getMonthWeeks = (date) => {
  if (!date) return { month: "", weeks: [], days: [] };

  const month = date.month() + 1;
  const year = date.year();

  const firstDay = dayjs(`${year}-${date.month() + 1}-01`);
  const lastDay = firstDay.endOf("month");

  const weeks = [];
  const days = [];
  let startOfWeek = firstDay;

  // Adjust the first week to start on Friday
  while (startOfWeek.day() !== 5) {
    startOfWeek = startOfWeek.subtract(1, "day");
  }

  let weekCount = 1;

  while (startOfWeek.isBefore(lastDay)) {
    const endOfWeek = startOfWeek.add(6, "day"); // Thursday
    const weekRange = `${startOfWeek.date()}-${endOfWeek.date()} Week ${
      weekCount - 1
    }`;

    weeks.push(weekRange);
    days.push({ start: startOfWeek, end: endOfWeek, label: weekRange });

    startOfWeek = startOfWeek.add(7, "day"); // Move to next Friday
    weekCount++;
  }

  return { month, weeks, days };
};
