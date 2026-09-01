import { emptySplitApi } from "@/app/redux/app.rtx";

const buildPath = (base, level) => {
  if (!level) return base;
  const cleanLevel = level.replace(/^\//, ''); // Hapus slash di depan
  return `${base}/${cleanLevel}`;
};

const mapParameterToKey = (param?: string): string => {
  if (!param) return "";
  const p = param.toUpperCase().trim();
  if (p.includes("PACKETLOSS >5%")) return "packetloss_5";
  if (p.includes("PACKETLOSS 1-5%")) return "packetloss_15";
  if (p.includes("PACKETLOSS CORE TO INTERNET")) return "packetloss_internet";
  if (p.includes("PACKETLOSS")) return "packetloss";
  if (p.includes("JITTER CORE TO INTERNET")) return "jitter_internet";
  if (p.includes("JITTER")) return "jitter";
  if (p.includes("LATENCY CORE TO INTERNET")) return "latency_internet";
  if (p.includes("LATENCY")) return "latency";
  if (p.includes("MTTRQ") && p.includes("MAJOR")) return "mttrq_major";
  if (p.includes("MTTRQ") && p.includes("MINOR")) return "mttrq_minor";
  if (p.includes("MTTRQ") && p.includes("CRITICAL")) return "mttrq_critical";

  const lower = param.toLowerCase();
  if (lower.includes("packetloss_5")) return "packetloss_5";
  if (lower.includes("packetloss_15")) return "packetloss_15";
  if (lower.includes("jitter")) return "jitter";
  if (lower.includes("latency")) return "latency";
  if (lower.includes("mttrq_major")) return "mttrq_major";
  if (lower.includes("mttrq_minor")) return "mttrq_minor";
  if (lower.includes("mttrq_critical")) return "mttrq_critical";
  return lower.replace(/\s+/g, "_");
};

const normalizeWilayah = (val?: string): string => {
  if (!val) return "NON JAWA";
  const upper = val.toUpperCase().trim();
  if (upper.includes("NON") && (upper.includes("JAWA") || upper.includes("JVM"))) {
    return "NON JAWA";
  }
  if (upper.includes("JAWA") || upper.includes("JVM")) {
    return "JAWA";
  }
  return upper;
};

const mapTregToArea = (treg?: string): string => {
  if (!treg) return "ALL";
  const t = treg.toLowerCase().trim();
  if (t === "treg1") return "AREA 1";
  if (t === "treg2") return "AREA 2";
  if (t === "treg3") return "AREA 3";
  if (t === "treg4") return "AREA 4";
  if (t === "all") return "ALL";
  return treg.toUpperCase();
};

const monthLabelToNum = (label?: string): number => {
  if (!label) return 0;
  const l = label.toLowerCase();
  if (l.startsWith("jan")) return 1;
  if (l.startsWith("feb")) return 2;
  if (l.startsWith("mar")) return 3;
  if (l.startsWith("apr")) return 4;
  if (l.startsWith("mei") || l.startsWith("may")) return 5;
  if (l.startsWith("jun")) return 6;
  if (l.startsWith("jul")) return 7;
  if (l.startsWith("agu") || l.startsWith("aug")) return 8;
  if (l.startsWith("sep")) return 9;
  if (l.startsWith("okt") || l.startsWith("oct")) return 10;
  if (l.startsWith("nov")) return 11;
  if (l.startsWith("des") || l.startsWith("dec")) return 12;
  return 0;
};

const flattenData = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    const combined: any[] = [];
    if (Array.isArray(data.jawa)) {
      combined.push(...data.jawa);
    }
    if (Array.isArray(data.non_jawa)) {
      combined.push(...data.non_jawa);
    }
    if (Array.isArray(data["non-jawa"])) {
      combined.push(...data["non-jawa"]);
    }
    if (combined.length === 0) {
      Object.values(data).forEach((val) => {
        if (Array.isArray(val)) {
          combined.push(...val);
        }
      });
    }
    return combined;
  }
  return [];
};

