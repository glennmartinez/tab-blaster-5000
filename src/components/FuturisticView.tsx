import React, { useEffect, useState, useRef } from "react";
import { Tab, WindowInfo, SavedTab } from "../interfaces/TabInterface";
import {
  Activity,
  BarChart3,
  Command,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Hexagon,
  LineChart,
  Moon,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sun,
  Wifi,
  Bookmark,
  Clock,
  ExternalLink,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import { ViewType } from "../interfaces/ViewTypes";
import { useSessions } from "../hooks/useSessions";
import { SessionSummary } from "../models/Session";

// Interface for the component props
interface FuturisticViewProps {
  windowGroups?: WindowInfo[];
  savedTabs?: SavedTab[];
  onSwitchTab?: (tabId: number) => Promise<void>;
  onCloseTab?: (tabId: number) => Promise<void>;
  onRestoreTab?: (savedTab: SavedTab) => Promise<void>;
  onRemoveSavedTab?: (savedTab: SavedTab) => Promise<void>;
}

// For particles in the background
class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.color = `rgba(${Math.floor(Math.random() * 100) + 100}, ${
      Math.floor(Math.random() * 100) + 150
    }, ${Math.floor(Math.random() * 55) + 200}, ${Math.random() * 0.5 + 0.2})`;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > this.canvas.width) this.x = 0;
    if (this.x < 0) this.x = this.canvas.width;
    if (this.y > this.canvas.height) this.y = 0;
    if (this.y < 0) this.y = this.canvas.height;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

