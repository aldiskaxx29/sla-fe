// React
import { useEffect, useState } from "react";

// Dayjs
import dayjs from "dayjs";

// Assets
import xlxsIcon from "@/assets/file-spreadsheet.svg";

// Atoms
import { Button, IconInfo } from "@/app/components/atoms";

// Molecules
import FileDropzone from "@/app/components/molecules/FileDropzone";
import Modal from "@/app/components/molecules/Modal";

// Config
import {
  EVIDENCE_OPTIONS,
  EXCLUDE_OPTIONS,
  PARAMETER_OPTIONS,
  SITE_TYPE_OPTIONS,
} from "@/app/config/rekonsiliasi.config";

const getLabel = (
  options: { label: string; value: string }[],
  value?: string,
) => options.find((option) => option.value === value)?.label ?? value ?? "-";

interface ImportTemplateModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void;
  isLoading?: boolean;
  parameter: string;
  month: string;
  week?: string;
  year: string;
  prev: string;
  exclude: string;
  evidence: string;
  isMttrqParameter?: boolean;
}

/** Konfirmasi periode tujuan sebelum file Excel diunggah. */
const ImportTemplateModal = ({
  open,
  onCancel,
  onConfirm,
  isLoading = false,
  parameter,
  month,
  week,
  year,
  prev,
  exclude,
  evidence,
  isMttrqParameter = false,
}: ImportTemplateModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) setSelectedFile(null);
  }, [open]);

  const monthName = month
    ? dayjs()
        .month(Number(month) - 1)
        .format("MMMM")
    : "-";

  const infoItems = [
    { label: "Parameter", value: getLabel(PARAMETER_OPTIONS, parameter) },
    {
      label: "Periode",
      value: `${monthName} ${year} ${!isMttrqParameter && week ? `(Week ${week})` : ""}`,
    },
    { label: "Site Type", value: getLabel(SITE_TYPE_OPTIONS, prev) },
    {
      label: "Exclude / Evidence",
      value: `${getLabel(EXCLUDE_OPTIONS, exclude)} / ${getLabel(EVIDENCE_OPTIONS, evidence)}`,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onCancel}
      closable={!isLoading}
      width={540}
      bodyClassName="px-7 py-6"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-11 h-11 rounded-full bg-[#EDFFFD] flex items-center justify-center shrink-0">
            <img src={xlxsIcon} alt="Excel" width={22} height={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0E2133] leading-snug">
              Import Excel Rekonsiliasi
            </h3>
            <p className="text-xs text-gray-500">
              Konfirmasi dan unggah file Excel untuk memperbarui data
            </p>
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0] flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <IconInfo size={14} className="text-brand-secondary" />
            <span>Target Parameter &amp; Periode:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-gray-100">
            {infoItems.map((item) => (
              <div key={item.label}>
                <span className="text-gray-400 block text-[11px]">
                  {item.label}
                </span>
                <span className="font-semibold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            Pilih File Excel <span className="text-red-500">*</span>
          </label>
          <FileDropzone
            file={selectedFile}
            onFileChange={setSelectedFile}
            disabled={isLoading}
            resetKey={open}
          />
        </div>

        <p className="text-[11px] text-gray-400 italic">
          * Pastikan data di dalam template Excel sudah sesuai sebelum melakukan
          import.
        </p>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-1">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={() => selectedFile && onConfirm(selectedFile)}
            disabled={!selectedFile}
            loading={isLoading}
          >
            {isLoading ? "Mengimpor..." : "Import Sekarang"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportTemplateModal;
