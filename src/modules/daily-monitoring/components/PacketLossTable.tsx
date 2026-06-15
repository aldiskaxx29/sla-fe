import type { PacketLossRow } from "../types";

type PacketLossTableProps = {
  rows?: PacketLossRow[];
  section?: string;
};

const PacketLossTable = ({ rows, section }: PacketLossTableProps) => {
  const colWidths = [
    "5%",
    "24%",
    "7%",
    "11%",
    "7%",
    "7%",
    "8%",
    "8%",
    "9%",
    "14%",
  ];
  const tableRows = rows ?? [];

  return (
    <section className="rounded-2xl bg-white">
      <div className="border-b border-[#D8DEE6] px-4 py-3">
        <h2 className="daily-monitoring-section-title font-bold uppercase tracking-wide text-blue-600">
          {section || "A. PL 5% &amp; 1-5%"}
        </h2>
      </div>

      <div>
        <table className="daily-monitoring-table w-full border-collapse table-fixed text-center text-[26px] lg:text-[28px]">
          <colgroup>
            {colWidths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead className="text-black">
            <tr>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                No
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                Region
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                Target
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                Site Degrade
              </th>
              <th
                colSpan={3}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                CLEAR
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                Not Clear
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-3 py-2.5 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                Ach
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-3 py-2.5 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]"
              >
                Remark
              </th>
            </tr>
            <tr>
              <th className="dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[20px]">
                H-1
              </th>
              <th className="dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[20px]">
                H
              </th>
              <th className="dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[20px]">
                Growth
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, index) => {
              if (row.isSpacerRow) {
                return (
                  <tr key={`spacer-${index}`} className="bg-white">
                    <td colSpan={10} className="border-0 px-0 py-3" />
                  </tr>
                );
              }

              const rowClass = row.isTotalRow
                ? "bg-[#d1d5db] font-bold text-black"
                : index % 2 === 0
                  ? "bg-white"
                  : "bg-slate-50";

              return (
                <tr key={`${row.region}-${index}`} className={rowClass}>
                  <td className="border border-[#D8DEE6] px-4 py-3 font-medium text-slate-700">
                    {row.no}
                  </td>
                  <td
                    className={`border border-[#D8DEE6] px-4 py-3 text-slate-800 ${row.isTotalRow ? "text-center uppercase" : "font-semibold text-left"}`}
                  >
                    {row.region}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.target}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.siteDegradeH1}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.siteDegradeH}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.clear}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.growth}
                  </td>
                  <td className="border border-[#D8DEE6] px-3 py-2.5 text-slate-700">
                    {row.notClear}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3">
                    <div className="flex h-full items-center justify-center">
                      <span
                        className={`dm-badge inline-flex min-w-[104px] items-center justify-center rounded-full px-3.5 py-2 font-bold leading-none`}
                      >
                        <span
                          className={`mr-2 block aspect-square h-4 w-4 shrink-0 rounded-full ${row.achLevel === "good" ? "bg-emerald-500" : "bg-rose-500"}`}
                        />
                        {row.ach}
                      </span>
                    </div>
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-left text-slate-700">
                    {row.remark || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="daily-monitoring-notes space-y-2 border-t border-[#D8DEE6] bg-white px-4 py-5 text-4xl leading-[1.5] text-slate-600">
        <p className="font-semibold text-slate-700">
          *Pembaruan Data Weekly Setiap Hari Kamis
        </p>
        <p>
          Sumber Data:{" "}
          <a
            href="https://qosmo.telkom.co.id/Monday"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-sky-700 underline"
          >
            Packet Loss: https://qosmo.telkom.co.id/Monday
          </a>
        </p>
      </div>
    </section>
  );
};

export default PacketLossTable;
