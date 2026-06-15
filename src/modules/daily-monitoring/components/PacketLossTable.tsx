type PacketLossLevel = "good" | "warning" | "danger";

type PacketLossRow = {
  no: string;
  region: string;
  target: string;
  siteDegrade: string;
  clearH1: string;
  clearH: string;
  growth: string;
  notClear: string;
  ach: string;
  remark: string;
  achLevel: PacketLossLevel;
};

const packetLossRows: PacketLossRow[] = [
  {
    no: "1",
    region: "Sumbagut",
    target: "47",
    siteDegrade: "107",
    clearH1: "13",
    clearH: "20",
    growth: "54%",
    notClear: "87",
    ach: "19%",
    remark: "Issue Tsel 37",
    achLevel: "danger",
  },
  {
    no: "2",
    region: "Sumbagteng",
    target: "46",
    siteDegrade: "69",
    clearH1: "8",
    clearH: "8",
    growth: "0%",
    notClear: "61",
    ach: "12%",
    remark: "Issue Tsel 13",
    achLevel: "danger",
  },
  {
    no: "3",
    region: "Sumbagsel",
    target: "64",
    siteDegrade: "149",
    clearH1: "27",
    clearH: "38",
    growth: "41%",
    notClear: "111",
    ach: "26%",
    remark: "Issue Tsel 27",
    achLevel: "danger",
  },
  {
    no: "4",
    region: "Jabotabek Inner",
    target: "2",
    siteDegrade: "3",
    clearH1: "0",
    clearH: "1",
    growth: "33%",
    notClear: "2",
    ach: "33%",
    remark: "",
    achLevel: "danger",
  },
  {
    no: "5",
    region: "Jabotabek Outer",
    target: "1",
    siteDegrade: "1",
    clearH1: "0",
    clearH: "0",
    growth: "0%",
    notClear: "1",
    ach: "0%",
    remark: "",
    achLevel: "danger",
  },
  {
    no: "6",
    region: "Jawa Barat",
    target: "1",
    siteDegrade: "4",
    clearH1: "2",
    clearH: "4",
    growth: "100%",
    notClear: "0",
    ach: "100%",
    remark: "",
    achLevel: "good",
  },
  {
    no: "7",
    region: "Jawa Tengah",
    target: "1",
    siteDegrade: "2",
    clearH1: "2",
    clearH: "2",
    growth: "0%",
    notClear: "0",
    ach: "100%",
    remark: "",
    achLevel: "good",
  },
  {
    no: "8",
    region: "Jawa Timur",
    target: "1",
    siteDegrade: "7",
    clearH1: "1",
    clearH: "2",
    growth: "100%",
    notClear: "5",
    ach: "29%",
    remark: "",
    achLevel: "danger",
  },
  {
    no: "9",
    region: "Balinusra",
    target: "31",
    siteDegrade: "80",
    clearH1: "9",
    clearH: "11",
    growth: "22%",
    notClear: "69",
    ach: "14%",
    remark: "Issue Tsel 14",
    achLevel: "danger",
  },
  {
    no: "10",
    region: "Kalimantan",
    target: "63",
    siteDegrade: "163",
    clearH1: "24",
    clearH: "40",
    growth: "67%",
    notClear: "123",
    ach: "25%",
    remark: "Issue Tsel 29",
    achLevel: "danger",
  },
  {
    no: "11",
    region: "Sulawesi",
    target: "37",
    siteDegrade: "79",
    clearH1: "3",
    clearH: "8",
    growth: "167%",
    notClear: "71",
    ach: "10%",
    remark: "Issue Tsel 13",
    achLevel: "danger",
  },
  {
    no: "12",
    region: "Puma",
    target: "31",
    siteDegrade: "47",
    clearH1: "4",
    clearH: "6",
    growth: "50%",
    notClear: "41",
    ach: "13%",
    remark: "Issue Tsel 10",
    achLevel: "danger",
  },
  // Divider / Blank Data Spacer (Opsional untuk jeda visual)
  {
    no: "",
    region: "",
    target: "",
    siteDegrade: "",
    clearH1: "",
    clearH: "",
    growth: "",
    notClear: "",
    ach: "",
    remark: "",
    achLevel: "warning",
  },
  // Area Data
  {
    no: "1",
    region: "Area 1",
    target: "157",
    siteDegrade: "325",
    clearH1: "48",
    clearH: "66",
    growth: "38%",
    notClear: "259",
    ach: "20%",
    remark: "Issue Tsel 77",
    achLevel: "danger",
  },
  {
    no: "2",
    region: "Area 2",
    target: "4",
    siteDegrade: "8",
    clearH1: "2",
    clearH: "5",
    growth: "150%",
    notClear: "3",
    ach: "63%",
    remark: "",
    achLevel: "danger",
  },
  {
    no: "3",
    region: "Area 3",
    target: "33",
    siteDegrade: "89",
    clearH1: "12",
    clearH: "15",
    growth: "25%",
    notClear: "74",
    ach: "17%",
    remark: "Issue Tsel 14",
    achLevel: "danger",
  },
  {
    no: "4",
    region: "Area 4",
    target: "131",
    siteDegrade: "289",
    clearH1: "31",
    clearH: "54",
    growth: "74%",
    notClear: "235",
    ach: "19%",
    remark: "Issue Tsel 52",
    achLevel: "danger",
  },
  // Total Row
  {
    no: "",
    region: "TOTAL",
    target: "325",
    siteDegrade: "711",
    clearH1: "93",
    clearH: "140",
    growth: "51%",
    notClear: "571",
    ach: "20%",
    remark: "",
    achLevel: "danger",
  },
];

