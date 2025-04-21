import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Database,
  Shield,
  LayoutGrid,
  Sliders,
  ChevronLeft,
} from "lucide-react";
import StorageSettings from "../../components/StorageSettings";
import ParticleBackground from "../../components/ParticleBackground";
import { StorageProvider } from "../../services/StorageService";

interface SettingsViewProps {
  onBack?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<string>("storage");

  // Handle back button click
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Back button clicked", onBack);
    if (onBack) {
      onBack();
    }
  };

  // Handle storage provider change
  const handleStorageChange = (provider: StorageProvider) => {
    console.log(`Storage provider changed to: ${provider}`);
    // Could add additional logic here if needed when storage changes
  };

  // Sections for the settings menu
  const settingsSections = [
    { id: "storage", label: "Storage", icon: Database },
    { id: "appearance", label: "Appearance", icon: LayoutGrid },
    { id: "preferences", label: "Preferences", icon: Sliders },
    { id: "security", label: "Security", icon: Shield },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case "storage":
        return <StorageSettings onStorageChange={handleStorageChange} />;
      case "appearance":
        return (
          <div className="p-4 bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Appearance Settings
            </h3>
            <p className="text-slate-300">
              Theme and UI customization options will be available soon.
            </p>
            <div className="mt-4 p-3 bg-slate-800/50 rounded border border-slate-700/50">
              <div className="flex items-center space-x-4 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600"></div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-500 to-red-600"></div>
              </div>
              <p className="text-xs text-slate-400">
                Theme options coming in a future update
              </p>
            </div>
          </div>
        );
      case "preferences":
        return (
          <div className="p-4 bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              User Preferences
            </h3>
            <p className="text-slate-300">
              Customize how the application behaves.
            </p>
            <div className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700/50">
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      Auto-save tabs
                    </h4>
                    <p className="text-xs text-slate-400">
                      Automatically save tabs when closed
                    </p>
                  </div>
                  <div className="h-6 w-12 bg-slate-700 rounded-full relative cursor-not-allowed">
                    <div className="absolute inset-y-1 left-1 h-4 w-4 bg-slate-400 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700/50">
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      Window grouping
                    </h4>
                    <p className="text-xs text-slate-400">
                      Group tabs by windows
                    </p>
                  </div>
                  <div className="h-6 w-12 bg-cyan-900/50 rounded-full relative cursor-not-allowed">
                    <div className="absolute inset-y-1 right-1 h-4 w-4 bg-cyan-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "security":
        return (
          <div className="p-4 bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Security Settings
            </h3>
            <p className="text-slate-300">Manage security preferences.</p>
            <div className="mt-4 p-3 bg-slate-800/50 rounded border border-slate-700/50">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-white">
                  Security Status: Protected
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Advanced security settings will be available in future updates.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-hidden bg-gradient-to-br from-black to-slate-900 text-slate-100 relative min-h-screen w-full">
      {/* Background particle effect */}
      <ParticleBackground />

      <div className="container mx-auto p-4 relative z-10 h-full">
        <div className="flex items-center justify-between mb-6 mt-2">
          <div className="flex items-center">
            <SettingsIcon className="h-6 w-6 text-cyan-500 mr-2" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>

          {/* Back to dashboard button */}
          <button
            onClick={handleBackClick}
            className="flex items-center px-3 py-1.5 bg-slate-800/70 hover:bg-slate-700/70 text-cyan-400 rounded-md text-sm transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Settings navigation sidebar */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-2">
              <nav className="space-y-1">
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                        isActive
                          ? "bg-slate-800/70 text-cyan-400"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/30"
                      }`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings content area */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
