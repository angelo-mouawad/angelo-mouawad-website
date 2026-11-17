import type { Metadata } from "next";
import { ThemeShowcase } from "./ThemeShowcase";

export const metadata: Metadata = {
  title: "Design system | Angelo Mouawad",
  robots: { index: false },
};

export default function ThemePage() {
  return <ThemeShowcase />;
}
