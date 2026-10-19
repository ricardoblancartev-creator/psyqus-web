import type { ReactNode } from "react";
import PsyqusNavigation from "@/components/PsyqusNavigation";

export default function BienestarLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="bg-[#020617] pb-28">
      {children}
      <PsyqusNavigation />
    </div>
  );
}