// const achToneClass: Record<PacketLossLevel, string> = {
//   good: "bg-emerald-600/20 border-[1px] border-emerald-600/30 text-emerald-600",
//   warning: "transparent", // Digunakan untuk spacer baris kosong
//   danger: "bg-rose-600/20 border-[1px] border-rose-600/30 text-rose-600",
// };

const PacketLossTable = () => {
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

  return (
    <section className="rounded-2xl  bg-white">
      <div className="border-b border-[#D8DEE6] px-4 py-3">
        <h2 className="daily-monitoring-section-title font-bold uppercase tracking-wide text-blue-600">
          A. PL 5% &amp; 1-5%
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
            {packetLossRows.map((row, index) => {
              // Kondisi khusus untuk merender baris TOTAL atau spacer
              const isTotalRow = row.region === "TOTAL";
              const isSpacerRow = row.region === "";

              let rowClass = index % 2 === 0 ? "bg-white" : "bg-slate-50";
              if (isTotalRow) rowClass = "bg-[#d1d5db] font-bold text-black"; // Abu-abu gelap untuk TOTAL

              return (
                <tr key={index} className={rowClass}>
                  <td className="border border-[#D8DEE6] px-4 py-3 font-medium text-slate-700">
                    {row.no}
                  </td>
                  <td
                    className={`border border-[#D8DEE6] px-4 py-3 text-slate-800 ${isTotalRow ? "text-center uppercase" : "font-semibold text-left"}`}
                  >
                    {row.region}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.target}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.siteDegrade}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.clearH1}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.clearH}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                    {row.growth}
                  </td>
                  <td className="border border-[#D8DEE6] px-3 py-2.5 text-slate-700">
                    {row.notClear}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 flex items-center justify-center h-full">
                    {!isSpacerRow && (
                    <span
                        className={`dm-badge inline-flex min-w-[104px] items-center justify-center rounded-full px-3.5 py-2 font-bold leading-none`}
                      >
                        <span
                          className={`mr-2 block aspect-square h-4 w-4 shrink-0 rounded-full ${row.achLevel === "good" ? "bg-emerald-500" : "bg-rose-500"}`}
                        ></span>
                        {row.ach}
                      </span>
                    )}
                  </td>
                  <td className="border border-[#D8DEE6] px-4 py-3 text-left text-slate-700">
                    {row.remark}
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
