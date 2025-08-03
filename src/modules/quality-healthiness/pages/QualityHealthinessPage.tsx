import logoAccessNetwork from "@/assets/access-network.png";
import logoCoreNetwork from "@/assets/core-network.png";
import logoInfranexiaWhite from "@/assets/infranexia-white.png";
import logoMetric from "@/assets/metric.png";
import logoTelkomWhite from "@/assets/telkom-white.png";
import QualityHealthinessMap from "@/modules/dashboard/componets/QualityHealthinessMap";
import { CheckOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

/* ------------------------------ Default Type ------------------------------ */
export type NetworkSegment = {
  name: string;
  percentage: number;
  detail: string;
};

export type RegionKPI = {
  region: string;
  operator: string;
  segments: NetworkSegment[];
};

type TableRow = {
  label: React.ReactNode;
  cnop: { target: string; real: string; ach: string };
  msa: { target: string; real: string; ach: string };
};

type MetricProps = {
  title: string;
  rows: TableRow[];
};

type CoreRow = {
  label: string;
  cnop: { target: string; real: string; ach: string };
  msa: { target: string; real: string; ach: string };
};
/* ---------------------------- End Default Type ---------------------------- */

/* -------------------------------- Component ------------------------------- */
function AccessNetworkTable({ rows }: MetricProps) {
  const headers = ["Target", "Real", "Ach"];
  const totalIndex = rows.length - 1;
  const beforeTotal = rows.slice(0, totalIndex);
  const totalRow = rows[totalIndex];

  // total kolom = 1 (label) + 3 + 3 = 7 kolom
  const colWidths = ["20%", "10%", "10%", "10%", "10%", "10%", "10%"];

  const renderColGroup = () => (
    <colgroup>
      {colWidths.map((w, idx) => (
        <col key={idx} style={{ width: w }} />
      ))}
    </colgroup>
  );

  return (
    <div className="flex flex-col flex-grow">
      {/* Table 1: header + before total */}
      <table className="w-full h-full text-center border-separate border-spacing-0 text-[8px] table-fixed">
        {renderColGroup()}
        <thead>
          <tr>
            <th
              rowSpan={2}
              className="bg-gradient-to-b from-[#1E78C7] to-[#1E90D1] text-white font-bold px-1 py-0.5 rounded-tl-lg border text-[11px]"
            >
              Label
            </th>
            <th
              colSpan={3}
              className="bg-gradient-to-b from-[#1E78C7] to-[#1E90D1] text-white font-bold px-1 py-0.5 border text-[11px]"
            >
              SLA CNOP 3.0
            </th>
            <th
              colSpan={3}
              className="bg-gradient-to-b from-[#1E78C7] to-[#1E90D1] text-white font-bold px-1 py-0.5 rounded-tr-lg border text-[11px]"
            >
              SLA MSA 2025
            </th>
          </tr>
          <tr>
            {[...headers, ...headers].map((h, idx) => (
              <th
                key={idx}
                className="bg-gradient-to-b from-[#1E78C7] to-[#1E90D1] text-white font-bold border px-1 py-0.5 text-[11px]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {beforeTotal.map((row, i) => (
            <tr key={i} className="bg-gray-100">
              <td className="border-dashed border-b border-r border-gray-400 font-bold py-1 text-[11px]">
                {row.label}
              </td>
              {Object.values(row.cnop).map((val, j) => (
                <td
                  key={`cnop-${j}`}
                  className="border-dashed border-b border-r border-gray-400 font-bold py-1 text-[11px]"
                >
                  {val}
                </td>
              ))}
              {Object.values(row.msa).map((val, j) => (
                <td
                  key={`msa-${j}`}
                  className="border-dashed border-b border-r border-gray-400 font-bold py-1 text-[11px]"
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table 2: total site fix bawah, pakai colgroup sama */}
      <table className="w-full text-center border-separate border-spacing-0 text-[8px] table-fixed">
        {renderColGroup()}
        <tbody>
          <tr className="bg-white">
            <td className="border-dashed border-r border-gray-400 font-bold py-1 text-[11px]">
              {totalRow.label}
            </td>
            {Object.values(totalRow.cnop).map((val, j) => (
              <td
                key={`total-cnop-${j}`}
                className="border-dashed border-r border-gray-400 font-bold text-[11px]"
              >
                {val}
              </td>
            ))}
            {Object.values(totalRow.msa).map((val, j) => (
              <td
                key={`total-msa-${j}`}
                className="border-dashed border-r border-gray-400 font-bold text-[11px]"
              >
                {val}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const coreRows: CoreRow[] = [
  {
    label: "PL",
    cnop: { target: "99,50%", real: "100%", ach: "100%" },
    msa: { target: "99,50%", real: "100%", ach: "100%" },
  },
  {
    label: "LAT",
    cnop: { target: "99,50%", real: "100%", ach: "100%" },
    msa: { target: "99,50%", real: "100%", ach: "100%" },
  },
  {
    label: "JIT",
    cnop: { target: "85,00%", real: "100%", ach: "100%" },
    msa: { target: "85,00%", real: "100%", ach: "100%" },
  },
  {
    label: "",
    cnop: { target: "100", real: "100%", ach: "100%" },
    msa: { target: "100", real: "100%", ach: "100%" },
  },
];

function CoreNetworkTable() {
  const headers = ["Target", "Real", "Ach"];
  const colWidths = ["15%", "14%", "14%", "14%", "14%", "14%", "14%"];

  const renderColGroup = () => (
    <colgroup>
      {colWidths.map((w, idx) => (
        <col key={idx} style={{ width: w }} />
      ))}
    </colgroup>
  );

  return (
    <div className="flex flex-col flex-grow">
      <table className="w-full text-center border-separate border-spacing-0 text-[8px] table-fixed">
        {renderColGroup()}
        <thead>
          <tr>
            <th rowSpan={2} />
            <th
              colSpan={3}
              className="bg-gradient-to-b from-[#1E78C7] to-[#1E90D1] text-white font-bold py-1 rounded-tl-lg border text-[11px]"
            >
              SLA CNOP 3.0
            </th>
            <th
              colSpan={3}
              className="bg-gradient-to-b from-[#1E78C7] to-[#1E90D1] text-white font-bold py-1 rounded-tr-lg border text-[11px]"
            >
              SLA MSA 2025
            </th>
          </tr>
          <tr>
            {[...headers, ...headers].map((h, idx) => (
              <th
                key={idx}
                className="bg-gradient-to-b from-[#1E78C7] to-[#1E90D1] text-white font-bold border py-1 text-[11px]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {coreRows.map((row, i) => (
            <tr key={i}>
              {row.label !== "" ? (
                <td className="py-1">
                  <div className="inline-block px-2 py-0.5 rounded-full bg-[#6c8fa5] text-white text-[9px] font-bold shadow-sm text-[10px]">
                    {row.label}
                  </div>
                </td>
              ) : (
                <td />
              )}

              {Object.values(row.cnop).map((val, j) => (
                <td
                  key={`cnop-${j}`}
                  className={`border-dashed border-b border-r border-gray-400 font-bold py-1 text-[10px] ${
                    i % 2 !== 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  {val}
                </td>
              ))}

              {Object.values(row.msa).map((val, j) => (
                <td
                  key={`msa-${j}`}
                  className={`border-dashed border-b border-r border-gray-400 font-bold py-1 text-[10px] ${
                    i % 2 !== 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusInfo() {
  return (
    <div className="flex items-center space-x-2">
      <div>
        {["Nation Wide", "Region"].map((text) => (
          <div key={text} className="flex items-center space-x-1">
            <span className="font-extrabold text-black text-[8px] leading-none">
              {text}
            </span>
            <span className="text-green-600 font-semibold text-[8px] leading-none">
              Achieved
            </span>
            <div className="flex items-center justify-center w-4 h-4 bg-green-500 rounded-[3px] shadow-sm">
              <svg
                className="w-2.5 h-2.5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
      <svg width="20" height="40" viewBox="0 0 80 180" className="rotate-180">
        <path
          d="M 50 10 Q 30 10 30 30 L 30 60 Q 30 80 10 80 Q 30 80 30 100 L 30 130 Q 30 150 50 150"
          className="stroke-[#2F8CC4] stroke-[2] fill-none"
        />
      </svg>
      <div className="flex items-center justify-center border border-gray-400 rounded px-4 py-1 shadow-sm">
        <span className="text-[10px] font-extrabold text-green-600">
          EXCELLENT
        </span>
      </div>
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 shadow">
        <svg
          className="w-3 h-3 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>
  );
}
/* ------------------------------ End Component ----------------------------- */

/* ------------------------------- Dummy Data ------------------------------- */
const dummyData: RegionKPI[] = [
  {
    region: "OUTER JABOTABEK",
    operator: "xl",
    segments: [
      { name: "Access Network", percentage: 99.95, detail: "±9,11 K Site" },
      { name: "Core Network", percentage: 100, detail: "6 EBR 2 PE Transit" },
      { name: "CDN", percentage: 100, detail: "2 CDN (AWS, GCP, OCA)" },
    ],
  },
  {
    region: "INNER JABOTABEK",
    operator: "xl",
    segments: [
      { name: "Access Network", percentage: 99.92, detail: "±5,02 K Site" },
      { name: "Core Network", percentage: 100, detail: "5 EBR 2 PE Transit" },
    ],
  },
  {
    region: "SUMBAGUT",
    operator: "telkomsel",
    segments: [
      { name: "Access Network", percentage: 98.9, detail: "±4,97 K Site" },
      { name: "Core Network", percentage: 100, detail: "6 EBR 4 PE Transit" },
    ],
  },
  {
    region: "SUMBAGTENG",
    operator: "telkomsel",
    segments: [
      { name: "Access Network", percentage: 97.86, detail: "±5,08 K Site" },
      { name: "Core Network", percentage: 100, detail: "8 EBR 4 PE Transit" },
      { name: "CDN", percentage: 100, detail: "2 CDN (OCA)" },
    ],
  },
  {
    region: "SUMBAGSEL",
    operator: "telkomsel",
    segments: [
      { name: "Access Network", percentage: 98.89, detail: "±5,66 K Site" },
      { name: "Core Network", percentage: 100, detail: "7 EBR 4 PE Transit" },
    ],
  },
  {
    region: "JABAR",
    operator: "telkomsel",
    segments: [
      { name: "Access Network", percentage: 99.92, detail: "±5,02 K Site" },
      { name: "Core Network", percentage: 100, detail: "5 EBR 2 PE Transit" },
    ],
  },
  {
    region: "JATENG-DIY",
    operator: "telkomsel",
    segments: [
      { name: "Access Network", percentage: 99.84, detail: "±5,08 K Site" },
      { name: "Core Network", percentage: 100, detail: "6 EBR 2 PE Transit" },
    ],
  },
  {
    region: "JATIM",
    operator: "telkomsel",
    segments: [
      { name: "Access Network", percentage: 99.82, detail: "±6,19 K Site" },
      { name: "Core Network", percentage: 100, detail: "6 EBR 2 PE Transit" },
      { name: "CDN", percentage: 100, detail: "2 CDN (OCA)" },
    ],
  },
  {
    region: "BALI NUSRA",
    operator: "telkomsel",
    segments: [
      { name: "Access Network", percentage: 99.51, detail: "±4,10 K Site" },
      { name: "Core Network", percentage: 100, detail: "8 EBR 4 PE Transit" },
    ],
  },
  {
    region: "KALIMANTAN",
    operator: "telkomsel",
    segments: [
      { name: "Access Network", percentage: 99.27, detail: "±5,88 K Site" },
      { name: "Core Network", percentage: 100, detail: "10 EBR 8 PE Transit" },
      { name: "CDN", percentage: 100, detail: "2 CDN (OCA, Akamai)" },
    ],
  },
  {
    region: "SULAWESI",
    operator: "telkomsel",
    segments: [
      { name: "Access Network", percentage: 98.68, detail: "±6,25 K Site" },
      { name: "Core Network", percentage: 100, detail: "11 EBR 6 PE Transit" },
      { name: "CDN", percentage: 100, detail: "4 CDN (OCA)" },
    ],
  },
  {
    region: "MALUKU DAN PAPUA",
    operator: "telkomsel",
    segments: [
      { name: "Access Network", percentage: 99.44, detail: "±5,18 K Site" },
      { name: "Core Network", percentage: 100, detail: "5 EBR 3 PE Transit" },
    ],
  },
];
/* ----------------------------- End Dummy Data ----------------------------- */

const QualityHealthinessMenu = () => {
  // const [filterLevel, setFilterLevel] = useState<"region">("region");
  // const [filterLocation, setFilterLocation] = useState<string>("");
  const [geojsonRegion, setGeojsonRegion] =
    useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/geojson/region.json")
      .then((res) => res.json())
      .then((geojson) => {
        setGeojsonRegion(geojson);
      })
      .catch((err) => console.error("Failed to load region.json:", err));
  }, []);

  const packetLossRows: TableRow[] = [
    {
      label: "1-5%",
      cnop: { target: "446", real: "489", ach: "93%" },
      msa: { target: "518", real: "480", ach: "93%" },
    },
    {
      label: "> 5%",
      cnop: { target: "166", real: "130", ach: "100%" },
      msa: { target: "192", real: "130", ach: "100%" },
    },
    {
      label: "Total Site",
      cnop: { target: "612", real: "610", ach: "96,5%" },
      msa: { target: "710", real: "610", ach: "96,5%" },
    },
  ];

  const jitterRows: TableRow[] = [
    {
      label: (
        <>
          5ms <br /> (&lt; 100Km)
        </>
      ),
      cnop: { target: "446", real: "489", ach: "93%" },
      msa: { target: "518", real: "480", ach: "93%" },
    },
    {
      label: (
        <>
          10ms <br /> (100-200Km)
        </>
      ),
      cnop: { target: "166", real: "130", ach: "100%" },
      msa: { target: "192", real: "130", ach: "100%" },
    },
    {
      label: (
        <>
          20ms <br /> (200-1000Km)
        </>
      ),
      cnop: { target: "166", real: "130", ach: "100%" },
      msa: { target: "192", real: "130", ach: "100%" },
    },
    {
      label: "Total Site",
      cnop: { target: "612", real: "610", ach: "96,5%" },
      msa: { target: "710", real: "610", ach: "96,5%" },
    },
  ];

  const latencyRows: TableRow[] = [
    {
      label: "0-2 ms",
      cnop: { target: "59.349", real: "58.934", ach: "95,20%" },
      msa: { target: "59.349", real: "58.934", ach: "95,20%" },
    },
    {
      label: "Total Site",
      cnop: { target: "", real: "", ach: "95,20%" },
      msa: { target: "", real: "", ach: "95,20%" },
    },
  ];

  const accessNetworkMetrics = [
    { title: "PACKET LOSS", rows: packetLossRows },
    { title: "JITTER", rows: jitterRows },
    { title: "LATENCY", rows: latencyRows },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#A2CFD5]">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center">
          {/* Ikon drop kiri */}
          <div className="relative z-10">
            {/* Outline gradient */}
            <div className="absolute -inset-1 rounded-[0_50%_50%_50%] bg-gradient-to-br from-[#1e90ff] via-[#00c3cc] to-[#a2f0f2] shadow-lg" />

            {/* Shape utama */}
            <div className="relative w-16 h-16 rounded-[0_50%_50%_50%] bg-gray-100 shadow-md flex justify-center items-center">
              <span className="text-2xl font-bold text-slate-800">I</span>
            </div>
          </div>

          {/* Banner teks */}
          <div className="relative -ml-6 pl-13 pr-10 py-2 bg-gradient-to-r from-[rgba(0,210,198,0.6)] via-[rgba(36,194,216,0.6)] to-[rgba(46,168,235,0.6)] rounded-br-[40px] shadow-lg flex flex-col backdrop-blur-sm">
            <h1 className="text-xl font-extrabold text-[#41536B]">
              Network Quality Healthiness | Nation Wide
            </h1>

            <p className="text-sm text-[#41536B]/80 mt-0.5">
              Source: TWAMP & BRIX
            </p>
          </div>
        </div>

        {/* <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm shadow-sm p-3 rounded">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Level
            </label>
            <Select
              className="w-full"
              placeholder="Select Level"
              onChange={(val) => setFilterLevel(val as "region")}
              value={filterLevel}
              options={[{ value: "region", label: "Region" }]}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Location
            </label>
            <Select
              className="w-full"
              style={{ width: 220 }}
              placeholder="Select Location"
              onChange={(val) => setFilterLocation(val)}
              value={filterLocation}
              options={geojsonRegion?.features.map((r) => ({
                value: r.properties?.region as string,
                label: r.properties?.region as string,
              }))}
              allowClear
            />
          </div>
        </div> */}

        <div>
          <div className="px-5 py-1 bg-gradient-to-r from-[#06344c] via-[#2277a8] to-[#66d1f2] rounded-tl-[40px] rounded-br-[40px] shadow-lg flex backdrop-blur-sm items-center space-x-4">
            <img
              className="w-25 h-10"
              src={logoInfranexiaWhite}
              alt="logo-infranexia-white"
            />
            <img
              className="w-20"
              src={logoTelkomWhite}
              alt="logo-telkom-white"
            />
          </div>
        </div>
      </header>

      {/* MAIN SECTION */}
      <div className="p-4">
        <div className="flex space-x-4 bg-white p-2 rounded-lg">
          {/* LEFT SIDE MAP */}
          <div className="w-[100%] min-h-[500px] flex items-center justify-center rounded relative">
            <div className="absolute bg-white rounded-xl p-1 z-10 -left-2 -top-6 shadow-md">
              <div className="flex p-1 bg-gradient-to-r from-[#d9d9d9] to-white rounded-lg items-center space-x-1">
                <img className="w-10" src={logoMetric} alt="logo-metric" />
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-[#009d9a] to-[#00b7ff] text-transparent bg-clip-text">
                  Nation Wide
                </h3>
              </div>
            </div>

            <QualityHealthinessMap
              data={dummyData}
              filter={{ level: "region", location: "" }}
              geojson={{
                region: geojsonRegion,
              }}
            />
            
          </div>

          {/* RIGHT SIDE SUMMARY */}
          <div className="z-10 absolute mt-[270px] pl-2">
          <div className="flex-1 text-wrap flex flex-col justify-center space-y-6">
            {/* A. Category */}
            <div className="">
              <h2 className="font-bold text-sm">A. Category:</h2>
              <ol className="list-decimal list-inside space-y-1 font-medium text-[9px]">
                <li>
                  <span className="font-bold">EXCELLENT:</span> Healthiness =
                  95-100% Nation Wide ✅ | Region ✅
                </li>
                <li>
                  <span className="font-bold">HEALTHY:</span> Healthiness =
                  90-95% Nation Wide ✅ | Region ✅/❌
                </li>
                <li>
                  <span className="font-bold">MAINTAIN:</span> Healthiness =
                  80-90% Nation Wide ✅/❌ | Region ✅/❌
                </li>
                <li>
                  <span className="font-bold">NOT HEALTHY:</span> Healthiness
                  &lt; 80% Nation Wide ❌ | Region ❌
                </li>
              </ol>
            </div>

            {/* B. Quality Healthiness */}
            <div>
              <h2 className="font-bold text-sm">B. Quality Healthiness:</h2>
              <p className="text-[9px]">
                Pencapaian <span className="font-semibold">Packet loss</span>,{" "}
                <span className="font-semibold">latency</span> dan{" "}
                <span className="font-semibold">Jitter</span> pada segment{" "}
                <span className="font-bold">Access Network</span> dan{" "}
                <span className="font-bold">Core Network</span>
              </p>
            </div>

            {/* C. Per Segment */}
            <div>
              <h2 className="font-bold text-sm">C. Per Segment Healthiness:</h2>
              <ol className="list-decimal list-inside space-y-1 text-[9px]">
                <li>
                  <span className="font-bold">Access Network:</span> AVG of{" "}
                  <span className="font-bold">SLA CNOP &amp; MSA</span> (Ach PL
                  &lt; 0.1% + Ach Latency based on distance to TWAMP + Ach
                  Jitter &lt; 2 ms)
                </li>
                <li>
                  <span className="font-bold">Core Network:</span> Avg of{" "}
                  <span className="font-bold">SLA CNOP &amp; MSA</span> (Ach RPJ
                  Agg. Metro-E + Ach RPJ EBR to IGW based on baseline)
                </li>
              </ol>
            </div>
          </div> 
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="relative px-4 py-2">
        {/* Card utama */}
        <div className="relative w-full rounded-3xl p-1 shadow-md bg-white/10 backdrop-blur-md border border-white/30">
          {/* Bar dengan gradient */}
          <div className="flex items-center rounded-2xl bg-gradient-to-r from-[#E6F5D9] via-[#009193] to-[#3BC326] p-1 pr-7 relative mr-20">
            {/* Teks di kanan */}
            <h3 className="ml-8 text-right text-base font-bold text-[#E6F5D9] w-full">
              98,20% EXCELLENT
            </h3>

            {/* Icon centang di kanan */}
            <div className="absolute -right-11">
              <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E6F5D9] shadow-md">
                {/* Lingkaran hijau glossy */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3BC326] to-[#1FA41D] flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    <CheckOutlined />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="p-4 mt-4">
        <div className="flex space-x-4">
          {/* LEFT CARD */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg bg-white/20 relative">
            {/* Centered Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white rounded-xl p-1 shadow-md">
              <div className="flex items-center justify-center px-3 py-1 bg-gradient-to-r from-[#d9d9d9] to-white rounded-lg space-x-2 min-w-max">
                <img
                  className="w-6 flex-shrink-0"
                  src={logoAccessNetwork}
                  alt="logo-access-network"
                />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-[#009d9a] to-[#00b7ff] text-transparent bg-clip-text whitespace-nowrap">
                  Access Network
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(120px,150px)_1px_repeat(3,1fr)] gap-2 w-full mt-8">
              {/* Excellent */}
              <div className="flex flex-col items-center justify-center">
                {/* Circular Progress - lebih kecil */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <defs>
                      <linearGradient
                        id="progressGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#00B050" />
                        <stop offset="100%" stopColor="#009193" />
                      </linearGradient>
                    </defs>

                    {/* Background Circle */}
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="#d9d9d9"
                      strokeWidth="5"
                      fill="transparent"
                    />

                    {/* Progress Circle */}
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="url(#progressGradient)"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.964)}`}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Persentase lebih kecil */}
                  <div className="absolute text-[10px] font-bold text-black text-[15px]">
                    96,40%
                  </div>
                </div>

                {/* Status + Check Badge lebih kecil */}
                <div className="flex items-center space-x-1 mt-1">
                  <div
                    className="text-[10px] font-bold text-transparent bg-clip-text"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #00B050 24%, #009193 100%)",
                    }}
                  >
                    EXCELLENT
                  </div>

                  {/* Check Badge lebih kecil */}
                  <div className="bg-green-500 rounded-full w-4 h-4 flex items-center justify-center shadow">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Jumlah NE lebih kecil */}
                <div className="mt-1 text-[10px] text-black">
                  <span className="font-medium">Jumlah NE:</span>{" "}
                  <span className="font-bold">59.349</span> Site
                </div>
              </div>

              <div className="bg-[#A6A6A6]" />

              {accessNetworkMetrics.map((metric) => (
                <div
                  key={metric.title}
                  className="flex flex-col items-center space-y-3"
                >
                  {/* Title */}
                  <div className="px-4 py-0.5 rounded-full bg-gradient-to-r from-[#6da6b8] to-[#4d7a8c] shadow-sm border border-white/60 flex">
                    <span className="text-[9px] text-white font-bold tracking-wide">
                      {metric.title}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="relative w-40 h-[1.5px] bg-gradient-to-r from-transparent via-gray-400 to-transparent">
                    <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rounded-full bg-white border border-gray-400 shadow-sm"></div>
                  </div>

                  {/* Table */}
                  <div className="flex flex-col flex-grow h-full w-full">
                    <AccessNetworkTable
                      title={metric.title}
                      rows={metric.rows}
                    />
                  </div>

                  {/* Info */}
                  <StatusInfo />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="basis-[450px] flex flex-col items-center justify-center p-3 rounded-lg bg-white/20 relative">
            {/* Centered Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white rounded-xl p-1 shadow-md">
              <div className="flex items-center justify-center px-3 py-1 bg-gradient-to-r from-[#d9d9d9] to-white rounded-lg space-x-2 min-w-max">
                <img
                  className="w-6 flex-shrink-0"
                  src={logoCoreNetwork}
                  alt="logo-core-network"
                />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-[#009d9a] to-[#00b7ff] text-transparent bg-clip-text whitespace-nowrap">
                  Core Network
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(120px,150px)_1px_repeat(3,1fr)] gap-2 w-full mt-8">
              {/* Excellent */}
              <div className="flex flex-col items-center justify-center">
                {/* Circular Progress - lebih kecil */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <defs>
                      <linearGradient
                        id="progressGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#00B050" />
                        <stop offset="100%" stopColor="#009193" />
                      </linearGradient>
                    </defs>

                    {/* Background Circle */}
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="#d9d9d9"
                      strokeWidth="5"
                      fill="transparent"
                    />

                    {/* Progress Circle */}
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="url(#progressGradient)"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.964)}`}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Persentase lebih kecil */}
                  <div className="absolute text-[10px] font-bold text-black text-[15px]">
                    100%
                  </div>
                </div>

                {/* Status + Check Badge lebih kecil */}
                <div className="flex items-center space-x-1 mt-1">
                  <div
                    className="text-[10px] font-bold text-transparent bg-clip-text"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #00B050 24%, #009193 100%)",
                    }}
                  >
                    EXCELLENT
                  </div>

                  {/* Check Badge lebih kecil */}
                  <div className="bg-green-500 rounded-full w-4 h-4 flex items-center justify-center shadow">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Jumlah NE lebih kecil */}
                <div className="mt-1 text-[10px] text-black flex flex-col">
                  <span className="font-medium">Jumlah NE:</span>
                  <span className="font-bold">80 EBR</span>
                  <span className="font-bold">42 PE-TRANSIT</span>
                </div>
              </div>

              <div className="bg-[#A6A6A6]" />

              <div className="flex flex-col items-center space-y-3">
                {/* Table */}
                <div className="flex flex-col flex-grow h-full w-full">
                  <CoreNetworkTable />
                </div>

                {/* Info */}
                <StatusInfo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityHealthinessMenu;
