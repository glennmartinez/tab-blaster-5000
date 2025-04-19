import React, { ReactNode } from "react";
 
interface MainLayoutProps {
  children: ReactNode;
  activeView?: "dashboard" | "tabs" | "sessions" | "settings";
}

/**
 * Main layout component that wraps all pages
 * Provides the sidebar and main content area
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex w-full h-full min-h-screen bg-slate-950 text-white">
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="container mx-auto">
          <div className="grid grid-cols-12 gap-4">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
