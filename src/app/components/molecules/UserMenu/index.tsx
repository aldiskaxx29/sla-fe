// React
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuChevronDown, LuLogOut, LuUser } from "react-icons/lu";
import { toast } from "react-toastify";

// Auth
import { useLogoutMutation } from "@/modules/auth/rtk/auth.rtk";

// Utils
import { getStoredUserName, toInitials } from "@/app/utils/user.utils";

/** Avatar + nama user dengan menu profil dan logout. */
export function UserMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [logout] = useLogoutMutation();

  const name = getStoredUserName();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout().unwrap();
      toast.dismiss();
      toast.success("Logout successful", { position: "top-right" });
      navigate("/login");
    } catch {
      toast.dismiss();
      toast.error("Logout gagal. Coba lagi.", { position: "top-right" });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 transition-colors hover:bg-slate-50"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#007BFF] text-[11px] font-extrabold text-white">
          {toInitials(name)}
        </span>
        <span className="max-w-32 truncate text-[13px] font-semibold text-navy">
          {name}
        </span>
        <LuChevronDown
          size={13}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <LuUser size={14} />
            Profile
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={loading}
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LuLogOut size={14} />
            {loading ? "Keluar..." : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
}