const mapNewToOldFormat = (data: any, level: "nation" | "region" | "witel"): any[] => {
  const rows = flattenData(data);
  return rows.map((row) => {
    let parameterVal = row.parameter_label || row.parameter_key || "";
    if (level === "region") {
      parameterVal = row.region;
    } else if (level === "witel") {
      parameterVal = row.witel;
    }

    const mapped: Record<string, any> = {};

    mapped.parameter = parameterVal;
    mapped.target = row.target;
    mapped.satuan = row.satuan;
    mapped.weight = row.weight;
    mapped.score_before_rekon = row.score_before_rekon;
    mapped.score_after_rekon = row.score_after_rekon;
    mapped.year = row.tahun;

    Object.keys(row).forEach((k) => {
      if (!(k in mapped)) {
        mapped[k] = row[k];
      }
    });

    const currMonthNum = row.curr_month ? monthLabelToNum(row.curr_month.label) : 0;
    const prevMonthNum = row.prev_month ? monthLabelToNum(row.prev_month.label) : 0;

    if (currMonthNum > 0 && row.curr_month) {
      mapped[`ach_fm_${currMonthNum}`] = row.curr_month.achievement;
      mapped[`score_fm_${currMonthNum}`] = row.curr_month.score;
      mapped[`realisasi_fm_before_${currMonthNum}`] = row.curr_month.before;
      mapped[`realisasi_fm_after_${currMonthNum}`] = row.curr_month.after;

      if (Array.isArray(row.curr_month.weekly)) {
        row.curr_month.weekly.forEach((w: any) => {
          mapped[`ach_${currMonthNum}_${w.week_month}_${w.week_year}`] = w.value;
          mapped[`ach_${currMonthNum}_${w.week_month}`] = w.value;
        });
      }
    }

    if (prevMonthNum > 0 && row.prev_month) {
      mapped[`ach_fm_${prevMonthNum}`] = row.prev_month.achievement;
      mapped[`score_fm_${prevMonthNum}`] = row.prev_month.score;
      mapped[`realisasi_fm_before_${prevMonthNum}`] = row.prev_month.before;
      mapped[`realisasi_fm_after_${prevMonthNum}`] = row.prev_month.after;

      if (Array.isArray(row.prev_month.weekly)) {
        row.prev_month.weekly.forEach((w: any) => {
          mapped[`ach_${prevMonthNum}_${w.week_month}_${w.week_year}`] = w.value;
          mapped[`ach_${prevMonthNum}_${w.week_month}`] = w.value;
        });
      }
    }

    if (level === "nation") {
      mapped.is_parent = true;
      mapped.main_parent = true;
    } else if (level === "region") {
      mapped.parent = true;
    }

    return mapped;
  });
};

