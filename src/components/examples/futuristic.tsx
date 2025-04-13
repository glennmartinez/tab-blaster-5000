// "use client"
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// import { useEffect, useState, useRef } from "react"
// import {
//   Activity,
//   AlertCircle,
//   BarChart3,
//   Bell,
//   Command,
//   Cpu,
//   Database,
//   Download,
//   Globe,
//   HardDrive,
//   Hexagon,
//   LineChart,
//   type LucideIcon,
//   MessageSquare,
//   Moon,
//   RefreshCw,
//   Search,
//   Settings,
//   Shield,
//   Sun,
//   Terminal,
//   Wifi,
// } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Progress } from "@/components/ui/progress"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import type { Tab } from "./interfaces/TabInterface"

// interface SavedSession {
//   id: string
//   name: string
//   createdAt: string
//   tabs: Tab[]
// }

// export default function Dashboard() {
//   const [theme, setTheme] = useState<"dark" | "light">("dark")
//   const [systemStatus, setSystemStatus] = useState(85)
//   const [cpuUsage, setCpuUsage] = useState(42)
//   const [memoryUsage, setMemoryUsage] = useState(68)
//   const [networkStatus, setNetworkStatus] = useState(92)
//   const [securityLevel, setSecurityLevel] = useState(75)
//   const [currentTime, setCurrentTime] = useState(new Date())
//   const [isLoading, setIsLoading] = useState(true)
//   const [savedSessions, setSavedSessions] = useState<SavedSession[]>([])
//   const [sessionsLoading, setSessionsLoading] = useState<boolean>(true)
//   const [activeWindows, setActiveWindows] = useState<
//     {
//       id: string
//       tabs: Tab[]
//     }[]
//   >([])

//   const canvasRef = useRef<HTMLCanvasElement>(null)

//   // Simulate data loading
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoading(false)
//     }, 2000)

//     return () => clearTimeout(timer)
//   }, [])

//   // Update time
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTime(new Date())
//     }, 1000)

//     return () => clearInterval(interval)
//   }, [])

//   // Simulate changing data
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCpuUsage(Math.floor(Math.random() * 30) + 30)
//       setMemoryUsage(Math.floor(Math.random() * 20) + 60)
//       setNetworkStatus(Math.floor(Math.random() * 15) + 80)
//       setSystemStatus(Math.floor(Math.random() * 10) + 80)
//     }, 3000)

//     return () => clearInterval(interval)
//   }, [])

//   // Load saved sessions
//   useEffect(() => {
//     loadSavedSessions()
//   }, [])

//   // Particle effect
//   useEffect(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return

//     const ctx = canvas.getContext("2d")
//     if (!ctx) return

//     canvas.width = canvas.offsetWidth
//     canvas.height = canvas.offsetHeight

//     const particles: Particle[] = []
//     const particleCount = 100

//     class Particle {
//       x: number
//       y: number
//       size: number
//       speedX: number
//       speedY: number
//       color: string

//       constructor() {
//         this.x = Math.random() * canvas.width
//         this.y = Math.random() * canvas.height
//         this.size = Math.random() * 3 + 1
//         this.speedX = (Math.random() - 0.5) * 0.5
//         this.speedY = (Math.random() - 0.5) * 0.5
//         this.color = `rgba(${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 100) + 150}, ${Math.floor(Math.random() * 55) + 200}, ${Math.random() * 0.5 + 0.2})`
//       }

//       update() {
//         this.x += this.speedX
//         this.y += this.speedY

//         if (this.x > canvas.width) this.x = 0
//         if (this.x < 0) this.x = canvas.width
//         if (this.y > canvas.height) this.y = 0
//         if (this.y < canvas.height) this.y = canvas.height
//       }

//       draw() {
//         if (!ctx) return
//         ctx.fillStyle = this.color
//         ctx.beginPath()
//         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
//         ctx.fill()
//       }
//     }

//     for (let i = 0; i < particleCount; i++) {
//       particles.push(new Particle())
//     }

//     function animate() {
//       if (!ctx || !canvas) return
//       ctx.clearRect(0, 0, canvas.width, canvas.height)

//       for (const particle of particles) {
//         particle.update()
//         particle.draw()
//       }

//       requestAnimationFrame(animate)
//     }

//     animate()

//     const handleResize = () => {
//       if (!canvas) return
//       canvas.width = canvas.offsetWidth
//       canvas.height = canvas.offsetHeight
//     }

//     window.addEventListener("resize", handleResize)

//     return () => {
//       window.removeEventListener("resize", handleResize)
//     }
//   }, [])

