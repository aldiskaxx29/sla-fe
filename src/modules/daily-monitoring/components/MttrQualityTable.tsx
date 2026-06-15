import type { MttrQualityRow } from "../types";

const mttrQualityRows: MttrQualityRow[] = [
  {
    no: "1",
    area: "Area-1",
    reg: "Sumbagut",
    openFoRip: "4 | 3 | 1",
    kuningMerah96Jam: "0/1/3",
    closingTicketH1: "0",
    closingTicketH: "0",
    doneTaPst: "0 | 0",
    achTaPst: "0% | 0% | 0%",
    achLevel: "danger",
  },
  {
    no: "2",
    area: "Area-1",
    reg: "Sumbagteng",
    openFoRip: "9 | 9 | 0",
    kuningMerah96Jam: "1/0/8",
    closingTicketH1: "1",
    closingTicketH: "1",
    doneTaPst: "1 | 0",
    achTaPst: "11% | 11% | 0%",
    achLevel: "danger",
  },
  {
    no: "3",
    area: "Area-1",
    reg: "Sumbagsel",
    openFoRip: "15 | 4 | 11",
    kuningMerah96Jam: "6/0/9",
    closingTicketH1: "3",
    closingTicketH: "1",
    doneTaPst: "1 | 0",
    achTaPst: "7% | 25% | 0%",
    achLevel: "danger",
  },
  {
    no: "3",
    area: "Area-2",
    reg: "Jabotabek Inner",
    openFoRip: "2 | 2 | 0",
    kuningMerah96Jam: "2/0/0",
    closingTicketH1: "-",
    closingTicketH: "0",
    doneTaPst: "0 | 0",
    achTaPst: "0% | 0% | 0%",
    achLevel: "danger",
  },
  {
    no: "3",
    area: "Area3",
    reg: "Jawa Tengah",
    openFoRip: "1 | 1 | 0",
    kuningMerah96Jam: "1/0/0",
    closingTicketH1: "-",
    closingTicketH: "0",
    doneTaPst: "0 | 0",
    achTaPst: "0% | 0% | 0%",
    achLevel: "danger",
  },
  {
    no: "3",
    area: "Area3",
    reg: "Jawa Timur",
    openFoRip: "1 | 1 | 0",
    kuningMerah96Jam: "1/0/0",
    closingTicketH1: "-",
    closingTicketH: "0",
    doneTaPst: "0 | 0",
    achTaPst: "0% | 0% | 0%",
    achLevel: "danger",
  },
  {
    no: "3",
    area: "Area3",
    reg: "Balinusra",
    openFoRip: "8 | 7 | 1",
    kuningMerah96Jam: "2/0/6",
    closingTicketH1: "-",
    closingTicketH: "2",
    doneTaPst: "2 | 0",
    achTaPst: "25% | 29% | 0%",
    achLevel: "danger",
  },
  {
    no: "4",
    area: "Area-4",
    reg: "Kalimantan",
    openFoRip: "40 | 14 | 26",
    kuningMerah96Jam: "13/3/24",
    closingTicketH1: "4",
    closingTicketH: "2",
    doneTaPst: "0 | 2",
    achTaPst: "5% | 0% | 8%",
    achLevel: "danger",
  },
  {
    no: "5",
    area: "Area-4",
    reg: "Sulawesi",
    openFoRip: "11 | 5 | 6",
    kuningMerah96Jam: "4/0/7",
    closingTicketH1: "2",
    closingTicketH: "0",
    doneTaPst: "0 | 0",
    achTaPst: "0% | 0% | 0%",
    achLevel: "danger",
  },
  {
    no: "6",
    area: "Area-4",
    reg: "Puma",
    openFoRip: "17 | 3 | 14",
    kuningMerah96Jam: "4/0/13",
    closingTicketH1: "0",
    closingTicketH: "0",
    doneTaPst: "0 | 0",
    achTaPst: "0% | 0% | 0%",
    achLevel: "danger",
  },
  {
    no: "",
    area: "Total",
    reg: "",
    openFoRip: "108 | 49 | 59",
    kuningMerah96Jam: "34/4/70",
    closingTicketH1: "10",
    closingTicketH: "6",
    doneTaPst: "0 | 4",
    achTaPst: "6% | 8% | 3%",
    achLevel: "danger",
  },
];

// const achToneClass: Record<MttrQualityLevel, string> = {
//   good: "bg-emerald-600/20 border-[1px] border-emerald-600/30 text-emerald-600",
//   warning: "bg-amber-500/20 border-[1px] border-amber-500/30 text-amber-500",
//   danger: "bg-rose-600/20 border-[1px] border-rose-600/30 text-rose-600",
// };

