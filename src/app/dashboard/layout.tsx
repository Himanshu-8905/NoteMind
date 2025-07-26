import DashboardSidebar from "@/components/DashboardSidebar";
import Header from "@/components/Header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <SidebarProvider suppressHydrationWarning>
        <DashboardSidebar />
        <main className="flex-1 bg-white dark:bg-[#020427] flex flex-col min-w-0">
          <SidebarTrigger suppressHydrationWarning />
          <main className="flex-1 py-10 px-10">{children}</main>
        </main>
      </SidebarProvider>
    </>
  );
}
