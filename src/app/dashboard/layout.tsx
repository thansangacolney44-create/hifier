import { AppSidebar } from "@/components/layout/sidebar";
import { MediaPlayer } from "@/components/layout/media-player";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex h-full flex-col">
        <SidebarInset>
            <main className="flex-1 p-6 pb-28">
                {children}
            </main>
        </SidebarInset>
      </div>
      <MediaPlayer />
    </SidebarProvider>
  );
}
