import type { Metadata } from "next";
import { NotFoundPage } from "@/components/world/NotFoundPage";

export const metadata: Metadata = {
  title: "Page not found | Angelo Mouawad",
  description: "This page does not exist. Head back to the room or open one of the other pages.",
};

export default function NotFound() {
  return <NotFoundPage />;
}
