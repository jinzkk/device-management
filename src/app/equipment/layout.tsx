import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function EquipmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 p-4 md:p-6 print:p-0">{children}</main>
      </div>
    </>
  );
}