//   // Toggle theme
//   const toggleTheme = () => {
//     setTheme(theme === "dark" ? "light" : "dark")
//   }

//   // Format time
//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString("en-US", {
//       hour12: false,
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     })
//   }

//   // Format date
//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     })
//   }

//   // Load saved sessions
//   const loadSavedSessions = () => {
//     setSessionsLoading(true)

//     // Mock data for demonstration
//     const mockSessions: SavedSession[] = [
//       {
//         id: "session1",
//         name: "Work Research",
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
//         tabs: [
//           {
//             id: "1",
//             title: "GitHub - Repository",
//             url: "https://github.com",
//             favIconUrl: "https://github.com/favicon.ico",
//           },
//           {
//             id: "2",
//             title: "Stack Overflow - Questions",
//             url: "https://stackoverflow.com",
//             favIconUrl: "https://stackoverflow.com/favicon.ico",
//           },
//           {
//             id: "3",
//             title: "MDN Web Docs",
//             url: "https://developer.mozilla.org",
//             favIconUrl: "https://developer.mozilla.org/favicon.ico",
//           },
//           {
//             id: "4",
//             title: "React Documentation",
//             url: "https://reactjs.org",
//             favIconUrl: "https://reactjs.org/favicon.ico",
//           },
//           {
//             id: "5",
//             title: "TypeScript Documentation",
//             url: "https://www.typescriptlang.org",
//             favIconUrl: "https://www.typescriptlang.org/favicon.ico",
//           },
//         ],
//       },
//       {
//         id: "session2",
//         name: "Travel Planning",
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
//         tabs: [
//           { id: "6", title: "Airbnb", url: "https://airbnb.com", favIconUrl: "https://airbnb.com/favicon.ico" },
//           {
//             id: "7",
//             title: "Google Flights",
//             url: "https://flights.google.com",
//             favIconUrl: "https://www.google.com/favicon.ico",
//           },
//           {
//             id: "8",
//             title: "TripAdvisor",
//             url: "https://tripadvisor.com",
//             favIconUrl: "https://tripadvisor.com/favicon.ico",
//           },
//         ],
//       },
//       {
//         id: "session3",
//         name: "Learning Resources",
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
//         tabs: [
//           { id: "9", title: "Coursera", url: "https://coursera.org", favIconUrl: "https://coursera.org/favicon.ico" },
//           { id: "10", title: "edX", url: "https://edx.org", favIconUrl: "https://edx.org/favicon.ico" },
//           {
//             id: "11",
//             title: "Khan Academy",
//             url: "https://khanacademy.org",
//             favIconUrl: "https://khanacademy.org/favicon.ico",
//           },
//           { id: "12", title: "Udemy", url: "https://udemy.com", favIconUrl: "https://udemy.com/favicon.ico" },
//         ],
//       },
//       {
//         id: "session4",
//         name: "Entertainment",
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
//         tabs: [
//           { id: "13", title: "Netflix", url: "https://netflix.com", favIconUrl: "https://netflix.com/favicon.ico" },
//           { id: "14", title: "YouTube", url: "https://youtube.com", favIconUrl: "https://youtube.com/favicon.ico" },
//           { id: "15", title: "Spotify", url: "https://spotify.com", favIconUrl: "https://spotify.com/favicon.ico" },
//         ],
//       },
//     ]

//     setTimeout(() => {
//       setSavedSessions(mockSessions)
//       setSessionsLoading(false)
//     }, 1500)
//   }

//   // Open a tab
//   const openTab = (url: string) => {
//     window.open(url, "_blank")
//   }

//   // Delete a session
//   const deleteSession = (sessionId: string) => {
//     setSavedSessions(savedSessions.filter((session) => session.id !== sessionId))
//   }

//   // Restore a session
//   const restoreSession = (session: SavedSession) => {
//     session.tabs.forEach((tab) => {
//       if (tab.url) {
//         openTab(tab.url)
//       }
//     })
//   }

//   // Group sessions by date
//   const groupSessionsByDate = () => {
//     const grouped: { [date: string]: SavedSession[] } = {}

//     savedSessions.forEach((session) => {
//       const date = new Date(session.createdAt).toLocaleDateString()
//       if (!grouped[date]) {
//         grouped[date] = []
//       }
//       grouped[date].push(session)
//     })

//     return grouped
//   }

//   // Add this function to handle saving a session
//   const saveSession = (windowId: string) => {
//     const windowToSave = activeWindows.find((window) => window.id === windowId)
//     if (!windowToSave) return

