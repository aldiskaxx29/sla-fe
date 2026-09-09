/** Nilai kosong dan sisa data lama berupa string "undefined"/"null" ditampilkan "-". */
export const formatTableValue = (value: unknown): string | number => {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized === "undefined" || normalized === "null") {
      return "-";
    }
  }

  return typeof value === "number" ? value : String(value);
};

/**
 * Membangun daftar pilihan filter dari `options` BE. Tanpa options berarti
 * daftarnya kosong — tidak ada daftar bawaan. Nilai yang hanya beda
 * kapitalisasi digabung jadi satu entri.
 */
export const buildFilterOptions = (options?: string[]): string[] => {
  const seen = new Set<string>();

  return (options ?? [])
    .map((item) => String(item ?? "").trim())
    .filter((item) => {
      if (!item || item.toLowerCase() === "undefined") return false;

      const key = item.toLowerCase();
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
};

const parseTimeToMinutes = (time: string) => {
  const [hours = 0, minutes = 0, seconds = 0] = String(time)
    .split(":")
    .map(Number);

  return (hours || 0) * 60 + (minutes || 0) + Math.floor((seconds || 0) / 60);
};

/** TTR final = TTR awal dikurangi selisihnya, dalam format HH:mm. */
export const calculateTtrFinal = (
  ttrAwal: unknown,
  ttrSelisih: unknown,
): string => {
  const isEmpty = (value: unknown) =>
    value === null || value === undefined || value === "";

  if (isEmpty(ttrAwal) || isEmpty(ttrSelisih)) return "-";

  const finalMinutes =
    parseTimeToMinutes(String(ttrAwal)) - parseTimeToMinutes(String(ttrSelisih));

  if (finalMinutes < 0) return "00:00";

  const hours = Math.floor(finalMinutes / 60);
  const minutes = finalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const snakeToTitleCase = (value: string) =>
  String(value ?? "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
