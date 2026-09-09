// React
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";

const GAP = 4;

interface PopoverProps {
  open: boolean;
  /** Elemen pemicu; posisi panel dihitung dari kotaknya. */
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
  /** "start" sejajar kiri pemicu, "end" sejajar kanannya. */
  align?: "start" | "end";
  /** Lebar panel mengikuti lebar pemicu. */
  matchAnchorWidth?: boolean;
  minWidth?: number;
  className?: string;
}

/**
 * Panel mengapung yang dirender ke `body` lewat portal, supaya tidak terpotong
 * oleh induk yang punya `overflow` (toolbar filter dan tabel keduanya
 * memakai overflow-x-auto).
 */
const Popover = ({
  open,
  anchorRef,
  onClose,
  children,
  align = "start",
  matchAnchorWidth = false,
  minWidth = 180,
  className = "",
}: PopoverProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const panelHeight = panelRef.current?.offsetHeight ?? 0;
      const panelWidth = panelRef.current?.offsetWidth ?? rect.width;

      // Dibalik ke atas kalau ruang di bawah tidak cukup.
      const openUpward =
        rect.bottom + GAP + panelHeight > window.innerHeight &&
        rect.top - GAP - panelHeight > 0;

      const left =
        align === "end" ? rect.right - panelWidth : rect.left;

      setPosition({
        top: openUpward
          ? rect.top - panelHeight - GAP
          : rect.bottom + GAP,
        left: Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8)),
        width: matchAnchorWidth ? rect.width : 0,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    // `true` supaya ikut terpicu oleh scroll kontainer, bukan hanya window.
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, anchorRef, matchAnchorWidth, open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      // Klik pada pemicu diurus oleh pemicunya sendiri (toggle).
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }

      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [anchorRef, onClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width || undefined,
        minWidth,
      }}
      className={`z-[1300] rounded-lg border border-[#E5E7EB] bg-white shadow-lg ${className}`}
    >
      {children}
    </div>,
    document.body,
  );
};

export default Popover;
