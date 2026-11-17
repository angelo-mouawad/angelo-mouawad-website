import type { Metadata } from "next";
import { WebsitesPage } from "@/components/world/websites/WebsitesPage";

export const metadata: Metadata = {
  title: "Websites | Angelo Mouawad",
  description: "Custom websites for individuals and companies, designed and built by Angelo Mouawad. See live client work and start a project.",
};

export default function Page() {
  return <WebsitesPage />;
}
