import React from "react";
import NavItem from "./NavItem";
import { StatusItem } from "../common";
import {
  Activity,
  Database,
  Shield,
  Settings,
  Heart,
  Bookmark,
} from "lucide-react";

interface FuturisticSidebarProps {
  activeView: "windows" | "sessions" | "settings" | "favourites" | "bookmarks";
  handleViewChange: (
    view: "windows" | "sessions" | "settings" | "favourites" | "bookmarks"
  ) => void;
  systemStatus: number;
  securityLevel: number;
  networkStatus: number;
}

const Sidebar: React.FC<FuturisticSidebarProps> = ({
  activeView,
  handleViewChange,
  systemStatus,
  securityLevel,
  networkStatus,
}) => {
  return (
    <div
      className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-2 flex flex-col h-full"
      data-component="Sidebar"
    >
      <nav className="space-y-1">
        <NavItem
          icon={Activity}
          label="Active Windows"
          active={activeView === "windows"}
          onClick={() => handleViewChange("windows")}
        />
        <NavItem
          icon={Heart}
          label="Favourites"
          active={activeView === "favourites"}
          onClick={() => handleViewChange("favourites")}
        />
        <NavItem
          icon={Bookmark}
          label="Bookmarks"
          active={activeView === "bookmarks"}
          onClick={() => handleViewChange("bookmarks")}
        />
        <NavItem
          icon={Database}
          label="Sessions"
          active={activeView === "sessions"}
          onClick={() => handleViewChange("sessions")}
        />
        <NavItem icon={Shield} label="Security" />
        <NavItem
          icon={Settings}
          label="Settings"
          active={activeView === "settings"}
          onClick={() => handleViewChange("settings")}
        />
      </nav>
      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <div className="text-xs text-slate-500 mb-2 font-mono">
          SYSTEM STATUS
        </div>
        <div className="space-y-2">
          <StatusItem label="Core Systems" value={systemStatus} color="cyan" />
          <StatusItem label="Security" value={securityLevel} color="green" />
          <StatusItem label="Network" value={networkStatus} color="blue" />
        </div>
      </div>

      {/* Gmoney branding footer - positioned at bottom with fixed distance from top */}
      <div className="mt-auto pt-4 border-t border-slate-700/50 flex flex-col items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Gmoney
        </div>
        <div className="text-xs text-slate-500 mt-1 flex items-center">
          <span className="mr-1">™</span> Labs
        </div>
      </div>
    </div>
  );
};

Sidebar.displayName = "Sidebar";

export default Sidebar;