//     const newSession: SavedSession = {
//       id: `session-${Date.now()}`,
//       name: `Session ${new Date().toLocaleTimeString()}`,
//       createdAt: new Date().toISOString(),
//       tabs: windowToSave.tabs,
//     }

//     setSavedSessions((prev) => [newSession, ...prev])
//   }

//   // Add this useEffect to load mock active windows data
//   useEffect(() => {
//     // Mock data for active windows and tabs
//     const mockWindows = [
//       {
//         id: "window1",
//         tabs: [
//           {
//             id: "tab1",
//             title: "GitHub - Your Repository",
//             url: "https://github.com/yourusername/repo",
//             favIconUrl: "https://github.com/favicon.ico",
//           },
//           {
//             id: "tab2",
//             title: "React Documentation - Hooks",
//             url: "https://reactjs.org/docs/hooks-intro.html",
//             favIconUrl: "https://reactjs.org/favicon.ico",
//           },
//           {
//             id: "tab3",
//             title: "TypeScript Handbook",
//             url: "https://www.typescriptlang.org/docs/handbook/intro.html",
//             favIconUrl: "https://www.typescriptlang.org/favicon.ico",
//           },
//           {
//             id: "tab4",
//             title: "Next.js Documentation",
//             url: "https://nextjs.org/docs",
//             favIconUrl: "https://nextjs.org/favicon.ico",
//           },
//         ],
//       },
//       {
//         id: "window2",
//         tabs: [
//           {
//             id: "tab5",
//             title: "YouTube - Web Development Tutorial",
//             url: "https://youtube.com/watch?v=example",
//             favIconUrl: "https://youtube.com/favicon.ico",
//           },
//           {
//             id: "tab6",
//             title: "Stack Overflow - React Question",
//             url: "https://stackoverflow.com/questions/12345",
//             favIconUrl: "https://stackoverflow.com/favicon.ico",
//           },
//         ],
//       },
//       {
//         id: "window3",
//         tabs: [
//           {
//             id: "tab7",
//             title: "Gmail - Inbox",
//             url: "https://mail.google.com",
//             favIconUrl: "https://mail.google.com/favicon.ico",
//           },
//           {
//             id: "tab8",
//             title: "Google Calendar",
//             url: "https://calendar.google.com",
//             favIconUrl: "https://calendar.google.com/favicon.ico",
//           },
//           {
//             id: "tab9",
//             title: "Google Drive",
//             url: "https://drive.google.com",
//             favIconUrl: "https://drive.google.com/favicon.ico",
//           },
//         ],
//       },
//     ]

//     setActiveWindows(mockWindows)
//   }, [])

//   return (
//     <div
//       className={`${theme} min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden`}
//     >
//       {/* Background particle effect */}
//       <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

//       {/* Loading overlay */}
//       {isLoading && (
//         <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
//           <div className="flex flex-col items-center">
//             <div className="relative w-24 h-24">
//               <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
//               <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
//               <div className="absolute inset-4 border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
//               <div className="absolute inset-6 border-4 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slower"></div>
//               <div className="absolute inset-8 border-4 border-l-green-500 border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
//             </div>
//             <div className="mt-4 text-cyan-500 font-mono text-sm tracking-wider">SYSTEM INITIALIZING</div>
//           </div>
//         </div>
//       )}

//       <div className="container mx-auto p-4 relative z-10">
//         {/* Header */}
//         <header className="flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
//           <div className="flex items-center space-x-2">
//             <Hexagon className="h-8 w-8 text-cyan-500" />
//             <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
//               Tab Blaster 5000
//             </span>
//           </div>

//           <div className="flex items-center space-x-6">
//             <div className="hidden md:flex items-center space-x-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
//               <Search className="h-4 w-4 text-slate-400" />
//               <input
//                 type="text"
//                 placeholder="Search systems..."
//                 className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-slate-500"
//               />
//             </div>

//             <div className="flex items-center space-x-3">
//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100">
//                       <Bell className="h-5 w-5" />
//                       <span className="absolute -top-1 -right-1 h-2 w-2 bg-cyan-500 rounded-full animate-pulse"></span>
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>
//                     <p>Notifications</p>
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>

//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={toggleTheme}
//                       className="text-slate-400 hover:text-slate-100"
//                     >
//                       {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>
//                     <p>Toggle theme</p>
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>

//               <Avatar>
//                 <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
//                 <AvatarFallback className="bg-slate-700 text-cyan-500">CM</AvatarFallback>
//               </Avatar>
//             </div>
//           </div>
//         </header>

