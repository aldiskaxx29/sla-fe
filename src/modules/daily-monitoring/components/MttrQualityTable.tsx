type MttrQualityLevel = "good" | "warning" | "danger";

type MttrQualityRow = {
  no: string;
  area: string;
  reg: string;
  openFoRip: string;
  kuningMerah96Jam: string;
  closingTicketH1: string;
  closingTicketH: string;
  doneTaPst: string;
  achTaPst: string;
  achLevel: MttrQualityLevel;
};

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

const MttrQualityTable = () => {
  return (
    <section className="rounded-2xl border border-[#D8DEE6] bg-white">
      <div className="border-b border-[#D8DEE6] px-4 py-3">
        <h2 className="text-lg font-bold text-blue-600 uppercase tracking-wide">
          B. MTTR QUALITY CNOP MERAH
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1220px] border-collapse table-fixed text-center text-[16px]">
          <colgroup>
            <col style={{ width: "4%" }} /> {/* No */}
            <col style={{ width: "10%" }} /> {/* Area */}
            <col style={{ width: "12%" }} /> {/* Reg */}
            <col style={{ width: "14%" }} /> {/* Open | FO | RIP */}
            <col style={{ width: "16%" }} /> {/* Kuning/Merah/>96 Jam */}
            <col style={{ width: "7%" }} /> {/* Closing Ticket H-1 */}
            <col style={{ width: "7%" }} /> {/* Closing Ticket H */}
            <col style={{ width: "10%" }} /> {/* Done TA | PST */}
            <col style={{ width: "20%" }} /> {/* Ach | TA | PST */}
          </colgroup>
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="border border-[#D8DEE6] bg-gray-400 px-2 py-2 font-semibold text-black"
              >
                No
              </th>
              <th
                rowSpan={2}
                className="border border-[#D8DEE6] bg-gray-400 px-2 py-2 font-semibold text-black"
              >
                Area
              </th>
              <th
                rowSpan={2}
                className="border border-[#D8DEE6] bg-gray-400 px-2 py-2 font-semibold text-black"
              >
                Reg
              </th>
              <th
                rowSpan={2}
                className="border border-[#D8DEE6] bg-gray-400 px-2 py-2 font-semibold text-black"
              >
                Open | FO | RIP
              </th>
              <th
                rowSpan={2}
                className="border border-[#D8DEE6] bg-gray-400 px-2 py-2 font-semibold text-black"
              >
                Kuning/Merah/&gt;96 Jam
              </th>
              <th
                colSpan={2}
                className="border border-[#D8DEE6] bg-gray-400 px-2 py-2 font-semibold text-black"
              >
                Closing Ticket
              </th>
              <th className="border border-[#D8DEE6] bg-gray-400 px-2 py-2 font-semibold text-black">
                Done
              </th>
              <th
                rowSpan={2}
                className="border border-[#D8DEE6] bg-gray-400 px-2 py-2 font-semibold text-black"
              >
                Ach | TA | PST
              </th>
            </tr>
            <tr>
              <th className="border border-[#D8DEE6] bg-gray-400 px-2 py-2 font-medium text-black">
                H-1
              </th>
              <th className="border border-[#D8DEE6] bg-gray-400 px-2 py-2 font-medium text-black">
                H
              </th>
              <th className="border border-[#D8DEE6] bg-gray-400 px-2 py-2 font-medium text-black">
                TA | PST
              </th>
            </tr>
          </thead>
          <tbody>
            {mttrQualityRows.map((row, index) => {
              const isTotalRow = row.area === "Total";
              const rowClass = isTotalRow
                ? "bg-[#d1d5db] font-bold text-black"
                : index % 2 === 0
                  ? "bg-white"
                  : "bg-slate-50";

              return (
                <tr key={index} className={rowClass}>
                  <td className="border border-[#D8DEE6] px-2 py-2 font-medium text-slate-700">
                    {row.no}
                  </td>

                  {isTotalRow ? (
                    <td
                      colSpan={2}
                      className="border border-[#D8DEE6] px-2 py-2 font-bold uppercase text-center text-slate-800"
                    >
                      {row.area}
                    </td>
                  ) : (
                    <>
                      <td className="border border-[#D8DEE6] px-2 py-2 font-semibold text-slate-800">
                        {row.area}
                      </td>
                      <td className="border border-[#D8DEE6] px-2 py-2 text-slate-700">
                        {row.reg}
                      </td>
                    </>
                  )}

                  <td className="border border-[#D8DEE6] px-2 py-2 text-slate-700">
                    {row.openFoRip}
                  </td>
                  <td className="border border-[#D8DEE6] px-2 py-2 text-slate-700">
                    {row.kuningMerah96Jam}
                  </td>
                  <td className="border border-[#D8DEE6] px-2 py-2 text-slate-700">
                    {row.closingTicketH1}
                  </td>
                  <td className="border border-[#D8DEE6] px-2 py-2 text-slate-700">
                    {row.closingTicketH}
                  </td>
                  <td className="border border-[#D8DEE6] px-2 py-2 text-slate-700">
                    {row.doneTaPst}
                  </td>
                  <td className="border border-[#D8DEE6] px-2 py-2">
                    <div className="flex items-center justify-center h-full">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[16px] font-semibold `}
                      >
                        <span
                          className={`h-3 w-3 rounded-full ${row.achLevel === "good" ? "bg-emerald-500" : "bg-rose-500"}`}
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

      <div className="space-y-1 border-t border-[#D8DEE6] bg-white px-4 py-3 text-[12px] text-slate-600">
        <p className="font-medium text-slate-700">Keterangan:</p>
        <p>Kuning: TTR &lt; Threshold</p>
        <p>Merah: TTR &gt; Threshold</p>
        <p>- : Tidak ada Ticket</p>
        <p className="font-medium text-slate-700 mt-2">Sumber Data:</p>
        <p>
          <a
            href="https://qosmo.telkom.co.id/ticket"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-sky-700 underline"
          >
            MTTRq: https://qosmo.telkom.co.id/ticket
          </a>
        </p>
      </div>
    </section>
  );
};

export default MttrQualityTable;
