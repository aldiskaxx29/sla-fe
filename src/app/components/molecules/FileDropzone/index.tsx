import { useEffect, useRef, useState } from "react";

import {
  Button,
  IconFileSheet,
  IconInbox,
  IconTrash,
} from "@/app/components/atoms";

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

interface FileDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  accept?: string;
  resetKey?: unknown;
}

const FileDropzone = ({
  file,
  onFileChange,
  disabled = false,
  accept = ".xlsx,.xls,.csv",
  resetKey,
}: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = "";
    onFileChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const clearFile = () => {
    if (inputRef.current) inputRef.current.value = "";
    onFileChange(null);
  };

  const pickFile = (nextFile?: File | null) => {
    if (!nextFile) return;
    onFileChange(nextFile);
  };

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <IconFileSheet size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-xs font-semibold text-gray-800"
              title={file.name}
            >
              {file.name}
            </p>
            <p className="text-[11px] text-gray-500">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="danger"
          disabled={disabled}
          onClick={clearFile}
          icon={<IconTrash size={14} />}
          title="Hapus file"
        >
          Hapus
        </Button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        pickFile(event.dataTransfer.files?.[0]);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={[
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-gray-50 py-6 transition-colors",
        isDragging ? "border-teal-500 bg-teal-50" : "border-gray-300",
        disabled ? "cursor-not-allowed opacity-60" : "hover:border-teal-500",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => pickFile(event.target.files?.[0])}
      />
      <span className="mb-2 text-teal-600">
        <IconInbox size={36} />
      </span>
      <p className="text-xs font-medium text-gray-700">
        Klik atau seret file Excel ke area ini
      </p>
      <p className="mt-1 text-[11px] text-gray-400">
        Mendukung format .xlsx, .xls, .csv
      </p>
    </div>
  );
};

export default FileDropzone;