//         {/* Main content */}
//         <div className="grid grid-cols-12 gap-6">
//           {/* Sidebar */}
//           <div className="col-span-12 md:col-span-3 lg:col-span-2">
//             <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full">
//               <CardContent className="p-4 flex flex-col h-full">
//                 <nav className="space-y-2">
//                   <NavItem icon={Command} label="Dashboard" active />
//                   <NavItem icon={Activity} label="Diagnostics" />
//                   <NavItem icon={Database} label="Data Center" />
//                   <NavItem icon={Globe} label="Network" />
//                   <NavItem icon={Shield} label="Security" />
//                   <NavItem icon={Terminal} label="Console" />
//                   <NavItem icon={MessageSquare} label="Communications" />
//                   <NavItem icon={Settings} label="Settings" />
//                 </nav>

//                 <div className="mt-8 pt-6 border-t border-slate-700/50">
//                   <div className="text-xs text-slate-500 mb-2 font-mono">SYSTEM STATUS</div>
//                   <div className="space-y-3">
//                     <StatusItem label="Core Systems" value={systemStatus} color="cyan" />
//                     <StatusItem label="Security" value={securityLevel} color="green" />
//                     <StatusItem label="Network" value={networkStatus} color="blue" />
//                   </div>
//                 </div>
//                 <div className="mt-auto pt-6 border-t border-slate-700/50">
//                   <div className="flex flex-col items-center justify-center">
//                     <div className="relative">
//                       <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 bg-clip-text text-transparent cyberpunk-text">
//                         Gmoney
//                       </div>
//                       <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-lg opacity-30 animate-pulse"></div>
//                     </div>
//                     <div className="text-xs text-slate-500 mt-1">Labs</div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Main dashboard */}
//           <div className="col-span-12 md:col-span-9 lg:col-span-7">
//             <div className="grid gap-6">
//               {/* System overview */}
//               <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
//                 <CardHeader className="border-b border-slate-700/50 pb-3">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-slate-100 flex items-center">
//                       <Activity className="mr-2 h-5 w-5 text-cyan-500" />
//                       System Overview
//                     </CardTitle>
//                     <div className="flex items-center space-x-2">
//                       <Badge variant="outline" className="bg-slate-800/50 text-cyan-400 border-cyan-500/50 text-xs">
//                         <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 mr-1 animate-pulse"></div>
//                         LIVE
//                       </Badge>
//                       <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
//                         <RefreshCw className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <MetricCard
//                       title="CPU Usage"
//                       value={cpuUsage}
//                       icon={Cpu}
//                       trend="up"
//                       color="cyan"
//                       detail="3.8 GHz | 12 Cores"
//                     />
//                     <MetricCard
//                       title="Memory"
//                       value={memoryUsage}
//                       icon={HardDrive}
//                       trend="stable"
//                       color="purple"
//                       detail="16.4 GB / 24 GB"
//                     />
//                     <MetricCard
//                       title="Network"
//                       value={networkStatus}
//                       icon={Wifi}
//                       trend="down"
//                       color="blue"
//                       detail="1.2 GB/s | 42ms"
//                     />
//                   </div>

//                   <div className="mt-8">
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-sm font-medium text-slate-300 flex items-center">
//                         <Browsers className="mr-2 h-4 w-4 text-cyan-500" />
//                         Active Windows
//                       </h3>
//                       <Badge variant="outline" className="bg-slate-800/50 text-cyan-400 border-cyan-500/50 text-xs">
//                         {activeWindows.length} Windows
//                       </Badge>
//                     </div>

//                     <div className="space-y-6">
//                       {activeWindows.map((window) => (
//                         <div
//                           key={window.id}
//                           className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden"
//                         >
//                           <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-sm p-3 border-b border-slate-700/50 flex items-center justify-between">
//                             <div className="flex items-center">
//                               <div className="h-2 w-2 rounded-full bg-cyan-500 mr-2"></div>
//                               <span className="text-sm font-medium text-slate-300">
//                                 Window {window.id.replace("window", "")}
//                               </span>
//                               <Badge
//                                 variant="outline"
//                                 className="ml-2 bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs"
//                               >
//                                 {window.tabs.length} tabs
//                               </Badge>
//                             </div>
//                             <Button
//                               size="sm"
//                               className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700 text-white"
//                               onClick={() => saveSession(window.id)}
//                             >
//                               <Save className="h-3 w-3 mr-1" /> Save Session
//                             </Button>
//                           </div>