const FuturisticView: React.FC<FuturisticViewProps> = ({
  windowGroups = [],
  onSwitchTab,
  onCloseTab,
}) => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [systemStatus, setSystemStatus] = useState(85);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [memoryUsage, setMemoryUsage] = useState(68);
  const [networkStatus, setNetworkStatus] = useState(92);
  const [securityLevel] = useState(75);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [activeWindowGroups, setActiveWindowGroups] = useState<WindowInfo[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use our sessions hook for managing saved sessions
  const {
    sessionSummaries,
    loading: sessionsLoading,
    fetchSessionSummaries,
    deleteSession,
    restoreSession,
    createSession,
  } = useSessions();

  // Fetch sessions when component mounts
  useEffect(() => {
    fetchSessionSummaries();
  }, [fetchSessionSummaries]);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setActiveWindowGroups(windowGroups);
    }, 2000);

    return () => clearTimeout(timer);
  }, [windowGroups]);

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate changing data for system metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 30) + 30);
      setMemoryUsage(Math.floor(Math.random() * 20) + 60);
      setNetworkStatus(Math.floor(Math.random() * 15) + 80);
      setSystemStatus(Math.floor(Math.random() * 10) + 80);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Particle[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(ctx, canvas));
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        particle.update();
        particle.draw();
      }

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Open a tab using the onSwitchTab function if provided, otherwise default to window.open
  const openTab = (tab: Tab) => {
    if (onSwitchTab && tab.id) {
      onSwitchTab(tab.id);
    } else {
      window.open(tab.url, "_blank");
    }
  };

  // Delete a tab using the onCloseTab function if provided
  const deleteTab = (tab: Tab) => {
    if (onCloseTab && tab.id) {
      onCloseTab(tab.id);
    }
  };

  // Save the current window as a session
  const saveWindowAsSession = async (windowId: number, name?: string) => {
    const windowToSave = activeWindowGroups.find(
      (window) => window.id === windowId
    );
    if (!windowToSave) return;

    try {
      const sessionName =
        name || `Window ${windowId} - ${new Date().toLocaleTimeString()}`;
      await createSession(sessionName);
      // Refresh sessions list
      fetchSessionSummaries();
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  // Handle restoring a session
  const handleRestoreSession = async (sessionId: string) => {
    try {
      await restoreSession(sessionId, false);
    } catch (error) {
      console.error("Error restoring session:", error);
    }
  };

  // Handle deleting a session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  // Group sessions by date
  const groupSessionsByDate = () => {
    const grouped: { [date: string]: SessionSummary[] } = {};

    sessionSummaries.forEach((session) => {
      const date = new Date(session.createdAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });

    return grouped;
  };

  // Filter tabs based on search query
  const filteredWindowGroups = searchQuery
    ? activeWindowGroups
        .map((window) => ({
          ...window,
          tabs: window.tabs.filter(
            (tab) =>
              tab.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              false ||
              tab.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              false
          ),
        }))
        .filter((window) => window.tabs.length > 0)
    : activeWindowGroups;

  return (
    <div
      className={`${theme} flex-1 overflow-hidden bg-gradient-to-br from-black to-slate-900 text-slate-100 relative min-h-screen w-full`}
    >
      {/* Background particle effect */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-6 border-4 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-8 border-4 border-l-green-500 border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-cyan-500 font-mono text-sm tracking-wider">
              SYSTEM INITIALIZING
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10 h-full flex flex-col min-h-screen">
        {/* Top control bar */}
        <div className="flex items-center justify-between py-2 border-b border-slate-700/50 mb-4">
          <div className="flex items-center space-x-2">
            <Hexagon className="h-6 w-6 text-cyan-500" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Tab Dashboard
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tabs..."
                className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="text-cyan-500 font-mono text-sm">
              {formatTime(currentTime)}
            </div>

            <button
              className="p-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-slate-100"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden h-[calc(100vh-100px)]">
          {/* Left sidebar */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2 flex flex-col h-full">
            <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-2 flex flex-col h-full">
              <nav className="space-y-1">
                <NavItem icon={Command} label="Dashboard" active />
                <NavItem icon={Activity} label="Tabs" />
                <NavItem icon={Database} label="Sessions" />
                <NavItem icon={Shield} label="Security" />
                <NavItem icon={Settings} label="Settings" />
              </nav>
              <div className="mt-4 pt-3 border-t border-slate-700/50">
                <div className="text-xs text-slate-500 mb-2 font-mono">
                  SYSTEM STATUS
                </div>
                <div className="space-y-2">
                  <StatusItem
                    label="Core Systems"
                    value={systemStatus}
                    color="cyan"
                  />
                  <StatusItem
                    label="Security"
                    value={securityLevel}
                    color="green"
                  />
                  <StatusItem
                    label="Network"
                    value={networkStatus}
                    color="blue"
                  />
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
          </div>

          {/* Main dashboard */}
          <div className="col-span-12 md:col-span-9 lg:col-span-7 h-full flex flex-col overflow-hidden">
            {/* System overview */}
            <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col h-full">
              <div className="border-b border-slate-700/50 p-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-slate-100 flex items-center font-medium">
                    <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                    Active Windows
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-800/50 text-cyan-400 border border-cyan-500/50 text-xs px-2 py-0.5 rounded-full flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 mr-1 animate-pulse"></div>
                      LIVE
                    </span>
                    <button className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/50">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 overflow-y-auto flex-grow max-h-[calc(100vh-220px)] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <MetricCard
                    title="CPU Usage"
                    value={cpuUsage}
                    icon={Cpu}
                    trend="up"
                    color="cyan"
                    detail="System Performance"
                  />
                  <MetricCard
                    title="Memory"
                    value={memoryUsage}
                    icon={HardDrive}
                    trend="stable"
                    color="purple"
                    detail="RAM Usage"
                  />
                  <MetricCard
                    title="Network"
                    value={networkStatus}
                    icon={Wifi}
                    trend="down"
                    color="blue"
                    detail="Connectivity"
                  />
                </div>

                <div className="space-y-4 pb-4">
                  {filteredWindowGroups.map((window) => (
                    <div
                      key={window.id}
                      className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-sm p-3 border-b border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              window.focused ? "bg-cyan-500" : "bg-slate-500"
                            } mr-2`}
                          ></div>
                          <span className="text-sm font-medium text-slate-300">
                            Window {window.id}
                          </span>
                          <span className="ml-2 bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs px-2 py-0.5 rounded-full">
                            {window.tabs.length} tabs
                          </span>
                        </div>
                        <button
                          className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-2 py-1 rounded"
                          onClick={() => saveWindowAsSession(window.id)}
                        >
                          <Plus className="h-3 w-3 inline mr-1" /> Save Session
                        </button>
                      </div>

                      <div className="divide-y divide-slate-700/30">
                        {window.tabs.map((tab) => (
                          <div
                            key={tab.id}
                            className="flex items-center p-3 hover:bg-slate-700/30 cursor-pointer group"
                            onClick={() => openTab(tab)}
                          >
                            <div className="flex-shrink-0 mr-3 bg-slate-700/50 rounded-full p-1 border border-slate-600/50">
                              {tab.favIconUrl ? (
                                <img
                                  src={tab.favIconUrl}
                                  alt=""
                                  className="w-4 h-4"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://via.placeholder.com/16";
                                  }}
                                />
                              ) : (
                                <Globe className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 truncate">
                              <div className="text-sm text-slate-300 truncate group-hover:text-cyan-300">
                                {tab.title}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {tab.url}
                              </div>
                            </div>
                            <button
                              className="flex-shrink-0 p-1.5 text-slate-400 hover:text-red-400 rounded-full opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTab(tab);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {filteredWindowGroups.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      {searchQuery ? (
                        <div>No windows or tabs match your search.</div>
                      ) : (
                        <div>No active windows or tabs found.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar - Sessions */}
          <div className="col-span-12 lg:col-span-3 overflow-y-auto h-full">
            <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg overflow-hidden h-full flex flex-col">
              <div className="p-3 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-slate-100 flex items-center font-medium">
                    <Bookmark className="mr-2 h-5 w-5 text-purple-500" />
                    Saved Sessions
                  </h2>
                  <button
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/50"
                    onClick={fetchSessionSummaries}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {sessionsLoading ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-ping"></div>
                      <div className="absolute inset-2 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="mt-4 text-purple-400 font-mono text-xs">
                      LOADING SESSIONS
                    </div>
                  </div>
                ) : sessionSummaries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="text-slate-400 text-sm">
                      No saved sessions found
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700/30">
                    {Object.entries(groupSessionsByDate()).map(
                      ([date, sessions]) => (
                        <div key={date} className="py-2">
                          <div className="px-4 py-2">
                            <div className="text-xs font-mono text-slate-500 mb-1">
                              {date}
                            </div>

                            {sessions.map((session) => (
                              <div
                                key={session.id}
                                className="mb-3 bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden"
                              >
                                <div className="p-3 bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-sm border-b border-slate-700/50">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-cyan-400">
                                      {session.name}
                                    </div>
                                    <div className="flex space-x-1">
                                      <button
                                        className="p-1 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded"
                                        onClick={() =>
                                          handleRestoreSession(session.id)
                                        }
                                        title="Restore all tabs"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </button>
                                      <button
                                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                                        onClick={() =>
                                          handleDeleteSession(session.id)
                                        }
                                        title="Delete session"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center mt-1 text-xs text-slate-500">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date(
                                      session.createdAt
                                    ).toLocaleTimeString()}{" "}
                                    •
                                    <Layers className="h-3 w-3 mx-1" />
                                    {session.tabCount}{" "}
                                    {session.tabCount === 1 ? "tab" : "tabs"}
                                  </div>
                                  {session.description && (
                                    <div className="text-xs text-slate-400 mt-1 truncate">
                                      {session.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
                <div className="w-full flex justify-between items-center">
                  <div className="text-xs text-slate-500">
                    {sessionSummaries.length}{" "}
                    {sessionSummaries.length === 1 ? "session" : "sessions"}
                  </div>
                  <button
                    className="text-xs border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 px-2 py-1 rounded flex items-center"
                    onClick={() =>
                      createSession(
                        `New Session ${new Date().toLocaleTimeString()}`
                      )
                    }
                  >
                    <Plus className="h-3 w-3 mr-1" /> Create Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for nav items
type NavItemProps = {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  view?: ViewType;
  activeView?: ViewType;
};

function NavItem(props: NavItemProps) {
  const { icon: Icon, label } = props;

  // Determine if item is active based on the provided props
  const isActive =
    ("active" in props && props.active === true) ||
    ("view" in props &&
      "activeView" in props &&
      props.view === props.activeView);

  return (
    <button
      className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
        isActive
          ? "bg-slate-800/70 text-cyan-400"
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/30"
      }`}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </button>
  );
}

// Component for status items
function StatusItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const getColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500";
      case "green":
        return "from-green-500 to-emerald-500";
      case "blue":
        return "from-blue-500 to-indigo-500";
      case "purple":
        return "from-purple-500 to-pink-500";
      default:
        return "from-cyan-500 to-blue-500";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-xs text-slate-400">{value}%</div>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColor()} rounded-full`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

// Component for metric cards
function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  detail,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  trend: "up" | "down" | "stable";
  color: string;
  detail: string;
}) {
  const getColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500 border-cyan-500/30";
      case "green":
        return "from-green-500 to-emerald-500 border-green-500/30";
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-500/30";
      case "purple":
        return "from-purple-500 to-pink-500 border-purple-500/30";
      default:
        return "from-cyan-500 to-blue-500 border-cyan-500/30";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <BarChart3 className="h-4 w-4 text-amber-500" />;
      case "down":
        return <BarChart3 className="h-4 w-4 rotate-180 text-green-500" />;
      case "stable":
        return <LineChart className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-slate-800/50 rounded-md border ${getColor()} p-3 relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">{title}</div>
        <Icon className="h-4 w-4 text-cyan-500" />
      </div>
      <div className="text-xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
        {value}%
      </div>
      <div className="text-xs text-slate-500">{detail}</div>
      <div className="absolute bottom-2 right-2 flex items-center">
        {getTrendIcon()}
      </div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-cyan-500 to-blue-500"></div>
    </div>
  );
}

export default FuturisticView;