const renderSplitValue = (value: string) =>
  value.split("|").map((part, index, array) => (
    <span key={`${part}-${index}`} className={index === 0 ? "font-medium" : ""}>
      {part.trim()}
      {index < array.length - 1 ? (
        <span className="px-1 text-slate-400">|</span>
      ) : null}
    </span>
  ));

type MttrQualityTableProps = {
  rows?: MttrQualityRow[];
};

const MttrQualityTable = ({ rows }: MttrQualityTableProps) => {
  const colWidths = [
    "5%",
    "12%",
    "14%",
    "14%",
    "17%",
    "8%",
    "8%",
    "10%",
    "12%",
  ];
  const tableRows = rows ?? mttrQualityRows;

  return (
    <section className="rounded-2xl border border-[#D8DEE6] bg-white">
      <div className="border-b border-[#D8DEE6] px-4 py-3">
        <h2 className="daily-monitoring-section-title font-bold uppercase tracking-wide text-blue-600">
          B. MTTR QUALITY CNOP MERAH
        </h2>
      </div>

      <div>
        <table className="daily-monitoring-table w-full border-collapse table-fixed text-center text-[26px] lg:text-[28px]">
          <colgroup>
            {colWidths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]"
              >
                No
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]"
              >
                Area
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]"
              >
                Reg
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]"
              >
                Open | FO | RIP
              </th>
              <th
                rowSpan={2}
                className="dm-th-compact border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[18px] font-semibold leading-none whitespace-nowrap text-black lg:text-[20px] "
              >
                Kuning/Merah/&gt;96 Jam
              </th>
              <th
                colSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]"
              >
                Closing Ticket
              </th>
              <th className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-3 py-2.5 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]">
                Done
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-3 py-2.5 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]"
              >
                Ach | TA | PST
              </th>
            </tr>
            <tr>
              <th className="dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[19px]">
                H-1
              </th>
              <th className="dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[19px]">
                H
              </th>
              <th className="dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[19px]">
                TA | PST
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, index) => {
              const isTotalRow = row.area === "Total";
              const rowClass = isTotalRow
                ? "bg-[#d1d5db] font-bold text-black"
                : index % 2 === 0
                  ? "bg-white"
                  : "bg-slate-50";

              return (
                <tr key={index} className={rowClass}>
                  <td className="border border-[#D8DEE6] px-4 py-3 font-medium text-slate-700">
                    {row.no}
                  </td>

                  {isTotalRow ? (
                    <td
                      colSpan={2}
                      className="border border-[#D8DEE6] px-4 py-3 font-bold uppercase text-center text-slate-800"
                    >
                      {row.area}
                    </td>
                  ) : (
                    <>
                      <td className="border border-[#D8DEE6] px-4 py-3 font-semibold text-slate-800">
                        {row.area}
                      </td>
                      <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                        {row.reg}
                      </td>
                    </>
                  )}

                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.openFoRip}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.kuningMerah96Jam}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.closingTicketH1}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.closingTicketH}
                  </td>
                  <td className="border border-[#D8DEE6] px-3 py-2.5 text-slate-700">
                    {row.doneTaPst}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3">
                    <div className="flex items-center justify-center h-full">
                      <div
                        className={`dm-badge inline-flex items-center gap-3 rounded-full px-4 py-2 text-[22px] font-semibold leading-none`}
                      >
                        <span
                          className={`block aspect-square h-4 w-4 shrink-0 rounded-full ${row.achLevel === "good" ? "bg-emerald-500" : "bg-rose-500"}`}
                        ></span>
                        <span className="flex items-center">
                          {renderSplitValue(row.achTaPst)}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="daily-monitoring-notes space-y-2 border-t border-[#D8DEE6] bg-white px-4 py-5 text-4xl leading-[1.5] text-slate-600">
        <p className="font-semibold text-slate-700">Keterangan:</p>
        <p>Kuning: TTR &lt; Threshold</p>
        <p>Merah: TTR &gt; Threshold</p>
        <p>- : Tidak ada Ticket</p>
        <p className="mt-2 font-semibold text-slate-700">Sumber Data:</p>
        <p>
          <a
            href="https://qosmo.telkom.co.id/ticket"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-sky-700 underline"
          >
            MTTRq: https://qosmo.telkom.co.id/ticket
          </a>
        </p>
      </div>
    </section>
  );
};

export default MttrQualityTable;
