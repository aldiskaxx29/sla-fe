/** Payload mentah dari form edit rekonsiliasi. */
export type RekonsiliasiSavePayload = Record<string, unknown>;

const appendValue = (
  formData: FormData,
  key: string,
  value: unknown,
  fallback = "",
) => {
  formData.append(key, value === undefined || value === null ? fallback : String(value));
};

/** Berkas evidence bisa datang sebagai File, fileList antd, atau objek upload. */
const resolveEvidenceFile = (evidence: unknown): File | null => {
  if (Array.isArray(evidence) && evidence.length) {
    return (evidence[0] as { originFileObj?: File })?.originFileObj ?? null;
  }

  const withFile = evidence as { file?: File } | undefined;
  if (withFile?.file) return withFile.file;

  return (evidence as File) ?? null;
};

/**
 * Menyusun body simpan rekonsiliasi. Nama field grouping dan progress berbeda
 * per parameter, jadi dipetakan di sini supaya form-nya tetap sederhana.
 */
export const buildRekonsiliasiFormData = (
  payload: RekonsiliasiSavePayload,
  parameter: string,
): FormData => {
  const formData = new FormData();

  appendValue(formData, "id", payload.id);
  appendValue(formData, "year", payload.year);
  appendValue(formData, "month", payload.month);
  appendValue(formData, "week", payload.week);
  appendValue(
    formData,
    "rca_rekonsiliasi",
    payload.rca_packetloss ?? payload.rca_latency ?? payload.rca_jitter,
  );
  appendValue(formData, "update_progress", payload.group22);
  appendValue(formData, "grouping_rca", payload.grouping_rca);

  const dynamicKey = parameter.includes("packetloss")
    ? "packetloss"
    : parameter.includes("latency")
      ? "latency"
      : parameter.includes("jitter")
        ? "jitter"
        : null;

  if (dynamicKey) {
    appendValue(formData, `grouping_rca_${dynamicKey}_cnq_1`, payload.group1);
    appendValue(formData, `grouping_rca_${dynamicKey}_cnq_2`, payload.group2);
    appendValue(
      formData,
      `status_progress_${dynamicKey}`,
      payload.status_progress,
    );
    appendValue(formData, `tanggal_action_${dynamicKey}`, payload.date);
  }

  appendValue(formData, "detail_rca", payload.detail_rca);

  const evidenceFile = resolveEvidenceFile(payload.evidence);
  if (evidenceFile) formData.append("evidence", evidenceFile);

  appendValue(formData, "site_id", payload.site_id);
  appendValue(formData, "ttr_selisih", payload.ttr_selisih);
  appendValue(formData, "note", payload.note);
  appendValue(formData, "parameter", parameter);
  appendValue(formData, "ticket", payload.ticket_id);
  appendValue(formData, "kpi", payload.kpi);
  appendValue(formData, "site_sos", payload.site_sos);
  appendValue(formData, "site_exclude", payload.site_exclude);

  return formData;
};
