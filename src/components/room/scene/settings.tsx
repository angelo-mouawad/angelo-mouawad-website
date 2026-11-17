"use client";

import { createContext, useContext } from "react";
import type { Quality } from "@/lib/device";

export interface Settings {
  quality: Quality;
  reducedMotion: boolean;
}

const SettingsContext = createContext<Settings | null>(null);

export const SettingsProvider = SettingsContext.Provider;

export function useSettings() {
  const settings = useContext(SettingsContext);
  if (!settings) throw new Error("useSettings must be used inside the room canvas");
  return settings;
}