//                           <div className="divide-y divide-slate-700/30">
//                             {window.tabs.map((tab) => (
//                               <div
//                                 key={tab.id}
//                                 className="flex items-center p-3 hover:bg-slate-700/30 cursor-pointer group"
//                                 onClick={() => openTab(tab.url || "")}
//                               >
//                                 <div className="flex-shrink-0 mr-3 bg-slate-700/50 rounded-full p-1 border border-slate-600/50">
//                                   {tab.favIconUrl ? (
//                                     <img
//                                       src={tab.favIconUrl || "/placeholder.svg"}
//                                       alt=""
//                                       className="w-4 h-4"
//                                       onError={(e) => {
//                                         ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=16&width=16"
//                                       }}
//                                     />
//                                   ) : (
//                                     <Globe className="w-4 h-4 text-slate-400" />
//                                   )}
//                                 </div>
//                                 <div className="flex-1 truncate text-sm text-slate-300 group-hover:text-cyan-300">
//                                   {tab.title || "Untitled Tab"}
//                                 </div>
//                                 <div className="flex-shrink-0 text-xs text-slate-500 truncate max-w-[180px] hidden sm:block">
//                                   {tab.url}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Security & Alerts */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-slate-100 flex items-center text-base">
//                       <Shield className="mr-2 h-5 w-5 text-green-500" />
//                       Security Status
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <div className="text-sm text-slate-400">Firewall</div>
//                         <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Active</Badge>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <div className="text-sm text-slate-400">Intrusion Detection</div>
//                         <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Active</Badge>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <div className="text-sm text-slate-400">Encryption</div>
//                         <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Active</Badge>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <div className="text-sm text-slate-400">Threat Database</div>
//                         <div className="text-sm text-cyan-400">
//                           Updated <span className="text-slate-500">12 min ago</span>
//                         </div>
//                       </div>

//                       <div className="pt-2 mt-2 border-t border-slate-700/50">
//                         <div className="flex items-center justify-between mb-2">
//                           <div className="text-sm font-medium">Security Level</div>
//                           <div className="text-sm text-cyan-400">{securityLevel}%</div>
//                         </div>
//                         <Progress value={securityLevel} className="h-2 bg-slate-700">
//                           <div
//                             className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full"
//                             style={{ width: `${securityLevel}%` }}
//                           />
//                         </Progress>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-slate-100 flex items-center text-base">
//                       <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
//                       System Alerts
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-3">
//                       <AlertItem
//                         title="Security Scan Complete"
//                         time="14:32:12"
//                         description="No threats detected in system scan"
//                         type="info"
//                       />
//                       <AlertItem
//                         title="Bandwidth Spike Detected"
//                         time="13:45:06"
//                         description="Unusual network activity on port 443"
//                         type="warning"
//                       />
//                       <AlertItem
//                         title="System Update Available"
//                         time="09:12:45"
//                         description="Version 12.4.5 ready to install"
//                         type="update"
//                       />
//                       <AlertItem
//                         title="Backup Completed"
//                         time="04:30:00"
//                         description="Incremental backup to drive E: successful"
//                         type="success"
//                       />
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
//           </div>

//           {/* Right sidebar - Sessions */}
//           <div className="col-span-12 lg:col-span-3">
//             <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
//               <CardHeader className="pb-2 border-b border-slate-700/50">
//                 <div className="flex items-center justify-between">
//                   <CardTitle className="text-slate-100 flex items-center text-base">
//                     <Bookmark className="mr-2 h-5 w-5 text-purple-500" />
//                     Saved Sessions
//                   </CardTitle>
//                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={loadSavedSessions}>
//                     <RefreshCw className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </CardHeader>

//               <CardContent className="p-0 max-h-[calc(100vh-12rem)] overflow-y-auto">
//                 {sessionsLoading ? (
//                   <div className="flex flex-col items-center justify-center p-8">
//                     <div className="relative w-12 h-12">
//                       <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-ping"></div>
//                       <div className="absolute inset-2 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
//                     </div>
//                     <div className="mt-4 text-purple-400 font-mono text-xs">LOADING SESSIONS</div>
//                   </div>
//                 ) : savedSessions.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center p-8">
//                     <div className="text-slate-400 text-sm">No saved sessions found</div>
//                   </div>
//                 ) : (
//                   <div className="divide-y divide-slate-700/30">
//                     {Object.entries(groupSessionsByDate()).map(([date, sessions]) => (
//                       <div key={date} className="py-2">
//                         <div className="px-4 py-2">
//                           <div className="text-xs font-mono text-slate-500 mb-1">{date}</div>

