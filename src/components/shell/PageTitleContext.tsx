"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { pageTitleFromPath } from "@/config/nav";

const PageTitleContext = createContext<{
  title: string;
  setTitle: (title: string | null) => void;
}>({
  title: "Thanodi",
  setTitle: () => {},
});

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const fallback = pageTitleFromPath(pathname);
  const [override, setOverride] = useState<{ path: string; title: string } | null>(null);

  const setTitle = useCallback((title: string | null) => {
    setOverride((prev) => {
      if (!title) {
        return prev?.path === pathname ? null : prev;
      }
      if (prev?.path === pathname && prev.title === title) return prev;
      return { path: pathname, title };
    });
  }, [pathname]);

  const value = useMemo(
    () => ({
      title: override?.path === pathname ? override.title : fallback,
      setTitle,
    }),
    [fallback, override, pathname, setTitle],
  );

  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>;
}

export function usePageTitle() {
  return useContext(PageTitleContext);
}
