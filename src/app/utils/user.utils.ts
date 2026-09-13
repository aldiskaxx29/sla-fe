/** Data user hasil login disimpan di localStorage oleh modul auth. */
export const getStoredUser = (): Record<string, unknown> | null => {
  try {
    return JSON.parse(localStorage.getItem("user_data") ?? "null");
  } catch {
    return null;
  }
};

export const getStoredUserName = () => {
  const user = getStoredUser();

  return String(user?.name ?? user?.nama ?? user?.nik ?? "username");
};

/** "Yoga Febriatala" -> "YF"; dipakai sebagai avatar teks. */
export const toInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "US";
