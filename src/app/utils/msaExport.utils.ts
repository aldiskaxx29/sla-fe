/**
 * Export XLS tabel WISA Not Comply dilayani service PQM report. Di production
 * service-nya satu origin dengan aplikasi pada path `/pqm-reoprt` (ejaan
 * mengikuti server); saat dev dilewatkan proxy `/pqm-api` di vite.config.ts.
 */
const PQM_PRODUCTION_BASE_URL = "/pqm-reoprt";
const PQM_DOWNLOAD_PATH = "/api/pqm-report/download";

const configuredBaseUrl = import.meta.env.VITE_PQM_API_BASE_URL?.replace(
  /\/+$/,
  "",
);

const isAbsoluteUrl = (value?: string) => /^https?:\/\//i.test(value ?? "");

/**
 * Basis relatif seperti `/pqm-api` hanya berarti saat dev (ada proxy vite), jadi
 * di production diabaikan kecuali env memang diisi URL absolut.
 */
const PQM_API_BASE_URL = import.meta.env.DEV
  ? configuredBaseUrl || "/pqm-api"
  : isAbsoluteUrl(configuredBaseUrl)
    ? (configuredBaseUrl as string)
    : PQM_PRODUCTION_BASE_URL;

const PQM_DOWNLOAD_URLS = Array.from(
  new Set(
    [PQM_API_BASE_URL, PQM_PRODUCTION_BASE_URL].map(
      (base) => `${base}${PQM_DOWNLOAD_PATH}`,
    ),
  ),
);

const parseFilenameFromDisposition = (disposition: string | null) => {
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);

  return match ? decodeURIComponent(match[1].trim()) : null;
};

/** Kalau server balas HTML atau body kosong berarti path-nya salah sasaran. */
const isSpreadsheetResponse = (contentType: string | null, size: number) =>
  size > 0 &&
  /spreadsheet|officedocument|excel|octet-stream/i.test(contentType ?? "");

/** Cadangan terakhir: biarkan browser yang mengunduh lewat tab baru. */
const downloadViaBrowser = () => {
  const url = `${PQM_PRODUCTION_BASE_URL}${PQM_DOWNLOAD_PATH}`;
  const popup = window.open(url, "_blank", "noopener");

  if (popup) return;

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => link.remove(), 0);
};

const saveBlob = (blob: Blob, filename: string) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};

/**
 * @returns `true` kalau file berhasil diunduh langsung, `false` kalau terpaksa
 * dilanjutkan lewat tab browser.
 */
export const downloadMsaReport = async (): Promise<boolean> => {
  let lastError: unknown = null;

  for (const url of PQM_DOWNLOAD_URLS) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Request gagal dengan status ${response.status}`);
      }

      const blob = await response.blob();
      const contentType = response.headers.get("content-type") || blob.type;

      if (!isSpreadsheetResponse(contentType, blob.size)) {
        throw new Error(
          `Respons bukan file XLSX (${contentType || "tanpa content-type"}, ${blob.size} byte)`,
        );
      }

      const fallbackName = `Report_PQM_${new Date().toISOString().slice(0, 10)}.xlsx`;

      saveBlob(
        blob,
        parseFilenameFromDisposition(
          response.headers.get("content-disposition"),
        ) || fallbackName,
      );

      return true;
    } catch (error) {
      console.warn(`Unduh Report PQM gagal lewat ${url}:`, error);
      lastError = error;
    }
  }

  console.error("Gagal mengunduh Report PQM:", lastError);
  downloadViaBrowser();

  return false;
};
