import React, { useState, useEffect } from "react";
import { Modal, Button, Image, Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import {
  FileExcelOutlined,
  InboxOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import xlxsIcon from "@/assets/file-spreadsheet.svg";
import dayjs from "dayjs";

interface ModalConfirmImportProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<void> | void;
  isLoading?: boolean;
  parameter?: string;
  month?: string;
  week?: string;
  year?: string | number;
  prev?: string;
  exclude?: string;
  evidence?: string;
  isMttrqParameter?: boolean;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getParameterLabel = (param?: string): string => {
  switch (param) {
    case "packetloss ran to core":
      return "Packetloss";
    case "jitter ran to core":
      return "Jitter";
    case "latency ran to core":
      return "Latency";
    case "mttrq critical":
      return "MTTRQ Critical";
    case "mttrq major":
      return "MTTRQ Major";
    case "mttrq minor":
      return "MTTRQ Minor";
    default:
      return param ?? "-";
  }
};

const getExcludeLabel = (exc?: string): string => {
  if (exc === "2") return "Exclude";
  if (exc === "1") return "Non Exclude";
  return "All";
};

const getEvidenceLabel = (evi?: string): string => {
  if (evi === "with") return "Sudah Ada Evidence";
  if (evi === "without") return "Belum Ada Evidence";
  return "All";
};

export const ModalConfirmImport: React.FC<ModalConfirmImportProps> = ({
  open,
  onCancel,
  onConfirm,
  isLoading = false,
  parameter = "",
  month = "",
  week = "",
  year = "",
  prev = "",
  exclude = "",
  evidence = "",
  isMttrqParameter = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setFileList([]);
    }
  }, [open]);

  const monthName = month
    ? dayjs().month(Number(month) - 1).format("MMMM")
    : "-";
  const parameterLabel = getParameterLabel(parameter);
  const excludeLabel = getExcludeLabel(exclude);
  const evidenceLabel = getEvidenceLabel(evidence);
  const prevLabel =
    prev === "preventive"
      ? "Preventive"
      : prev === "corrective"
      ? "Corrective"
      : prev || "-";

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept: ".xlsx, .xls, .csv",
    fileList,
    beforeUpload: (file) => {
      setSelectedFile(file);
      setFileList([
        {
          uid: file.name + Date.now(),
          name: file.name,
          status: "done",
          size: file.size,
        },
      ]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setSelectedFile(null);
      setFileList([]);
    },
  };

  const handleImport = () => {
    if (selectedFile) {
      onConfirm(selectedFile);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={isLoading ? undefined : onCancel}
      footer={null}
      centered
      width={540}
      destroyOnClose
      maskClosable={!isLoading}
      styles={{
        content: {
          borderRadius: 20,
          padding: "24px 28px",
        },
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-11 h-11 rounded-full bg-[#EDFFFD] flex items-center justify-center shrink-0">
            <Image src={xlxsIcon} alt="Excel Icon" width={22} preview={false} />
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

        {/* Target Parameters Info */}
        <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0] flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <InfoCircleOutlined className="text-brand-secondary text-sm" />
            <span>Target Parameter & Periode:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-gray-100">
            <div>
              <span className="text-gray-400 block text-[11px]">Parameter</span>
              <span className="font-semibold text-gray-800">
                {parameterLabel}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Periode</span>
              <span className="font-semibold text-gray-800">
                {monthName} {year}{" "}
                {!isMttrqParameter && week ? `(Week ${week})` : ""}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Site Type</span>
              <span className="font-semibold text-gray-800">{prevLabel}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">
                Exclude / Evidence
              </span>
              <span className="font-semibold text-gray-800">
                {excludeLabel} / {evidenceLabel}
              </span>
            </div>
          </div>
        </div>

        {/* File Upload Zone */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            Pilih File Excel <span className="text-red-500">*</span>
          </label>
          {!selectedFile ? (
            <Upload.Dragger
              {...uploadProps}
              className="!border-dashed !border-2 !border-gray-300 hover:!border-teal-500 !bg-gray-50 !rounded-xl transition-all !py-4"
            >
              <p className="ant-upload-drag-icon !mb-2 flex justify-center text-teal-600">
                <InboxOutlined style={{ fontSize: 36 }} />
              </p>
              <p className="text-xs font-medium text-gray-700">
                Klik atau seret file Excel ke area ini
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Mendukung format .xlsx, .xls, .csv
              </p>
            </Upload.Dragger>
          ) : (
            <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <FileExcelOutlined className="text-emerald-700 text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="font-semibold text-gray-800 text-xs truncate"
                    title={selectedFile.name}
                  >
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setSelectedFile(null);
                  setFileList([]);
                }}
                disabled={isLoading}
                className="!text-xs shrink-0"
                title="Hapus file"
              >
                Hapus
              </Button>
            </div>
          )}
        </div>

        {/* Notice */}
        <p className="text-[11px] text-gray-400 italic">
          * Pastikan data di dalam template Excel sudah sesuai sebelum melakukan import.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-1">
          <Button
            onClick={onCancel}
            disabled={isLoading}
            className="!h-10 !px-5 !rounded-lg"
          >
            Batal
          </Button>
          <Button
            type="primary"
            onClick={handleImport}
            disabled={!selectedFile}
            loading={isLoading}
            className="!h-10 !px-6 !rounded-lg !bg-brand-primary font-medium"
          >
            {isLoading ? "Mengimpor..." : "Import Sekarang"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalConfirmImport;
