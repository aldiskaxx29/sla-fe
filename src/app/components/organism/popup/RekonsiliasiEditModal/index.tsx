// React
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Toast
import { toast } from "react-toastify";

// Api
import { downloadEvidence, getRekonsiliasiDetail } from "@/app/api";

// Atoms
import {
  Button,
  Checkbox,
  DateInput,
  FieldLabel,
  IconUpload,
  Select,
  TextAreaInput,
  TextInput,
} from "@/app/components/atoms";

// Molecules
import Modal from "@/app/components/molecules/Modal";

// Options
import {
  GROUPING_OPTIONS,
  MTTRQ_GROUPING_RCA_OPTIONS,
  PROGRESS_OPTIONS,
  STATUS_PROGRESS_OPTIONS,
} from "./options";

type FormValues = Record<string, unknown>;

interface RekonsiliasiEditModalProps {
  open: boolean;
  parameter: string;
  dataModal: Record<string, unknown>;
  week?: string | number;
  year?: string | number;
  onCancel: () => void;
  onSave: (payload: FormValues) => void | Promise<void>;
}

const toSelectOptions = (values: string[]) =>
  values.map((value) => ({ label: value, value }));

const parseEvidenceUrl = (evidence: unknown): string => {
  if (typeof evidence !== "string" || !evidence) return "";

  try {
    const parsed = JSON.parse(evidence);
    return Array.isArray(parsed) ? (parsed[0]?.url ?? "") : "";
  } catch {
    return "";
  }
};

