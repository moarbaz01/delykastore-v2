import AluuPackagesClient from "@/components/Dashboard/AluuPackages";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ALUU Packages Viewer",
};

export default function AluuPackagesPage() {
  return <AluuPackagesClient />;
}
