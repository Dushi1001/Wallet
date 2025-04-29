import { ReactNode } from "react";
import Sidebar from "./sidebar";
import MobileHeader from "./mobile-header";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 relative">
        <div className="h-full overflow-y-auto px-4 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