//                           {sessions.map((session) => (
//                             <div
//                               key={session.id}
//                               className="mb-3 bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden"
//                               style={{ maxHeight: "200px" }}
//                             >
//                               <div className="p-3 bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-sm border-b border-slate-700/50">
//                                 <div className="flex items-center justify-between">
//                                   <div className="text-sm font-medium text-cyan-400">{session.name}</div>
//                                   <div className="flex space-x-1">
//                                     <Button
//                                       variant="ghost"
//                                       size="icon"
//                                       className="h-6 w-6 text-green-400 hover:text-green-300 hover:bg-green-900/20"
//                                       onClick={() => restoreSession(session)}
//                                       title="Restore all tabs"
//                                     >
//                                       <ExternalLink className="h-3 w-3" />
//                                     </Button>
//                                     <Button
//                                       variant="ghost"
//                                       size="icon"
//                                       className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-900/20"
//                                       onClick={() => deleteSession(session.id)}
//                                       title="Delete session"
//                                     >
//                                       <Trash2 className="h-3 w-3" />
//                                     </Button>
//                                   </div>
//                                 </div>
//                                 <div className="flex items-center mt-1 text-xs text-slate-500">
//                                   <Clock className="h-3 w-3 mr-1" />
//                                   {new Date(session.createdAt).toLocaleTimeString()} •
//                                   <Layers className="h-3 w-3 mx-1" />
//                                   {session.tabs.length} {session.tabs.length === 1 ? "tab" : "tabs"}
//                                 </div>
//                               </div>

//                               <div className="p-2 overflow-y-auto" style={{ maxHeight: "140px" }}>
//                                 {session.tabs.slice(0, 3).map((tab, index) => (
//                                   <div
//                                     key={`${session.id}-${index}`}
//                                     className="flex items-center p-2 hover:bg-slate-700/50 rounded-md cursor-pointer group"
//                                     onClick={() => openTab(tab.url || "")}
//                                   >
//                                     <div className="flex-shrink-0 mr-3 bg-slate-700/50 rounded-full p-1 border border-slate-600/50">
//                                       {tab.favIconUrl ? (
//                                         <img
//                                           src={tab.favIconUrl || "/placeholder.svg"}
//                                           alt=""
//                                           className="w-3 h-3"
//                                           onError={(e) => {
//                                             ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=12&width=12"
//                                           }}
//                                         />
//                                       ) : (
//                                         <Globe className="w-3 h-3 text-slate-400" />
//                                       )}
//                                     </div>
//                                     <div className="truncate text-xs text-slate-300 group-hover:text-cyan-300">
//                                       {tab.title || "Untitled Tab"}
//                                     </div>
//                                   </div>
//                                 ))}

//                                 {session.tabs.length > 3 && (
//                                   <div className="px-2 py-1 text-xs text-slate-500 italic">
//                                     +{session.tabs.length - 3} more tabs
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>

//               <CardFooter className="p-3 border-t border-slate-700/50 bg-slate-800/30">
//                 <div className="w-full flex justify-between items-center">
//                   <div className="text-xs text-slate-500">
//                     {savedSessions.length} {savedSessions.length === 1 ? "session" : "sessions"}
//                   </div>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     className="h-7 text-xs border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400"
//                   >
//                     <Plus className="h-3 w-3 mr-1" /> New Session
//                   </Button>
//                 </div>
//               </CardFooter>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Component for nav items
// function NavItem({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active?: boolean }) {
//   return (
//     <Button
//       variant="ghost"
//       className={`w-full justify-start ${active ? "bg-slate-800/70 text-cyan-400" : "text-slate-400 hover:text-slate-100"}`}
//     >
//       <Icon className="mr-2 h-4 w-4" />
//       {label}
//     </Button>
//   )
// }

// // Component for status items
// function StatusItem({ label, value, color }: { label: string; value: number; color: string }) {
//   const getColor = () => {
//     switch (color) {
//       case "cyan":
//         return "from-cyan-500 to-blue-500"
//       case "green":
//         return "from-green-500 to-emerald-500"
//       case "blue":
//         return "from-blue-500 to-indigo-500"
//       case "purple":
//         return "from-purple-500 to-pink-500"
//       default:
//         return "from-cyan-500 to-blue-500"
//     }
//   }

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-1">
//         <div className="text-xs text-slate-400">{label}</div>
//         <div className="text-xs text-slate-400">{value}%</div>
//       </div>
//       <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
//         <div className={`h-full bg-gradient-to-r ${getColor()} rounded-full`} style={{ width: `${value}%` }}></div>
//       </div>
//     </div>
//   )
// }

