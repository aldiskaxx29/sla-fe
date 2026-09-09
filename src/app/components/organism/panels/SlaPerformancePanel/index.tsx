import { useState } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import { FaExclamationTriangle } from "react-icons/fa";
import { SelectMenu } from "@/app/components/molecules/SelectMenu";
import { NotchedCard } from "@/app/components/molecules/NotchedCard";
import { useSlaPerformanceQuery } from "@/app/hooks/query/monday/ticketQuality";

export function SlaPerformancePanel() {
  const [week, setWeek] = useState("W4");
  const [rekon, setRekon] = useState("Before Rekon");
  const { data: metrics = [] } = useSlaPerformanceQuery(week, rekon);

  return (
    <NotchedCard title="SLA Performance">
      <header className="flex flex-col gap-2 shrink-0">
        <div className="flex flex-nowrap items-center justify-between gap-x-2 text-[10.5px] font-semibold text-slate-600 bg-white rounded-lg border border-slate-200 p-2 px-2.5 shadow-2xs w-full overflow-hidden select-none">
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500 text-white shrink-0">
              <LuCheck size={8} />
            </span>
            <span>Achievement</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-white shrink-0">
              <FaExclamationTriangle size={8} />
            </span>
            <span>MSA Ach & CNOP Not Ach</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-white shrink-0">
              <LuX size={8} />
            </span>
            <span>Not Achievement</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-2xs mt-1">
          <div className="grid grid-cols-2 gap-2">
            <SelectMenu
              value={week}
              onChange={setWeek}
              options={[
                { label: "Select Week", value: "W4" },
                { label: "Week 3", value: "W3" },
                { label: "Week 2", value: "W2" },
                { label: "Week 1", value: "W1" },
              ]}
              size="sm"
              variant="gray"
              className="w-full [&>div]:w-full [&_button]:w-full text-[10px] font-semibold"
            />
            <SelectMenu
              value={rekon}
              onChange={setRekon}
              options={[
                { label: "Before Rekon", value: "Before Rekon" },
                { label: "After Rekon", value: "After Rekon" },
              ]}
              size="sm"
              variant="gray"
              className="w-full [&>div]:w-full [&_button]:w-full text-[10px] font-semibold"
            />
          </div>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3 flex-1 min-h-0">
        <div className="flex flex-col border border-slate-200 bg-slate-50 rounded-3xl shadow-xs overflow-hidden h-full">
          {metrics
            .filter((m) => m.title === "Packet Loss" || m.title === "Jitter")
            .map((group, groupIdx) => (
              <div
                key={group.title}
                className={`flex flex-col min-h-0 ${
                  group.title === "Packet Loss"
                    ? "flex-[3_3_0%]"
                    : "flex-[2_2_0%]"
                }`}
              >
                <div
                  className={`bg-gray-200 text-center text-[11px] font-extrabold text-black uppercase tracking-widest shrink-0 h-12 flex items-start justify-center pt-2.5 ${
                    groupIdx === 0
                      ? "rounded-t-3xl z-0"
                      : "rounded-t-3xl mt-0 z-0"
                  }`}
                >
                  {group.title}
                </div>

                <div className="flex flex-col flex-1 justify-between min-h-0 relative">
                  {group.subCards.map((card, cardIdx) => {
                    const zIndexClass =
                      cardIdx === 0 ? "z-10" : cardIdx === 1 ? "z-20" : "z-30";
                    return (
                      <div
                        key={card.id}
                        className={`flex-1 flex flex-col justify-start pt-1.5 px-2.5 pb-2 bg-white min-h-0 shadow-[0_-3px_6px_rgba(0,0,0,0.04)] border-t border-slate-100 relative ${zIndexClass} ${
                          cardIdx === 0
                            ? "rounded-t-3xl -mt-4.5"
                            : "rounded-t-2xl -mt-3.5"
                        }`}
                      >
                        <header className="flex items-center justify-center gap-1.5 pb-1 border-b border-slate-100 shrink-0">
                          {card.status === "success" ? (
                            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-green-500 text-[6px] font-bold text-white">
                              <LuCheck size={8} />
                            </span>
                          ) : (
                            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[6px] font-bold text-white">
                              <LuX size={8} />
                            </span>
                          )}
                          <span className="text-[9px] font-extrabold text-navy truncate">
                            {card.name}
                          </span>
                        </header>

                        {card.beforeValue || card.currentValue ? (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-center shrink-0">
                            <div className="flex flex-col items-center">
                              <span className="text-xl font-extrabold text-navy leading-none">
                                {card.beforeValue}
                              </span>
                              <span className="text-[8px] font-bold text-slate-400 mt-0.5">
                                (Before)
                              </span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="flex items-baseline justify-center gap-0.5">
                                <span className="text-xl font-extrabold text-navy leading-none">
                                  {card.currentValue}
                                </span>
                                {card.trend && (
                                  <span
                                    className={`text-[9px] font-bold ${
                                      card.trend.color === "green"
                                        ? "text-emerald-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {card.trend.direction === "up" ? "↑" : "↓"}
                                    {card.trend.value}
                                  </span>
                                )}
                              </div>
                              <span className="text-[8px] font-bold text-slate-400 mt-0.5">
                                (Current)
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {card.nestedData &&
                          card.nestedData.total !== undefined && (
                            <div className="mt-1 flex flex-col text-[8px] font-bold text-slate-500 gap-0.5 border-t border-slate-50 pt-1 shrink-0">
                              <div className="flex items-center justify-between">
                                <span>T: {card.nestedData.total} Site</span>
                                <span className="text-red-500">
                                  Reg Not Clear: {card.nestedData.regNotClear}
                                </span>
                              </div>
                              {card.nestedData.worstReg && (
                                <div className="text-[8px] font-extrabold text-red-500">
                                  Worst Reg: {card.nestedData.worstReg}
                                </div>
                              )}
                            </div>
                          )}

                        {card.worstText && (
                          <div className="mt-1 text-center text-[8px] font-extrabold text-red-500 border-t border-slate-50 pt-1 shrink-0">
                            {card.worstText}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        <div className="flex flex-col border border-slate-200 bg-slate-50 rounded-3xl shadow-xs overflow-hidden h-full">
          {metrics
            .filter((m) => m.title === "Latency" || m.title === "MTTR")
            .map((group, groupIdx) => (
              <div
                key={group.title}
                className={`flex flex-col min-h-0 ${
                  group.title === "MTTR" ? "flex-[4.2_4.2_0%]" : "flex-[2_2_0%]"
                }`}
              >
                <div
                  className={`bg-gray-200 text-center text-[11px] font-extrabold text-black uppercase tracking-widest shrink-0 h-12 flex items-start justify-center pt-2.5 ${
                    groupIdx === 0
                      ? "rounded-t-xl z-0"
                      : "rounded-t-2xl mt-0 z-0"
                  }`}
                >
                  {group.title}
                </div>

                <div className="flex flex-col flex-1 justify-between min-h-0 relative">
                  {group.subCards.map((card, cardIdx) => {
                    const zIndexClass =
                      cardIdx === 0 ? "z-10" : cardIdx === 1 ? "z-20" : "z-30";
                    return (
                      <div
                        key={card.id}
                        className={`flex-1 flex flex-col justify-start pt-1.5 px-2.5 pb-2 bg-white min-h-0 shadow-[0_-3px_6px_rgba(0,0,0,0.04)] border-t border-slate-100 relative ${zIndexClass} ${
                          cardIdx === 0
                            ? "rounded-t-3xl -mt-4.5"
                            : "rounded-t-2xl -mt-3.5"
                        }`}
                      >
                        <header className="flex items-center justify-center gap-1.5 pb-1 border-b border-slate-100 shrink-0">
                          {card.status === "success" ? (
                            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-green-500 text-[6px] font-bold text-white">
                              <LuCheck size={8} />
                            </span>
                          ) : (
                            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[6px] font-bold text-white">
                              <LuX size={8} />
                            </span>
                          )}
                          <span className="text-[9px] font-extrabold text-navy truncate">
                            {card.name}
                          </span>
                        </header>

                        {card.beforeValue || card.currentValue ? (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-center shrink-0">
                            <div className="flex flex-col items-center">
                              <span className="text-xl font-extrabold text-navy leading-none">
                                {card.beforeValue}
                              </span>
                              <span className="text-[8px] font-bold text-slate-400 mt-0.5">
                                (Before)
                              </span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="flex items-baseline justify-center gap-0.5">
                                <span className="text-xl font-extrabold text-navy leading-none">
                                  {card.currentValue}
                                </span>
                                {card.trend && (
                                  <span
                                    className={`text-[9px] font-bold ${
                                      card.trend.color === "green"
                                        ? "text-emerald-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {card.trend.direction === "up" ? "↑" : "↓"}
                                    {card.trend.value}
                                  </span>
                                )}
                              </div>
                              <span className="text-[8px] font-bold text-slate-400 mt-0.5">
                                (Current)
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {card.tableData && (
                          <div className="mt-1.5 shrink-0">
                            <table className="w-full text-left text-[8px] table-fixed">
                              <thead>
                                <tr className="text-slate-400 font-semibold border-b border-slate-100">
                                  <th className="py-1.5 w-10">Area</th>
                                  <th className="py-1.5 text-center w-8">
                                    Target
                                  </th>
                                  <th className="py-1.5 text-right w-8">Ach</th>
                                </tr>
                              </thead>
                              <tbody>
                                {card.tableData.map((row) => (
                                  <tr
                                    key={row.area}
                                    className="text-slate-700 font-extrabold border-b border-slate-50/50 last:border-0"
                                  >
                                    <td className="py-1.5 truncate">
                                      {row.area}
                                    </td>
                                    <td className="py-1.5 text-center">
                                      {row.target}
                                    </td>
                                    <td
                                      className={`py-1.5 text-right ${
                                        row.ach >= row.target
                                          ? "text-emerald-500"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {row.ach}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {card.worstText && (
                          <div className="mt-1 text-center text-[8px] font-extrabold text-red-500 border-t border-slate-50 pt-1 shrink-0">
                            {card.worstText}
                          </div>
                        )}

                        {card.nestedData && card.nestedData.worstReg && (
                          <div className="mt-0.5 text-[8px] font-extrabold text-red-500 text-center shrink-0">
                            Worst Reg: {card.nestedData.worstReg}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </NotchedCard>
  );
}
