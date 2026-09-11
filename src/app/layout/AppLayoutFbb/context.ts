// React
import { createContext, useContext, useEffect, type ReactNode } from "react";

interface FbbShellContextValue {
  /** Keterangan kecil di samping judul header, mis. periode data. */
  setBadge: (badge: ReactNode) => void;
}

export const FbbShellContext = createContext<FbbShellContextValue | null>(null);

/**
 * Dipakai halaman FBB untuk menaruh keterangan periode di header shell.
 * Badge dibersihkan otomatis saat halaman ditinggalkan.
 */
export const useFbbHeaderBadge = (badge: ReactNode) => {
  const shell = useContext(FbbShellContext);
  const setBadge = shell?.setBadge;

  useEffect(() => {
    if (!setBadge) return;

    setBadge(badge);
    return () => setBadge(null);
  }, [setBadge, badge]);
};
