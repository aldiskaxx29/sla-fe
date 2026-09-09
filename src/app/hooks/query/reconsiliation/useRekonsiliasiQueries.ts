// React Query
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// Toast
import { toast } from "react-toastify";

// Api
import {
  downloadRekonsiliasiTemplate,
  getRekonsiliasiList,
  getYearWeek,
  importRekonsiliasiTemplate,
  rekonsiliasiKeys,
  saveRekonsiliasi,
} from "@/app/api";

// Types
import type {
  DownloadTemplateParams,
  ImportTemplatePayload,
  RekonsiliasiListParams,
} from "@/app/types/reconsiliation/rekonsiliasi.types";

/** Daftar tahun/bulan/minggu yang tersedia. Jarang berubah, jadi di-cache lama. */
export const useYearWeekQuery = () =>
  useQuery({
    queryKey: rekonsiliasiKeys.yearWeek(),
    queryFn: ({ signal }) => getYearWeek(signal),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useRekonsiliasiListQuery = (
  params: RekonsiliasiListParams,
  enabled = true,
) =>
  useQuery({
    queryKey: rekonsiliasiKeys.list(params),
    queryFn: ({ signal }) => getRekonsiliasiList(params, signal),
    enabled,
    // Data halaman sebelumnya ditahan supaya tabel tidak berkedip kosong
    // saat pindah halaman atau ganti filter.
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

export const useSaveRekonsiliasiMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FormData) => saveRekonsiliasi(body),
    onSuccess: () => {
      toast.success("Success Edit Rekonsiliasi");
      queryClient.invalidateQueries({ queryKey: rekonsiliasiKeys.lists() });
    },
  });
};

export const useImportTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ImportTemplatePayload) =>
      importRekonsiliasiTemplate(payload),
    onSuccess: (_data, variables) => {
      toast.success(`${variables.file.name} file uploaded successfully`);
      queryClient.invalidateQueries({ queryKey: rekonsiliasiKeys.lists() });
    },
    onError: (_error, variables) => {
      toast.error(`${variables.file.name} file upload failed.`);
    },
  });
};

const triggerBlobDownload = (blob: Blob, fileName: string) => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

export const useDownloadTemplateMutation = () =>
  useMutation({
    mutationFn: (params: DownloadTemplateParams) =>
      downloadRekonsiliasiTemplate(params),
    onSuccess: (blob, variables) => {
      const isMttrqTemplate =
        variables.parameter.includes("mttrq major") ||
        variables.parameter.includes("mttrq minor");

      triggerBlobDownload(
        blob,
        isMttrqTemplate
          ? "template-rekonsiliasi-mttr.xlsx"
          : "template-rekonsiliasi-access.xlsx",
      );
    },
  });