/** Form edit satu baris rekonsiliasi, termasuk unggah evidence. */
const RekonsiliasiEditModal = ({
  open,
  parameter,
  dataModal,
  week,
  onCancel,
  onSave,
}: RekonsiliasiEditModalProps) => {
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSiteSos, setIsSiteSos] = useState(false);
  const [isExcluded, setIsExcluded] = useState(false);
  const [kpiOptions, setKpiOptions] = useState<string[]>([]);
  const [preview, setPreview] = useState("");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMttrq = parameter.includes("mttrq");

  const setValue = (field: string, value: unknown) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;

      return Object.fromEntries(
        Object.entries(current).filter(([key]) => key !== field),
      );
    });
  };

  const resetForm = useCallback(() => {
    setValues({});
    setErrors({});
    setKpiOptions([]);
    setPreview("");
    setIsSiteSos(false);
    setIsExcluded(false);
  }, []);

  const loadDetail = useCallback(async () => {
    setIsLoadingDetail(true);
    try {
      const result = (await getRekonsiliasiDetail({
        parameter: String(dataModal.parameter ?? parameter),
        id: dataModal.id as string | number,
        week,
      })) as Record<string, unknown>;

      const currentParameter = String(dataModal.parameter ?? parameter);
      let initialExclude = false;

      if (currentParameter.includes("packetloss")) {
        initialExclude =
          result?.status_packetloss_15 === 2 || result?.status_packetloss_5 === 2;
      } else if (currentParameter.includes("jitter")) {
        initialExclude = result?.status_jitter === 2;
      } else if (currentParameter.includes("latency")) {
        initialExclude = result?.status_latency === 2;
      } else {
        initialExclude = Boolean(result?.site_exclude);
      }

      setValues({
        ...result,
        week,
        kpi: Array.isArray(result?.kpi) ? result.kpi : [],
        evidence: null,
      });
      setKpiOptions(Array.isArray(result?.options) ? result.options : []);
      setIsSiteSos(Boolean(result?.site_sos));
      setIsExcluded(initialExclude);
      setPreview(parseEvidenceUrl(result?.evidence));
    } catch (error) {
      console.error("Failed to fetch rekonsiliasi detail:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [dataModal, parameter, week]);

  useEffect(() => {
    if (open && dataModal?.id) {
      resetForm();
      loadDetail();
      return;
    }

    if (!open) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dataModal?.id]);

  const group1FromGroup2 = (group2: string) =>
    GROUPING_OPTIONS.find((item) => item.group2 === group2)?.group1 ?? "";

  const progressOptions = useMemo(() => {
    const group1 = String(values.group1 ?? "");
    if (!group1) return [];

    return PROGRESS_OPTIONS.filter((item) => item.group11 === group1).map(
      (item) => item.group22,
    );
  }, [values.group1]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const isEmpty = (value: unknown) =>
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && !value.length);

    if (isEmpty(values.site_id)) nextErrors.site_id = "Masukkan Site ID";

    if (isMttrq) {
      if (isEmpty(values.ttr_selisih)) {
        nextErrors.ttr_selisih = "Masukkan Ttr Selisih";
      }
      if (isEmpty(values.ticket_id)) nextErrors.ticket_id = "Masukkan Ticket Id";
      if (isEmpty(values.grouping_rca)) {
        nextErrors.grouping_rca = "Masukkan Grouping RCA";
      }
    } else {
      if (isEmpty(values.group2)) {
        nextErrors.group2 = "Pilih RCA Rekonsiliasi";
      }
      if (isEmpty(values.group22)) {
        nextErrors.group22 = "Pilih Update Progress";
      }
      if (isEmpty(values.kpi)) nextErrors.kpi = "Pilih KPI";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    await onSave({
      ...values,
      site_sos: isSiteSos,
      exclude: isExcluded,
      site_exclude: isExcluded,
    });
  };

  const handlePickEvidence = (file?: File | null) => {
    if (!file) return;

    setValue("evidence", file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDownloadEvidence = async () => {
    try {
      const blob = await downloadEvidence({
        id: String(dataModal.id ?? ""),
        kpi: String((values.kpi as string[] | undefined)?.[0] ?? ""),
      });

      const mimeType = blob.type;
      let extension = "file";
      if (mimeType.includes("jpeg")) extension = "jpg";
      else if (mimeType.includes("png")) extension = "png";

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.setAttribute("download", `evidence.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download file");
    }
  };

  return (
    <Modal open={open} onClose={onCancel} width={760} bodyClassName="px-6 pb-4">
      <p className="my-3 w-full text-center text-lg font-semibold text-[#0E2133]">
        Update Site Exlcude
      </p>

      {isLoadingDetail ? (
        <p className="py-6 text-center text-sm text-gray-400">Memuat data...</p>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldLabel label="Site ID" required error={errors.site_id}>
            <TextInput
              value={String(values.site_id ?? "")}
              placeholder="Masukkan Site ID"
              readOnly
              invalid={Boolean(errors.site_id)}
            />
          </FieldLabel>

          {!isMttrq ? (
            <div className="grid grid-cols-2 gap-4">
              <FieldLabel label="Exclude?">
                <Checkbox checked={isExcluded} onChange={setIsExcluded}>
                  {isExcluded ? "Yes" : "No"}
                </Checkbox>
              </FieldLabel>
              <FieldLabel label="Site SOS">
                <Checkbox checked={isSiteSos} onChange={setIsSiteSos}>
                  {isSiteSos ? "Yes" : "No"}
                </Checkbox>
              </FieldLabel>
            </div>
          ) : null}
        </div>

        {isMttrq ? (
          <>
            <FieldLabel label="Ttr Selisih" required error={errors.ttr_selisih}>
              <TextInput
                value={String(values.ttr_selisih ?? "")}
                placeholder="Masukkan Ttr Selisih"
                invalid={Boolean(errors.ttr_selisih)}
                onChange={(event) => setValue("ttr_selisih", event.target.value)}
              />
            </FieldLabel>

            <FieldLabel label="Ticket Id" required error={errors.ticket_id}>
              <TextInput
                value={String(values.ticket_id ?? "")}
                placeholder="Masukkan Ticket Id"
                readOnly
                invalid={Boolean(errors.ticket_id)}
              />
            </FieldLabel>

            <FieldLabel
              label="Grouping RCA"
              required
              error={errors.grouping_rca}
            >
              <Select
                options={toSelectOptions(MTTRQ_GROUPING_RCA_OPTIONS)}
                value={String(values.grouping_rca ?? "")}
                placeholder="Pilih Grouping RCA"
                invalid={Boolean(errors.grouping_rca)}
                searchable
                onChange={(next) => setValue("grouping_rca", next)}
              />
            </FieldLabel>
          </>
        ) : (
          <>
            <FieldLabel
              label="RCA Rekonsiliasi"
              required
              error={errors.group2}
            >
              <Select
                options={toSelectOptions(
                  GROUPING_OPTIONS.map((item) => item.group2),
                )}
                value={String(values.group2 ?? "")}
                placeholder="Pilih RCA Rekonsiliasi"
                invalid={Boolean(errors.group2)}
                searchable
                onChange={(next) => {
                  const group2 = String(next);

                  setValues((current) => ({
                    ...current,
                    group2,
                    group1: group1FromGroup2(group2),
                    // Update Progress bergantung group1, jadi ikut direset.
                    group22: "",
                  }));
                  setErrors((current) => ({
                    ...current,
                    group2: "",
                    group22: "",
                  }));
                }}
              />
            </FieldLabel>

            <FieldLabel label="Grouping RCA">
              <TextInput value={String(values.group1 ?? "")} disabled />
            </FieldLabel>

            <FieldLabel label="Update Progress" required error={errors.group22}>
              <Select
                options={toSelectOptions(progressOptions)}
                value={String(values.group22 ?? "")}
                placeholder="Pilih Update Progress"
                disabled={!values.group1}
                invalid={Boolean(errors.group22)}
                onChange={(next) => setValue("group22", next)}
              />
            </FieldLabel>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FieldLabel label="Status Progress">
                <Select
                  options={toSelectOptions(STATUS_PROGRESS_OPTIONS)}
                  value={String(values.status_progress ?? "")}
                  placeholder="Pilih Status Progres"
                  onChange={(next) => setValue("status_progress", next)}
                />
              </FieldLabel>

              <FieldLabel label="Tanggal">
                <DateInput
                  value={String(values.date ?? "").slice(0, 10)}
                  onChange={(next) => setValue("date", next)}
                />
              </FieldLabel>
            </div>

            <FieldLabel label="KPI" required error={errors.kpi}>
              <Select
                multiple
                options={toSelectOptions(kpiOptions)}
                value={Array.isArray(values.kpi) ? values.kpi : []}
                placeholder="Pilih KPI"
                invalid={Boolean(errors.kpi)}
                onChange={(next) => setValue("kpi", next)}
              />
            </FieldLabel>
          </>
        )}

        <FieldLabel label="Keterangan Rekon">
          <TextAreaInput
            value={String(values.note ?? "")}
            placeholder="Masukkan Keterangan Rekon"
            onChange={(event) => setValue("note", event.target.value)}
          />
        </FieldLabel>

        <FieldLabel label="Evidence">
          <div className="rounded-xl border-2 border-dashed border-[#D9D9D9] p-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handlePickEvidence(event.target.files?.[0])}
            />

            {preview ? (
              <div className="flex flex-col items-center gap-2 p-2">
                <span className="text-xs font-medium text-gray-500">
                  Evidence Saat Ini:
                </span>
                <img
                  src={preview}
                  alt="evidence"
                  className="max-h-[180px] max-w-[180px] rounded object-contain"
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Edit
                  </Button>
                  {preview.startsWith("blob:") ? null : (
                    <Button size="sm" onClick={handleDownloadEvidence}>
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handlePickEvidence(event.dataTransfer.files?.[0]);
                }}
                className="flex cursor-pointer flex-col items-center gap-2 py-6 text-gray-500"
              >
                <IconUpload size={22} />
                <span className="text-sm">
                  Upload File Baru / Seret File Ke Sini
                </span>
              </div>
            )}
          </div>
        </FieldLabel>
      </div>

      <div className="sticky bottom-0 z-10 -mx-6 mt-6 flex justify-end gap-2 border-t border-[#E5E7EB] bg-white px-6 pb-2 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </Modal>
  );
};

export default RekonsiliasiEditModal;