// // Component for metric cards
// function MetricCard({
//   title,
//   value,
//   icon: Icon,
//   trend,
//   color,
//   detail,
// }: {
//   title: string
//   value: number
//   icon: LucideIcon
//   trend: "up" | "down" | "stable"
//   color: string
//   detail: string
// }) {
//   const getColor = () => {
//     switch (color) {
//       case "cyan":
//         return "from-cyan-500 to-blue-500 border-cyan-500/30"
//       case "green":
//         return "from-green-500 to-emerald-500 border-green-500/30"
//       case "blue":
//         return "from-blue-500 to-indigo-500 border-blue-500/30"
//       case "purple":
//         return "from-purple-500 to-pink-500 border-purple-500/30"
//       default:
//         return "from-cyan-500 to-blue-500 border-cyan-500/30"
//     }
//   }

//   const getTrendIcon = () => {
//     switch (trend) {
//       case "up":
//         return <BarChart3 className="h-4 w-4 text-amber-500" />
//       case "down":
//         return <BarChart3 className="h-4 w-4 rotate-180 text-green-500" />
//       case "stable":
//         return <LineChart className="h-4 w-4 text-blue-500" />
//       default:
//         return null
//     }
//   }

//   return (
//     <div className={`bg-slate-800/50 rounded-lg border ${getColor()} p-4 relative overflow-hidden`}>
//       <div className="flex items-center justify-between mb-2">
//         <div className="text-sm text-slate-400">{title}</div>
//         <Icon className={`h-5 w-5 text-${color}-500`} />
//       </div>
//       <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
//         {value}%
//       </div>
//       <div className="text-xs text-slate-500">{detail}</div>
//       <div className="absolute bottom-2 right-2 flex items-center">{getTrendIcon()}</div>
//       <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-cyan-500 to-blue-500"></div>
//     </div>
//   )
// }

// // Add missing imports
// import { Bookmark, Clock, ExternalLink, Layers, Plus, Trash2, ChromeIcon as Browsers, Save } from "lucide-react"

// // Performance chart component
// function PerformanceChart() {
//   return (
//     <div className="h-full w-full flex items-end justify-between px-4 pt-4 pb-8 relative">
//       {/* Y-axis labels */}
//       <div className="absolute left-2 top-0 h-full flex flex-col justify-between py-4">
//         <div className="text-xs text-slate-500">100%</div>
//         <div className="text-xs text-slate-500">75%</div>
//         <div className="text-xs text-slate-500">50%</div>
//         <div className="text-xs text-slate-500">25%</div>
//         <div className="text-xs text-slate-500">0%</div>
//       </div>

//       {/* X-axis grid lines */}
//       <div className="absolute left-0 right-0 top-0 h-full flex flex-col justify-between py-4 px-10">
//         <div className="border-b border-slate-700/30 w-full"></div>
//         <div className="border-b border-slate-700/30 w-full"></div>
//         <div className="border-b border-slate-700/30 w-full"></div>
//         <div className="border-b border-slate-700/30 w-full"></div>
//         <div className="border-b border-slate-700/30 w-full"></div>
//       </div>

//       {/* Chart bars */}
//       <div className="flex-1 h-full flex items-end justify-between px-2 z-10">
//         {Array.from({ length: 24 }).map((_, i) => {
//           const cpuHeight = Math.floor(Math.random() * 60) + 20
//           const memHeight = Math.floor(Math.random() * 40) + 40
//           const netHeight = Math.floor(Math.random() * 30) + 30

//           return (
//             <div key={i} className="flex space-x-0.5">
//               <div
//                 className="w-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-sm"
//                 style={{ height: `${cpuHeight}%` }}
//               ></div>
//               <div
//                 className="w-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-sm"
//                 style={{ height: `${memHeight}%` }}
//               ></div>
//               <div
//                 className="w-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm"
//                 style={{ height: `${netHeight}%` }}
//               ></div>
//             </div>
//           )
//         })}
//       </div>

//       {/* X-axis labels */}
//       <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10">
//         <div className="text-xs text-slate-500">00:00</div>
//         <div className="text-xs text-slate-500">06:00</div>
//         <div className="text-xs text-slate-500">12:00</div>
//         <div className="text-xs text-slate-500">18:00</div>
//         <div className="text-xs text-slate-500">24:00</div>
//       </div>
//     </div>
//   )
// }

// // Process row component
// function ProcessRow({
//   pid,
//   name,
//   user,
//   cpu,
//   memory,
//   status,
// }: {
//   pid: string
//   name: string
//   user: string
//   cpu: number
//   memory: number
//   status: string
// }) {
//   return (
//     <div className="grid grid-cols-12 py-2 px-3 text-sm hover:bg-slate-800/50">
//       <div className="col-span-1 text-slate-500">{pid}</div>
//       <div className="col-span-4 text-slate-300">{name}</div>
//       <div className="col-span-2 text-slate-400">{user}</div>
//       <div className="col-span-2 text-cyan-400">{cpu}%</div>
//       <div className="col-span-2 text-purple-400">{memory} MB</div>
//       <div className="col-span-1">
//         <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
//           {status}
//         </Badge>
//       </div>
//     </div>
//   )
// }

