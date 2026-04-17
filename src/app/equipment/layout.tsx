import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function EquipmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </>
  );
}