export const dashboardApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    SCApi_fethcData: builder.query({
      query: (payload) => {
        if (payload?.query?.type === "msa") {
          return {
            method: "GET",
            url: "achievement-wisa/not-comply/nation",
            params: {
              tahun: payload?.query?.tahun || payload?.query?.year || new Date().getFullYear(),
              area: mapTregToArea(payload?.query?.treg),
            },
          };
        }
        return {
          method: "GET",
          url: "dashboard/monthly/nation",
          params: {
            type: payload?.query?.type ?? "msa",
            filter: payload?.query?.filter ?? "",
            treg: payload?.query?.treg ?? "",
          },
        };
      },
      transformResponse: (response: any, meta: any, arg: any) => {
        if (arg?.query?.type === "msa") {
          return {
            ...response,
            data: mapNewToOldFormat(response?.data, "nation"),
          };
        }
        return response;
      },
      keepUnusedDataFor: 0,
    }),
    TrendApi_fetchData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/weekly/trend",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    CNPApi_fetchData: builder.query({
      query: (payload) => {
        if (payload?.query?.type === "msa") {
          return {
            method: "GET",
            url: "achievement-wisa/not-comply/region",
            params: {
              tahun: payload?.query?.tahun || payload?.query?.year || new Date().getFullYear(),
              parameter_key: mapParameterToKey(payload?.query?.parameter),
              area: mapTregToArea(payload?.query?.treg),
            },
          };
        }
        return {
          method: "GET",
          url: "achievement-wisa/not-comply/region",
          params: {
            tahun: payload?.query?.tahun ?? new Date().getFullYear(),
            parameter_key: payload?.query?.parameter_key ?? payload?.query?.parameter,
            area: area,
          },
        };
      },
      transformResponse: (response: any, meta: any, arg: any) => {
        if (arg?.query?.type === "msa") {
          const isMttr = mapParameterToKey(arg?.query?.parameter).includes("mttrq");
          if (isMttr) {
            const rawData = response?.data;
            const flattened = flattenData(rawData);
            const summaryRows = flattened.filter((row: any) => {
              const rowWilayah = (row.wilayah || "").toLowerCase();
              const rowRegion = (row.region || "").toLowerCase();
              return rowWilayah === rowRegion; // Only summary rows like Jawa, Non Jawa
            });
            const mappedSummaryRows = mapNewToOldFormat(summaryRows, "region").map((summaryRow) => {
              const targetWilayah = summaryRow.region.toLowerCase();
              const regionRows = flattened.filter((row: any) => {
                const rowWilayah = (row.wilayah || "").toLowerCase();
                const rowRegion = (row.region || "").toLowerCase();
                return rowWilayah === targetWilayah && rowRegion !== targetWilayah;
              });
              const mappedRegionRows = mapNewToOldFormat(regionRows, "region").map((regRow, idx) => {
                return {
                  ...regRow,
                  mini_parameter: arg?.query?.parameter,
                  identIndex: `${summaryRow.identIndex || summaryRow.parameter}_reg_${idx}_${regRow.region || idx}`,
                };
              });
              return {
                ...summaryRow,
                mini_parameter: arg?.query?.parameter,
                children: mappedRegionRows,
              };
            });
            return {
              ...response,
              data: mappedSummaryRows,
            };
          }
          return {
            ...response,
            data: mapNewToOldFormat(response?.data, "region"),
          };
        }
        return response;
      },
      keepUnusedDataFor: 0,
    }),
    SiteApi_fetchData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/siteProfilling",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    CNOP_region_fetchData: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/region/monthly/detail",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    detail_ticket: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/tiketProfilling",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    detail_site: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/detail/site/profilling",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    chart_monitoring: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/region/monthly/trend",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    history_data: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: buildPath("dashboard/history/weekly", payload?.query.level),
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    witel_data: builder.query({
      query: (payload) => {
        if (payload?.query?.type === "msa") {
          const isMttr = mapParameterToKey(payload?.query?.parameter || payload?.query?.kpi).includes("mttrq");
          
          if (isMttr) {
            const reg = payload?.query?.region;
            const isWilayahExpansion = reg === "Jawa" || reg === "Non Jawa" || reg === "JAWA" || reg === "NON JAWA";

            if (isWilayahExpansion) {
              // Level 2 (Wilayah) expansion: fetch regions belonging to this wilayah from Region API
              return {
                method: "GET",
                url: "achievement-wisa/not-comply/region",
                params: {
                  tahun: payload?.query?.tahun || payload?.query?.year || new Date().getFullYear(),
                  parameter_key: mapParameterToKey(payload?.query?.kpi || payload?.query?.parameter),
                  area: mapTregToArea(payload?.query?.treg),
                },
              };
            } else {
              // Level 3 (Region) expansion: fetch witels for this region from Witel API
              return {
                method: "GET",
                url: "achievement-wisa/not-comply/witel",
                params: {
                  tahun: payload?.query?.tahun || payload?.query?.year || new Date().getFullYear(),
                  parameter_key: mapParameterToKey(payload?.query?.parameter),
                  region: reg,
                  area: mapTregToArea(payload?.query?.treg),
                  wilayah: normalizeWilayah(payload?.query?.wilayah),
                },
              };
            }
          }

          // Non-MTTRQ
          return {
            method: "GET",
            url: "achievement-wisa/not-comply/witel",
            params: {
              tahun: payload?.query?.tahun || payload?.query?.year || new Date().getFullYear(),
              parameter_key: mapParameterToKey(payload?.query?.parameter),
              region: payload?.query?.region,
              area: mapTregToArea(payload?.query?.treg),
            },
          };
        }
        return {
          method: "GET",
          url: "dashboard/witel/monthly/detail",
          params: payload?.query,
        };
      },
      transformResponse: (response: any, meta: any, arg: any) => {
        if (arg?.query?.type === "msa") {
          const isMttr = mapParameterToKey(arg?.query?.parameter || arg?.query?.kpi).includes("mttrq");
          const reg = arg?.query?.region;
          const isWilayahExpansion = isMttr && (reg === "Jawa" || reg === "Non Jawa" || reg === "JAWA" || reg === "NON JAWA");

          if (isWilayahExpansion) {
            // Filter regions of this wilayah
            const rawData = response?.data;
            const flattened = flattenData(rawData);
            const targetWilayah = reg.toLowerCase();
            const filtered = flattened.filter((row: any) => {
              const rowWilayah = (row.wilayah || "").toLowerCase();
              const rowRegion = (row.region || "").toLowerCase();
              return rowWilayah === targetWilayah && rowRegion !== targetWilayah;
            });
            return {
              ...response,
              data: mapNewToOldFormat(filtered, "region"),
            };
          }

          return {
            ...response,
            data: mapNewToOldFormat(response?.data, "witel"),
          };
        }
        return response;
      },
    }),
    modal_detail: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/detail/site/msa/cnop",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    dashboard_comply: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/parameter/comply",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    detailsite_notclear: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "detailsite/notclear",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    detailsite_notclear_week: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "dashboard/site/not-clear/week",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
    weeklyMonth: builder.query({
      query: (payload) => {
        return {
          method: "GET",
          url: "weeklyMonth",
          params: payload?.query,
        };
      },
      transformResponse: (response: unknown) => {
        return response;
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useLazySCApi_fethcDataQuery,
  useLazyTrendApi_fetchDataQuery,
  useLazyCNPApi_fetchDataQuery,
  useLazySiteApi_fetchDataQuery,
  useLazyCNOP_region_fetchDataQuery,
  useLazyDetail_ticketQuery,
  useLazyChart_monitoringQuery,
  useLazyDetail_siteQuery,
  useLazyHistory_dataQuery,
  useLazyWitel_dataQuery,
  useLazyModal_detailQuery,
  useLazyDashboard_complyQuery,
  useLazyDetailsite_notclearQuery,
  useLazyDetailsite_notclear_weekQuery,
  useLazyWeeklyMonthQuery,
} = dashboardApi;
