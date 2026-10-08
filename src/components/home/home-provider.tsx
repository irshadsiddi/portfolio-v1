"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useHome } from "@/hooks/use-home";

const HomeContext = createContext<ReturnType<typeof useHome> | null>(null);

export function HomeProvider({ children }: { children: ReactNode }) {
  const value = useHome();
  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export function useHomeContext() {
  const context = useContext(HomeContext);
  if (!context) throw new Error("Homepage interactions require HomeProvider");
  return context;
}
