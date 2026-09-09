import AppDropdown from "@/app/components/AppDropdown";
import xlxsIcon from "@/assets/file-spreadsheet.svg";
import { Button, Image, Input } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TableInputSite } from "../components/TableInputSite";
import { useSite } from "../hooks/site.hooks";
import {
  useLazyDownload_templateQuery,
  useUpload_templateMutation,
} from "../rtk/site.rtk";
import { toast } from "react-toastify";
import { ModalConfirmImport } from "../components/ModalConfirmImport";

const DEFAULT_SEARCHABLE = [
  "id",
  "status_packetloss_5",
  "status_packetloss_15",
  "value",
  "week",
  "status_site",
  "site_id",
  "ticket_id",
  "region_tsel",
  "district",
  "distribution_pl",
  "grouping_rca",
  "evidence",
  "packetloss_status",
  "RCA",
  "detail_rca",
  "ticket",
  "note",
  "grouping_rca_packetloss_cnq_1",
  "grouping_rca_packetloss_cnq_2",
  "last_update_packetloss_cnq",
  "user_update_packetloss_cnq",
  "grouping_rca_packetloss_regional_1",
  "grouping_rca_packetloss_regional_2",
  "last_update_packetloss_regional",
  "user_update_packetloss_regional",
  "rca_packetloss",
  "update_progress_packetloss",
  "status_saat_ini",
  "status_packetloss",
  "area",
];

// Dipakai kalau /dashboard/rekonsiliasi/yearweek gagal dimuat.
const FALLBACK_FILTER_WEEKS = [
  { month: "1", value: ["all", "1", "2", "3", "4"] },
  { month: "2", value: ["all", "5", "6", "7", "8"] },
  { month: "3", value: ["all", "9", "10", "11", "12", "13"] },
  { month: "4", value: ["all", "14", "15", "16", "17"] },
  { month: "5", value: ["all", "18", "19", "20", "21"] },
  { month: "6", value: ["all", "22", "23", "24", "25", "26"] },
  { month: "7", value: ["all", "27", "28", "29", "30"] },
  { month: "8", value: ["all", "31", "32", "33", "34"] },
  { month: "9", value: ["all", "35", "36", "37", "38", "39"] },
  { month: "10", value: ["all", "40", "41", "42", "43"] },
  { month: "11", value: ["all", "44", "45", "46", "47"] },
  { month: "12", value: ["all", "48", "49", "50", "51", "52"] },
];

