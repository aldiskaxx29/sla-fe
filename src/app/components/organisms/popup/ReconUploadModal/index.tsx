import { useEffect, useState } from "react";
import { LuDownload, LuInfo } from "react-icons/lu";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import { Button, InlineAlert } from "@/app/components/atoms";

import FileDropzone from "@/app/components/molecules/FileDropzone";
import Modal from "@/app/components/molecules/Modal";

/** Template contoh supaya kolom Excel yang diunggah sesuai tabel backend. */
const downloadTemplate = () => {
  const rows = [
    {
      year: "2026",
      week: 1,
      site_id: "ABCD",
      progress: "CLOSED",
      rca: "Issue TSEL",
      rca2: "Power TSEL",
    },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Data");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    }),
    "template_recon_progress.xlsx",
  );
};

interface ReconUploadModalProps {
  open: boolean;
  isLoading?: boolean;
  message?: { type: "success" | "error"; text: string } | null;
  onUpload: (file: File) => void;
  onClose: () => void;
}

export function ReconUploadModal({
  open,
  isLoading = false,
  message,
  onUpload,
  onClose,
}: ReconUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) setFile(null);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} width={520} bodyClassName="p-6">
      <header className="mb-4 pr-8">
        <h2 className="text-base font-bold text-[#0f172a] sm:text-xl">
          Upload Recon Progress
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Unggah file Excel berisi progress RCA per site.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {message ? (
          <InlineAlert tone={message.type === "success" ? "info" : "danger"}>
            {message.text}
          </InlineAlert>
        ) : null}

        <FileDropzone
          file={file}
          onFileChange={setFile}
          accept=".xlsx,.xls"
          disabled={isLoading}
          resetKey={open}
        />

        <div className="flex items-start gap-2 rounded-xl bg-[#f8fafc] p-3 text-xs text-slate-500">
          <LuInfo size={16} className="mt-0.5 shrink-0" />
          <span>Pastikan baris pertama Excel berisi nama kolom tabel.</span>
        </div>

        <button
          type="button"
          onClick={downloadTemplate}
          className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-[#0ea5e9] px-3 py-1.5 text-xs font-semibold text-[#0369a1] hover:bg-[#f0f9ff]"
        >
          <LuDownload size={14} />
          Download Template
        </button>

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            variant="primary"
            loading={isLoading}
            disabled={!file}
            onClick={() => file && onUpload(file)}
          >
            Upload &amp; Insert
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ReconUploadModal;
