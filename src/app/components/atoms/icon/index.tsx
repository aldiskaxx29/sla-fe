/**
 * Satu pintu untuk semua ikon, memakai react-icons (set Feather).
 * Pemanggil memakai nama netral seperti `IconSearch`, sehingga set ikonnya
 * bisa diganti di berkas ini saja tanpa menyentuh komponen lain.
 */

// React Icons
import {
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiFileText,
  FiFilter,
  FiInbox,
  FiInfo,
  FiLoader,
  FiSearch,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import type { IconBaseProps } from "react-icons";

export type IconProps = IconBaseProps;

export const IconSearch = FiSearch;
export const IconFilter = FiFilter;
export const IconEdit = FiEdit2;
export const IconClose = FiX;
export const IconChevronDown = FiChevronDown;
export const IconChevronLeft = FiChevronLeft;
export const IconChevronRight = FiChevronRight;
export const IconCheck = FiCheck;
export const IconUpload = FiUploadCloud;
export const IconInbox = FiInbox;
export const IconTrash = FiTrash2;
export const IconFileSheet = FiFileText;
export const IconInfo = FiInfo;

/** Ikon muat dengan animasi putar sudah menyatu. */
export const IconSpinner = ({ className = "", ...props }: IconProps) => (
  <FiLoader className={`animate-spin ${className}`} {...props} />
);
