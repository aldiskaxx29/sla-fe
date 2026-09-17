import { toBlob } from "html-to-image";

/**
 * Tangkapan layar halaman dipakai untuk laporan harian, jadi dirender ulang
 * pada ukuran penuh (`data-export-mode`) supaya tabel tidak terpotong.
 */
export const exportNodeAsImage = async (
  node: HTMLElement,
  fileName: string,
): Promise<boolean> => {
  node.setAttribute("data-export-mode", "true");

  try {
    const width = node.scrollWidth;
    const height = node.scrollHeight;

    const blob = await toBlob(node, {
      cacheBust: true,
      backgroundColor: "#f8fafc",
      pixelRatio: 6,
      width,
      height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: "none",
        overflow: "visible",
      },
    });

    if (!blob) return false;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    return true;
  } finally {
    node.removeAttribute("data-export-mode");
  }
};
