import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type SearchParamValue = string | number | null | undefined;

export const readPositiveInt = (value: string | null, fallback: number) => {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : fallback;
};

export const useUrlSearchState = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const setParams = useCallback(
    (patch: Record<string, SearchParamValue>) => {
      const next = new URLSearchParams(window.location.search);

      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      const search = next.toString();
      if (search === new URLSearchParams(window.location.search).toString()) {
        return;
      }

      navigate({ search: search ? `?${search}` : "" }, { replace: true });
    },
    [navigate],
  );

  return { searchParams, setParams };
};

interface UseUrlPaginationOptions {
  defaultPerPage: number;
  pageKey?: string;
  perPageKey?: string;
}

export const useUrlPagination = ({
  defaultPerPage,
  pageKey = "page",
  perPageKey = "per_page",
}: UseUrlPaginationOptions) => {
  const { searchParams, setParams } = useUrlSearchState();

  const page = readPositiveInt(searchParams.get(pageKey), 1);
  const perPage = readPositiveInt(searchParams.get(perPageKey), defaultPerPage);

  const setPagination = useCallback(
    (nextPage: number, nextPerPage: number) =>
      setParams({
        [pageKey]: nextPage > 1 ? nextPage : null,
        [perPageKey]: nextPerPage !== defaultPerPage ? nextPerPage : null,
      }),
    [defaultPerPage, pageKey, perPageKey, setParams],
  );

  const resetPage = useCallback(
    () => setParams({ [pageKey]: null }),
    [pageKey, setParams],
  );

  return useMemo(
    () => ({ page, perPage, setPagination, resetPage }),
    [page, perPage, setPagination, resetPage],
  );
};
