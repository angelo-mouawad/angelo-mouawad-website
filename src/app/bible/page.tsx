import type { Metadata } from "next";
import { BiblePage } from "@/components/world/bible/BiblePage";

export const metadata: Metadata = {
  title: "Bible | Angelo Mouawad",
  description: "Read and study the King James Bible with reading plans, highlights, notes and progress tracking. Everything is saved in your own browser.",
};

export default function Page() {
  return <BiblePage />;
}
