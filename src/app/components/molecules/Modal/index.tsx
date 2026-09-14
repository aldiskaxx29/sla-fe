import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { IconClose } from "@/app/components/atoms/icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  closable?: boolean;
  bodyClassName?: string;
  className?: string;
}

const Modal = ({
  open,
  onClose,
  children,
  width = 540,
  closable = true,
  bodyClassName = "",
  className = "",
}: ModalProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closable) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closable, onClose, open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/45"
        onClick={() => closable && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{ width, maxWidth: "100%" }}
        className={`relative z-10 max-h-[90vh] overflow-hidden rounded-[20px] bg-white shadow-xl ${className}`}
      >
        {closable ? (
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 text-gray-400 hover:text-gray-600"
          >
            <IconClose size={18} />
          </button>
        ) : null}
        <div className={`max-h-[90vh] overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