const SitePage = () => {
  const [week, setWeek] = useState("");
  const [month, setMonth] = useState(String(dayjs().month() + 1));
  const [year, setYear] = useState(String(dayjs(new Date()).year()));
  const [exclude, setExclude] = useState("all");
  const [evidence, setEvidence] = useState("all");
  const [prev, setPrev] = useState("corrective");
  const [loading, setLoading] = useState(false);
  const [parameter, setParameter] = useState("packetloss ran to core");
  // Filter checkbox dikirim sebagai filter[field][]=value, jadi beberapa kolom
  // bisa aktif sekaligus.
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  // Kotak search per kolom memakai search + searchable (pencarian LIKE),
  // dan hanya satu yang bisa aktif karena backend cuma punya satu `search`.
  const [columnSearch, setColumnSearch] = useState<{
    field: string;
    value: string;
  } | null>(null);
  const { getSite, getYearWeek } = useSite();
  // Daftar tahun, bulan, dan minggu diambil dari BE.
  const [yearWeek, setYearWeek] = useState<Record<string, unknown> | null>(
    null,
  );
  // Data tabel baru diambil setelah periode aktif dari BE diketahui, supaya
  // tidak ada request dengan bulan/minggu default yang langsung ditimpa.
  const [isPeriodReady, setIsPeriodReady] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [search, setSearch] = useState("");
  const [siteResponse, setSiteResponse] = useState<Record<string, any> | null>(
    null,
  );
  // Opsi filter kolom disimpan dari response terakhir tanpa filter aktif,
  // supaya daftar pilihannya tidak ikut menyusut saat filter sedang dipakai.
  const [filterOptions, setFilterOptions] = useState<
    Record<string, string[]> | undefined
  >(undefined);
  // Dibaca lewat ref supaya `expandFilterValues` tetap stabil — kalau ikut
  // dependensi fetchSite, setiap response memicu fetch baru tanpa henti.
  const filterOptionsRef = useRef<Record<string, string[]> | undefined>(
    undefined,
  );
  const activeSiteRequestRef = useRef<{ abort?: () => void } | null>(null);
  const requestSeqRef = useRef(0);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const mttrqParameters = ["mttrq critical", "mttrq major", "mttrq minor"];
  const isMttrqParameter = mttrqParameters.includes(parameter);

  const filterWeeks = useMemo<{ month: string; value: string[] }[]>(() => {
    const fromApi = yearWeek?.filterWeeks;
    if (!Array.isArray(fromApi) || !fromApi.length) return FALLBACK_FILTER_WEEKS;

    return fromApi.map((item: Record<string, unknown>) => ({
      month: String(item?.month ?? ""),
      value: Array.isArray(item?.value) ? item.value.map(String) : [],
    }));
  }, [yearWeek]);

  const selectedWeeks = useMemo(
    () => filterWeeks.find((item) => item.month === month)?.value ?? [],
    [filterWeeks, month],
  );

  const effectiveWeek = useMemo(() => {
    if (isMttrqParameter) return "";
    if (week) return week;
    return selectedWeeks.find((item) => item !== "all") ?? selectedWeeks[0] ?? "";
  }, [isMttrqParameter, selectedWeeks, week]);
  const effectiveMonth = month;
  const tableKey = useMemo(
    () => `${parameter}-${year}-${effectiveMonth}-${effectiveWeek}-${prev}-${exclude}-${evidence}`,
    [parameter, year, effectiveMonth, effectiveWeek, prev, exclude, evidence],
  );

  const normalizeFilterValue = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, " ");

  const expandFilterValues = useCallback(
    (field: string, values: string[]) => {
      const options = filterOptionsRef.current?.[field] ?? [];
      const expanded = new Set<string>();

      values.forEach((value) => {
        expanded.add(value);
        options.forEach((option) => {
          if (normalizeFilterValue(option) === normalizeFilterValue(value)) {
            expanded.add(option);
          }
        });
      });

      return Array.from(expanded);
    },
    [],
  );

  // Saat ada filter aktif, `options` dari response ikut menyempit — jadi daftar
  // pilihan hanya diperbarui dari response tanpa filter.
  const hasActiveFilter =
    Boolean(columnSearch) ||
    Boolean(search.trim()) ||
    Object.values(columnFilters).some((values) => values.length > 0);

  const fetchSite = useCallback(async () => {
    activeSiteRequestRef.current?.abort?.();
    const requestSeq = requestSeqRef.current + 1;
    requestSeqRef.current = requestSeq;
    setLoading(true);

    // Search per kolom mempersempit `searchable` ke field kolom itu,
    // search bar mencari ke seluruh field.
    const activeSearch = columnSearch ? columnSearch.value.trim() : search.trim();
    const activeSearchable = columnSearch
      ? [columnSearch.field]
      : DEFAULT_SEARCHABLE;
    // Dropdown menampilkan satu entri per nilai, tapi backend menyimpan beda
    // kapitalisasi ("Technical TSEL" vs "Technical Tsel"). Semua varian dari
    // `options` ikut dikirim supaya tidak ada baris yang terlewat.
    const activeFilters = Object.fromEntries(
      Object.entries(columnFilters)
        .filter(([, values]) => values.length > 0)
        .map(([field, values]) => [field, expandFilterValues(field, values)]),
    );

    try {
      const request = getSite({
        query: {
          prev,
          exclude,
          evidence,
          parameter,
          year,
          month: effectiveMonth,
          _t: Date.now(),
          ...(!isMttrqParameter && { week: effectiveWeek }),
          page: pagination.current,
          per_page: pagination.pageSize,
          ...(activeSearch ? { search: activeSearch } : {}),
          searchable: activeSearchable,
          filter: activeFilters,
        },
      });
      activeSiteRequestRef.current = request;
      const result = (await request.unwrap()) as Record<string, any>;
      if (requestSeqRef.current !== requestSeq) return;

      setSiteResponse(result);
      if (!hasActiveFilter && result?.options) {
        const nextOptions = result.options as Record<string, string[]>;
        filterOptionsRef.current = nextOptions;
        // Response selalu membawa objek baru, jadi state hanya diganti kalau
        // isinya memang berubah.
        setFilterOptions((current) =>
          JSON.stringify(current) === JSON.stringify(nextOptions)
            ? current
            : nextOptions,
        );
      }

      const rows = Array.isArray(result?.data) ? result.data : [];
      const newTotal = result?.meta?.total ?? result?.total ?? rows.length;

      setPagination((prevPag) => {
        if (prevPag.total === newTotal) return prevPag;
        return {
          ...prevPag,
          total: newTotal,
        };
      });
    } catch (error) {
      console.error("Failed to fetch site data:", error);
    } finally {
      if (requestSeqRef.current === requestSeq) {
        setLoading(false);
      }
    }
  }, [
    exclude,
    evidence,
    parameter,
    effectiveMonth,
    effectiveWeek,
    year,
    prev,
    isMttrqParameter,
    pagination.current,
    pagination.pageSize,
    search,
    columnSearch,
    columnFilters,
    hasActiveFilter,
    expandFilterValues,
    getSite,
  ]);

  useEffect(() => {
    let cancelled = false;

    const fetchYearWeek = async () => {
      try {
        const result = (await getYearWeek(
          {},
        ).unwrap()) as Record<string, unknown>;
        if (cancelled) return;

        setYearWeek(result);

        // Periode aktif dari BE dipakai sebagai nilai awal filter.
        const activeYear = String(result?.active_yearweek ?? "").slice(0, 4);
        if (activeYear) setYear(activeYear);
        if (result?.active_month) setMonth(String(result.active_month));
        if (result?.active_week) setWeek(String(result.active_week));
      } catch (error) {
        console.error("Failed to fetch year week:", error);
      } finally {
        if (!cancelled) setIsPeriodReady(true);
      }
    };

    fetchYearWeek();

    return () => {
      cancelled = true;
    };
  }, [getYearWeek]);

  useEffect(() => {
    if (!isPeriodReady) return;
    if (!month || !year) return;
    if (!isMttrqParameter && !effectiveWeek) return;
    fetchSite();
  }, [fetchSite, trigger, isPeriodReady]);

  useEffect(() => {
    setPagination((current) => {
      if (current.current === 1) return current;
      return {
        ...current,
        current: 1,
      };
    });
  }, [
    exclude,
    evidence,
    parameter,
    year,
    month,
    prev,
    week,
    search,
    columnSearch,
    columnFilters,
  ]);

  // Kolom tiap parameter berbeda, jadi filter kolom direset saat parameter ganti.
  useEffect(() => {
    setColumnFilters((current) =>
      Object.keys(current).length ? {} : current,
    );
    setColumnSearch((current) => (current ? null : current));
    filterOptionsRef.current = undefined;
    setFilterOptions(undefined);
  }, [parameter]);

  useEffect(() => {
    return () => {
      activeSiteRequestRef.current?.abort?.();
    };
  }, []);

  const optPrev = [
    // { label: "All", value: "all" },
    { label: "Corrective", value: "corrective" },
    { label: "Preventive", value: "preventive" },
  ];

  const optExclude = [
    { label: "All", value: "all" },
    { label: "Exclude", value: "2" },
    { label: "Non Exclude", value: "1" },
  ];

  const optEvidence = [
    { label: "All", value: "all" },
    { label: "Sudah Ada Evidence", value: "with" },
    { label: "Belum Ada Evidence", value: "without" },
  ];

  const optParameters = [
    // { label: "Packetloss 1-5%", value: "packetloss 1-5% ran to core" },
    { label: "Packetloss", value: "packetloss ran to core" },
    { label: "Jitter", value: "jitter ran to core" },
    { label: "Latency", value: "latency ran to core" },
    { label: "Mttrq Critical", value: "mttrq critical" },
    { label: "Mttrq Major", value: "mttrq major" },
    { label: "Mttrq Minor", value: "mttrq minor" },
  ];

  // Tahun diambil dari daftar yearweek (mis. "202636" -> "2026").
  const optYear = useMemo(() => {
    const years = Array.from(
      new Set(
        (Array.isArray(yearWeek?.data) ? yearWeek.data : [])
          .map((item: unknown) => String(item ?? "").slice(0, 4))
          .filter(Boolean),
      ),
    ).sort() as string[];

    if (!years.length) return [{ label: year, value: year }];

    return years.map((item) => ({ label: item, value: item }));
  }, [yearWeek, year]);

  // Bulan mengikuti daftar bulan yang dikirim BE lewat filterWeeks.
  const optMonths = useMemo(
    () =>
      filterWeeks.map((item) => ({
        label: dayjs()
          .month(Number(item.month) - 1)
          .format("MMMM"),
        value: item.month,
      })),
    [filterWeeks],
  );

  const optWeeks = useMemo(
    () =>
      selectedWeeks.map((item) => ({
        label: item === "all" ? "Week All" : `Week ${item}`,
        value: item,
      })),
    [selectedWeeks],
  );

  useEffect(() => {
    if (isMttrqParameter) return;
    if (!selectedWeeks.length) return;
    if (!week) {
      setWeek(selectedWeeks.find((item) => item !== "all") ?? selectedWeeks[0]);
      return;
    }
    if (!selectedWeeks.includes(week)) {
      setWeek(selectedWeeks.find((item) => item !== "all") ?? selectedWeeks[0]);
    }
  }, [isMttrqParameter, selectedWeeks, week]);

  const [downloadTemplate] = useLazyDownload_templateQuery();

  const handleDownload = useCallback(async () => {
    try {
      const result = await downloadTemplate({
        query: {
          exclude,
          evidence,
          parameter,
          year,
          month: effectiveMonth,
          ...(!isMttrqParameter && { week: effectiveWeek }),
        },
      }).unwrap();

      const blobUrl = URL.createObjectURL(result as Blob);

      const tempLink = document.createElement("a");
      tempLink.href = blobUrl;
      if (
        parameter.includes("mttrq major") ||
        parameter.includes("mttrq minor")
      ) {
        tempLink.setAttribute("download", "template-rekonsiliasi-mttr.xlsx");
      } else {
        tempLink.setAttribute("download", "template-rekonsiliasi-access.xlsx");
      }
      document.body.appendChild(tempLink);
      tempLink.click();

      document.body.removeChild(tempLink);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download the file:", error);
    }
  }, [
    exclude,
    evidence,
    effectiveMonth,
    effectiveWeek,
    parameter,
    isMttrqParameter,
    downloadTemplate,
  ]);
  const [uploadTemplate, { isLoading }] = useUpload_templateMutation();
  const [isModalImportOpen, setIsModalImportOpen] = useState(false);

  const handleConfirmUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadTemplate({
        query: {
          exclude,
          parameter,
          month,
          ...(!isMttrqParameter && { week }),
          ...(isMttrqParameter && { month }),
        },
        body: formData,
      }).unwrap();

      toast.success(`${file.name} file uploaded successfully`);
      setTrigger((value) => value + 1);
      setIsModalImportOpen(false);
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast.error(`${file.name} file upload failed.`);
    }
  };

  return (
    <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 m-6 overflow-x-hidden">
      <div className="flex justify-between mb-6 gap-4 overflow-x-auto">
        {/* <div className="bg-[#EDEDED] max-w-[210px] rounded-[54px] px-4 py-1 h-10 flex justify-center items-center mr-2">
          <p className="font-semibold text-[#0E2133] text-base">REKONSILIASI</p>
        </div> */}
        <div className="flex gap-4 flex-nowrap min-w-max">
          <AppDropdown
            title="Site Type"
            placeholder="All"
            options={optPrev}
            value={prev}
            onChange={(value) => setPrev(value)}
          />
          <AppDropdown
            title="Exclude"
            placeholder="All"
            options={optExclude}
            value={exclude}
            onChange={(value) => setExclude(value)}
          />
          <AppDropdown
            title="Evidence"
            placeholder="All"
            options={optEvidence}
            value={evidence}
            onChange={(value) => setEvidence(value)}
          />
          <AppDropdown
            title="Parameter"
            placeholder="All"
            options={optParameters}
            value={parameter}
            onChange={(value) => setParameter(value)}
          />
          <AppDropdown
            title="Tahun"
            placeholder="All"
            options={optYear}
            value={year}
            onChange={(value) => setYear(value)}
          />
          <AppDropdown
            title="Month"
            placeholder="All"
            options={optMonths}
            value={month}
            onChange={(value) => setMonth(value)}
          />
          {!isMttrqParameter && (
            <AppDropdown
              title="Week"
              placeholder="All"
              options={optWeeks}
              value={week}
              onChange={(value) => setWeek(value)}
            />
          )}
          <div className="flex flex-col justify-end">
            <Input.Search
              placeholder="Search site..."
              allowClear
              value={search}
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                if (val) setColumnSearch(null);
                if (!val) {
                  setPagination((current) => ({ ...current, current: 1 }));
                }
              }}
              onSearch={(val) => {
                setSearch(val);
                if (val) setColumnSearch(null);
                setPagination((current) => ({ ...current, current: 1 }));
              }}
              className="!w-56"
              style={{ height: 44 }}
            />
          </div>
          <Button
            onClick={() => {
              handleDownload();
            }}
            className="!h-11 !px-3 py-2.5 !border-0 !rounded-full !bg-[#EDFFFD]"
          >
            <p className="text-brand-secondary font-medium">
              Download Template Excel
            </p>
            <Image src={xlxsIcon} alt="icon" width={16} preview={false} />
          </Button>
          <Button
            onClick={() => setIsModalImportOpen(true)}
            className="!h-11 !px-3 py-2.5 !border-0 !rounded-full !bg-[#EDFFFD]"
          >
            <p className="text-brand-secondary font-medium">Import Excel</p>
            <Image src={xlxsIcon} alt="icon" width={16} preview={false} />
          </Button>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <TableInputSite
          tableKey={tableKey}
          dataSource={siteResponse?.data ?? []}
          isLoading={loading || !siteResponse?.data}
          parameter={parameter}
          week={effectiveWeek}
          month={effectiveMonth}
          year={year}
          setTrigger={setTrigger}
          pagination={pagination}
          setPagination={setPagination}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          columnSearch={columnSearch}
          setColumnSearch={setColumnSearch}
          filterOptions={filterOptions}
          setSearch={setSearch}
        />
      </div>

      <ModalConfirmImport
        open={isModalImportOpen}
        onCancel={() => setIsModalImportOpen(false)}
        onConfirm={handleConfirmUpload}
        isLoading={isLoading}
        parameter={parameter}
        month={month}
        week={effectiveWeek}
        year={year}
        prev={prev}
        exclude={exclude}
        evidence={evidence}
        isMttrqParameter={isMttrqParameter}
      />
    </div>
  );
};

export default SitePage;