// // Storage item component
// function StorageItem({
//   name,
//   total,
//   used,
//   type,
// }: {
//   name: string
//   total: number
//   used: number
//   type: string
// }) {
//   const percentage = Math.round((used / total) * 100)

//   return (
//     <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
//       <div className="flex items-center justify-between mb-2">
//         <div className="text-sm text-slate-300">{name}</div>
//         <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs">
//           {type}
//         </Badge>
//       </div>
//       <div className="mb-2">
//         <div className="flex items-center justify-between mb-1">
//           <div className="text-xs text-slate-500">
//             {used} GB / {total} GB
//           </div>
//           <div className="text-xs text-slate-400">{percentage}%</div>
//         </div>
//         <Progress value={percentage} className="h-1.5 bg-slate-700">
//           <div
//             className={`h-full rounded-full ${
//               percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-amber-500" : "bg-cyan-500"
//             }`}
//             style={{ width: `${percentage}%` }}
//           />
//         </Progress>
//       </div>
//       <div className="flex items-center justify-between text-xs">
//         <div className="text-slate-500">Free: {total - used} GB</div>
//         <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-slate-400 hover:text-slate-100">
//           Details
//         </Button>
//       </div>
//     </div>
//   )
// }

// // Alert item component
// function AlertItem({
//   title,
//   time,
//   description,
//   type,
// }: {
//   title: string
//   time: string
//   description: string
//   type: "info" | "warning" | "error" | "success" | "update"
// }) {
//   const getTypeStyles = () => {
//     switch (type) {
//       case "info":
//         return { icon: Info, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" }
//       case "warning":
//         return { icon: AlertCircle, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" }
//       case "error":
//         return { icon: AlertCircle, color: "text-red-500 bg-red-500/10 border-red-500/30" }
//       case "success":
//         return { icon: Check, color: "text-green-500 bg-green-500/10 border-green-500/30" }
//       case "update":
//         return { icon: Download, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30" }
//       default:
//         return { icon: Info, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" }
//     }
//   }

//   const { icon: Icon, color } = getTypeStyles()

//   return (
//     <div className="flex items-start space-x-3">
//       <div className={`mt-0.5 p-1 rounded-full ${color.split(" ")[1]} ${color.split(" ")[2]}`}>
//         <Icon className={`h-3 w-3 ${color.split(" ")[0]}`} />
//       </div>
//       <div>
//         <div className="flex items-center">
//           <div className="text-sm font-medium text-slate-200">{title}</div>
//           <div className="ml-2 text-xs text-slate-500">{time}</div>
//         </div>
//         <div className="text-xs text-slate-400">{description}</div>
//       </div>
//     </div>
//   )
// }

// // Communication item component
// function CommunicationItem({
//   sender,
//   time,
//   message,
//   avatar,
//   unread,
// }: {
//   sender: string
//   time: string
//   message: string
//   avatar: string
//   unread?: boolean
// }) {
//   return (
//     <div className={`flex space-x-3 p-2 rounded-md ${unread ? "bg-slate-800/50 border border-slate-700/50" : ""}`}>
//       <Avatar className="h-8 w-8">
//         <AvatarImage src={avatar || "/placeholder.svg"} alt={sender} />
//         <AvatarFallback className="bg-slate-700 text-cyan-500">{sender.charAt(0)}</AvatarFallback>
//       </Avatar>
//       <div className="flex-1">
//         <div className="flex items-center justify-between">
//           <div className="text-sm font-medium text-slate-200">{sender}</div>
//           <div className="text-xs text-slate-500">{time}</div>
//         </div>
//         <div className="text-xs text-slate-400 mt-1">{message}</div>
//       </div>
//       {unread && (
//         <div className="flex-shrink-0 self-center">
//           <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
//         </div>
//       )}
//     </div>
//   )
// }

// // Action button component
// function ActionButton({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
//   return (
//     <Button
//       variant="outline"
//       className="h-auto py-3 px-3 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 flex flex-col items-center justify-center space-y-1 w-full"
//     >
//       <Icon className="h-5 w-5 text-cyan-500" />
//       <span className="text-xs">{label}</span>
//     </Button>
//   )
// }

// // Add missing imports
// function Info(props) {
//   return <AlertCircle {...props} />
// }

// function Check(props) {
//   return <Shield {...props} />
// }
 