import type { AuthUserId } from "@/app/types/auth/auth.types";

export const authKeys = {
  all: ["auth"] as const,
  userDetail: (id?: AuthUserId) => [...authKeys.all, "user-detail", id] as const,
};
