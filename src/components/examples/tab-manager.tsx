// "use client"

// import { useState } from "react"
// import { Search, Plus, ExternalLink, Trash2, Clock, Tag, Filter, Calendar, Bookmark, ChevronDown } from "lucide-react"
// import Image from "next/image"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar"

// // Types for our tab data
// interface TabItem {
//   id: string
//   title: string
//   url: string
//   favicon: string
//   createdAt: Date
//   tags: string[]
//   sessionId: string
//   sessionName: string
// }

// interface SessionGroup {
//   date: Date
//   sessions: {
//     id: string
//     name: string
//     tabs: TabItem[]
//   }[]
// }

// // Sample data - replace with actual Chrome API integration
// const sampleTabs: TabItem[] = [
//   {
//     id: "1",
//     title: "GitHub: Where the world builds software",
//     url: "https://github.com",
//     favicon: "https://github.com/favicon.ico",
//     createdAt: new Date(2025, 2, 30, 14, 30),
//     tags: ["dev", "code"],
//     sessionId: "morning-session",
//     sessionName: "Morning Work",
//   },
//   {
//     id: "2",
//     title: "Stack Overflow - Where Developers Learn, Share, & Build Careers",
//     url: "https://stackoverflow.com",
//     favicon: "https://stackoverflow.com/favicon.ico",
//     createdAt: new Date(2025, 2, 30, 14, 35),
//     tags: ["dev", "help"],
//     sessionId: "morning-session",
//     sessionName: "Morning Work",
//   },
//   {
//     id: "3",
//     title: "Vercel: Develop. Preview. Ship.",
//     url: "https://vercel.com",
//     favicon: "https://vercel.com/favicon.ico",
//     createdAt: new Date(2025, 2, 30, 15, 10),
//     tags: ["hosting", "dev"],
//     sessionId: "afternoon-session",
//     sessionName: "Afternoon Research",
//   },
//   {
//     id: "4",
//     title: "React – A JavaScript library for building user interfaces",
//     url: "https://reactjs.org",
//     favicon: "https://reactjs.org/favicon.ico",
//     createdAt: new Date(2025, 2, 29, 10, 15),
//     tags: ["dev", "frontend"],
//     sessionId: "yesterday-morning",
//     sessionName: "Project Research",
//   },
//   {
//     id: "5",
//     title: "Next.js by Vercel - The React Framework",
//     url: "https://nextjs.org",
//     favicon: "https://nextjs.org/favicon.ico",
//     createdAt: new Date(2025, 2, 29, 10, 25),
//     tags: ["dev", "framework"],
//     sessionId: "yesterday-morning",
//     sessionName: "Project Research",
//   },
//   {
//     id: "6",
//     title: "Tailwind CSS - Rapidly build modern websites without ever leaving your HTML",
//     url: "https://tailwindcss.com",
//     favicon: "https://tailwindcss.com/favicon.ico",
//     createdAt: new Date(2025, 2, 29, 11, 5),
//     tags: ["css", "design"],
//     sessionId: "yesterday-afternoon",
//     sessionName: "Design Exploration",
//   },
//   {
//     id: "7",
//     title: "MDN Web Docs",
//     url: "https://developer.mozilla.org",
//     favicon: "https://developer.mozilla.org/favicon.ico",
//     createdAt: new Date(2025, 2, 28, 9, 15),
//     tags: ["reference", "dev"],
//     sessionId: "earlier-session",
//     sessionName: "Documentation",
//   },
//   {
//     id: "8",
//     title: "CSS-Tricks",
//     url: "https://css-tricks.com",
//     favicon: "https://css-tricks.com/favicon.ico",
//     createdAt: new Date(2025, 2, 28, 9, 45),
//     tags: ["css", "dev"],
//     sessionId: "earlier-session",
//     sessionName: "Documentation",
//   },
// ]

// // Group tabs by date and session
// const groupTabsByDateAndSession = (tabs: TabItem[]): SessionGroup[] => {
//   const dateGroups: { [key: string]: { [key: string]: TabItem[] } } = {}

//   tabs.forEach((tab) => {
//     const dateKey = tab.createdAt.toDateString()
//     if (!dateGroups[dateKey]) {
//       dateGroups[dateKey] = {}
//     }

//     if (!dateGroups[dateKey][tab.sessionId]) {
//       dateGroups[dateKey][tab.sessionId] = []
//     }

//     dateGroups[dateKey][tab.sessionId].push(tab)
//   })

//   return Object.keys(dateGroups)
//     .map((dateKey) => {
//       const sessionGroups = dateGroups[dateKey]
//       return {
//         date: new Date(dateKey),
//         sessions: Object.keys(sessionGroups).map((sessionId) => {
//           const sessionTabs = sessionGroups[sessionId]
//           return {
//             id: sessionId,
//             name: sessionTabs[0].sessionName,
//             tabs: sessionTabs,
//           }
//         }),
//       }
//     })
//     .sort((a, b) => b.date.getTime() - a.date.getTime())
// }

// // Declare chrome API for use in non-chrome environments (e.g., development)
// declare global {
//   interface Window {
//     chrome: any
//   }
// }

// export default function TabManager() {
//   const [tabs, setTabs] = useState<TabItem[]>(sampleTabs)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [activeView, setActiveView] = useState("all")
//   const [selectedSession, setSelectedSession] = useState<string | null>(null)
//   const [selectedDate, setSelectedDate] = useState<string | null>(null)

//   // Filter tabs based on search query, selected session and date
//   const filteredTabs = tabs.filter((tab) => {
//     // Text search filter
//     const matchesSearch =
//       searchQuery === "" ||
//       tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       tab.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       tab.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

//     // Session filter
//     const matchesSession = selectedSession === null || tab.sessionId === selectedSession

//     // Date filter
//     const matchesDate = selectedDate === null || tab.createdAt.toDateString() === selectedDate

//     return matchesSearch && matchesSession && matchesDate
//   })

//   // Group tabs by date and session for the sidebar
//   const groupedTabs = groupTabsByDateAndSession(tabs)

//   // Group filtered tabs by date for the main view
//   const groupedFilteredTabs = groupTabsByDateAndSession(filteredTabs)

//   // Handle opening a tab
//   const handleOpenTab = (url: string) => {
//     if (typeof window !== "undefined" && window.chrome && window.chrome.tabs) {
//       window.chrome.tabs.create({ url })
//     } else {
//       window.open(url, "_blank") // Fallback for non-Chrome environments
//     }
//   }

//   // Handle deleting a tab
//   const handleDeleteTab = (id: string) => {
//     setTabs(tabs.filter((tab) => tab.id !== id))
//   }

//   // Format date for display
//   const formatDate = (date: Date) => {
//     const today = new Date()
//     const yesterday = new Date(today)
//     yesterday.setDate(yesterday.getDate() - 1)

//     if (date.toDateString() === today.toDateString()) {
//       return "Today"
//     } else if (date.toDateString() === yesterday.toDateString()) {
//       return "Yesterday"
//     } else {
//       return date.toLocaleDateString("en-US", {
//         weekday: "long",
//         month: "short",
//         day: "numeric",
//       })
//     }
//   }

//   // Handle session selection
//   const handleSessionSelect = (sessionId: string, dateString: string | null = null) => {
//     if (selectedSession === sessionId && selectedDate === dateString) {
//       // Deselect if already selected
//       setSelectedSession(null)
//       setSelectedDate(null)
//     } else {
//       setSelectedSession(sessionId)
//       setSelectedDate(dateString)
//     }
//   }

//   // Clear all filters
//   const clearFilters = () => {
//     setSearchQuery("")
//     setSelectedSession(null)
//     setSelectedDate(null)
//   }

//   return (
//     <SidebarProvider>
//       <div className="flex h-screen bg-cyber-background">
//         <Sidebar className="border-r border-cyber-border">
//           <SidebarHeader className="border-b border-cyber-border bg-cyber-darker">
//             <div className="flex items-center p-2">
//               <Bookmark className="h-5 w-5 mr-2 text-cyber-neon" />
//               <h1 className="text-lg font-semibold text-cyber-neon cyber-glow">NEOTABS</h1>
//             </div>
//           </SidebarHeader>
//           <SidebarContent className="bg-cyber-dark">
//             <SidebarGroup>
//               <SidebarGroupLabel className="text-cyber-neon">Sessions</SidebarGroupLabel>
//               <SidebarGroupContent>
//                 <SidebarMenu>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton
//                       onClick={clearFilters}
//                       isActive={!selectedSession && !selectedDate}
//                       className="hover:bg-cyber-darker hover:text-cyber-neon data-[active=true]:bg-cyber-darker data-[active=true]:text-cyber-neon"
//                     >
//                       <Calendar className="h-4 w-4 mr-2 text-cyber-neon" />
//                       <span>All Sessions</span>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>

//             {groupedTabs.map((dateGroup, dateIndex) => (
//               <Collapsible key={dateIndex} defaultOpen={dateIndex === 0}>
//                 <SidebarGroup>
//                   <CollapsibleTrigger className="w-full">
//                     <SidebarGroupLabel asChild>
//                       <div className="flex items-center justify-between w-full text-cyber-pink">
//                         <span>{formatDate(dateGroup.date)}</span>
//                         <ChevronDown className="h-4 w-4" />
//                       </div>
//                     </SidebarGroupLabel>
//                   </CollapsibleTrigger>
//                   <CollapsibleContent>
//                     <SidebarGroupContent>
//                       <SidebarMenu>
//                         {dateGroup.sessions.map((session) => (
//                           <SidebarMenuItem key={session.id}>
//                             <SidebarMenuButton
//                               onClick={() => handleSessionSelect(session.id, dateGroup.date.toDateString())}
//                               isActive={
//                                 selectedSession === session.id && selectedDate === dateGroup.date.toDateString()
//                               }
//                               className="hover:bg-cyber-darker hover:text-cyber-neon data-[active=true]:bg-cyber-darker data-[active=true]:text-cyber-neon"
//                             >
//                               <span>{session.name}</span>
//                               <Badge className="ml-auto bg-cyber-purple text-white">{session.tabs.length}</Badge>
//                             </SidebarMenuButton>
//                           </SidebarMenuItem>
//                         ))}
//                       </SidebarMenu>
//                     </SidebarGroupContent>
//                   </CollapsibleContent>
//                 </SidebarGroup>
//               </Collapsible>
//             ))}
//           </SidebarContent>
//           <SidebarFooter className="border-t border-cyber-border bg-cyber-darker p-2">
//             <Button
//               variant="outline"
//               size="sm"
//               className="w-full border-cyber-neon text-cyber-neon hover:bg-cyber-neon hover:text-cyber-dark"
//               onClick={clearFilters}
//             >
//               Clear Filters
//             </Button>
//           </SidebarFooter>
//         </Sidebar>

//         <div className="flex-1 overflow-auto bg-cyber-background">
//           <div className="w-full max-w-3xl mx-auto p-4">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center">
//                 <SidebarTrigger className="mr-2 text-cyber-neon hover:bg-cyber-darker" />
//                 <h1 className="text-2xl font-bold text-cyber-neon cyber-glow">
//                   {selectedSession ? tabs.find((t) => t.sessionId === selectedSession)?.sessionName : "All Tabs"}
//                 </h1>
//               </div>
//               <Button onClick={() => {}} size="sm" className="bg-cyber-neon text-cyber-dark hover:bg-cyber-neon/80">
//                 <Plus className="h-4 w-4 mr-2" />
//                 Save Current Tab
//               </Button>
//             </div>

//             <div className="flex items-center space-x-2 mb-6">
//               <div className="relative flex-1">
//                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-cyber-neon" />
//                 <Input
//                   type="search"
//                   placeholder="Search tabs..."
//                   className="pl-8 bg-cyber-darker border-cyber-border focus-visible:ring-cyber-neon"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     className="border-cyber-border text-cyber-neon hover:bg-cyber-darker hover:text-cyber-neon"
//                   >
//                     <Filter className="h-4 w-4" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="bg-cyber-darker border-cyber-border">
//                   <DropdownMenuItem
//                     onClick={() => setSearchQuery("dev")}
//                     className="hover:bg-cyber-dark hover:text-cyber-neon"
//                   >
//                     Development
//                   </DropdownMenuItem>
//                   <DropdownMenuItem
//                     onClick={() => setSearchQuery("design")}
//                     className="hover:bg-cyber-dark hover:text-cyber-neon"
//                   >
//                     Design
//                   </DropdownMenuItem>
//                   <DropdownMenuItem
//                     onClick={() => setSearchQuery("")}
//                     className="hover:bg-cyber-dark hover:text-cyber-neon"
//                   >
//                     Clear Filters
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>

//             <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveView}>
//               <TabsList className="grid w-full grid-cols-3 bg-cyber-darker">
//                 <TabsTrigger
//                   value="all"
//                   className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark"
//                 >
//                   All Tabs
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="recent"
//                   className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark"
//                 >
//                   Recent
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="tagged"
//                   className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark"
//                 >
//                   Tagged
//                 </TabsTrigger>
//               </TabsList>
//               <TabsContent value="all" className="mt-4">
//                 {groupedFilteredTabs.length > 0 ? (
//                   groupedFilteredTabs.map((group, groupIndex) => (
//                     <div key={groupIndex} className="mb-8">
//                       <div className="flex items-center mb-2">
//                         <Clock className="h-4 w-4 mr-2 text-cyber-pink" />
//                         <h2 className="text-sm font-medium text-cyber-pink cyber-pink-glow">
//                           {formatDate(group.date)}
//                         </h2>
//                       </div>
//                       {group.sessions.map((session) => (
//                         <div key={session.id} className="mb-4">
//                           <h3 className="text-sm font-medium ml-6 mb-2 text-cyber-neon">{session.name}</h3>
//                           <div className="space-y-2">
//                             {session.tabs.map((tab) => (
//                               <div
//                                 key={tab.id}
//                                 className="flex items-center p-3 rounded-md border border-cyber-border bg-cyber-dark hover:border-cyber-neon transition-colors"
//                               >
//                                 <div className="h-6 w-6 mr-3 relative flex-shrink-0 cyber-border rounded-sm">
//                                   <Image
//                                     src={tab.favicon || "/placeholder.svg"}
//                                     alt=""
//                                     fill
//                                     className="rounded-sm object-contain"
//                                     onError={(e) => {
//                                       // Fallback for failed favicon loads
//                                       e.currentTarget.src = "/placeholder.svg?height=24&width=24"
//                                     }}
//                                   />
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   <h3 className="font-medium text-sm truncate text-white">{tab.title}</h3>
//                                   <p className="text-xs text-muted-foreground truncate">{tab.url}</p>
//                                 </div>
//                                 <div className="flex items-center gap-1 ml-2">
//                                   {tab.tags.map((tag) => (
//                                     <Badge key={tag} variant="secondary" className="text-xs bg-cyber-purple text-white">
//                                       {tag}
//                                     </Badge>
//                                   ))}
//                                 </div>
//                                 <div className="flex items-center gap-1 ml-2">
//                                   <Button
//                                     size="icon"
//                                     variant="ghost"
//                                     onClick={() => handleOpenTab(tab.url)}
//                                     className="h-8 w-8 text-cyber-neon hover:bg-cyber-darker hover:text-cyber-neon"
//                                   >
//                                     <ExternalLink className="h-4 w-4" />
//                                     <span className="sr-only">Open tab</span>
//                                   </Button>
//                                   <Button
//                                     size="icon"
//                                     variant="ghost"
//                                     onClick={() => handleDeleteTab(tab.id)}
//                                     className="h-8 w-8 text-destructive hover:bg-cyber-darker hover:text-destructive"
//                                   >
//                                     <Trash2 className="h-4 w-4" />
//                                     <span className="sr-only">Delete tab</span>
//                                   </Button>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-center py-8 text-muted-foreground">
//                     No tabs found. Try a different search or filter.
//                   </div>
//                 )}
//               </TabsContent>
//               <TabsContent value="recent" className="mt-4">
//                 <div className="space-y-2">
//                   {filteredTabs
//                     .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
//                     .slice(0, 5)
//                     .map((tab) => (
//                       <div
//                         key={tab.id}
//                         className="flex items-center p-3 rounded-md border border-cyber-border bg-cyber-dark hover:border-cyber-neon transition-colors"
//                       >
//                         <div className="h-6 w-6 mr-3 relative flex-shrink-0 cyber-border rounded-sm">
//                           <Image
//                             src={tab.favicon || "/placeholder.svg"}
//                             alt=""
//                             fill
//                             className="rounded-sm object-contain"
//                             onError={(e) => {
//                               e.currentTarget.src = "/placeholder.svg?height=24&width=24"
//                             }}
//                           />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <h3 className="font-medium text-sm truncate text-white">{tab.title}</h3>
//                           <p className="text-xs text-muted-foreground truncate">{tab.url}</p>
//                         </div>
//                         <div className="flex items-center gap-1 ml-2">
//                           <Button
//                             size="icon"
//                             variant="ghost"
//                             onClick={() => handleOpenTab(tab.url)}
//                             className="h-8 w-8 text-cyber-neon hover:bg-cyber-darker hover:text-cyber-neon"
//                           >
//                             <ExternalLink className="h-4 w-4" />
//                             <span className="sr-only">Open tab</span>
//                           </Button>
//                           <Button
//                             size="icon"
//                             variant="ghost"
//                             onClick={() => handleDeleteTab(tab.id)}
//                             className="h-8 w-8 text-destructive hover:bg-cyber-darker hover:text-destructive"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                             <span className="sr-only">Delete tab</span>
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                 </div>
//               </TabsContent>
//               <TabsContent value="tagged" className="mt-4">
//                 <div className="flex flex-wrap gap-2 mb-4">
//                   {Array.from(new Set(tabs.flatMap((tab) => tab.tags))).map((tag) => (
//                     <Badge
//                       key={tag}
//                       variant={searchQuery === tag ? "default" : "outline"}
//                       className="cursor-pointer bg-cyber-purple border-cyber-neon text-white hover:bg-cyber-neon hover:text-cyber-dark"
//                       onClick={() => setSearchQuery(searchQuery === tag ? "" : tag)}
//                     >
//                       <Tag className="h-3 w-3 mr-1" />
//                       {tag}
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="space-y-2">
//                   {filteredTabs.map((tab) => (
//                     <div
//                       key={tab.id}
//                       className="flex items-center p-3 rounded-md border border-cyber-border bg-cyber-dark hover:border-cyber-neon transition-colors"
//                     >
//                       <div className="h-6 w-6 mr-3 relative flex-shrink-0 cyber-border rounded-sm">
//                         <Image
//                           src={tab.favicon || "/placeholder.svg"}
//                           alt=""
//                           fill
//                           className="rounded-sm object-contain"
//                           onError={(e) => {
//                             e.currentTarget.src = "/placeholder.svg?height=24&width=24"
//                           }}
//                         />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h3 className="font-medium text-sm truncate text-white">{tab.title}</h3>
//                         <p className="text-xs text-muted-foreground truncate">{tab.url}</p>
//                       </div>
//                       <div className="flex items-center gap-1 ml-2">
//                         {tab.tags.map((tag) => (
//                           <Badge key={tag} variant="secondary" className="text-xs bg-cyber-purple text-white">
//                             {tag}
//                           </Badge>
//                         ))}
//                       </div>
//                       <div className="flex items-center gap-1 ml-2">
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           onClick={() => handleOpenTab(tab.url)}
//                           className="h-8 w-8 text-cyber-neon hover:bg-cyber-darker hover:text-cyber-neon"
//                         >
//                           <ExternalLink className="h-4 w-4" />
//                           <span className="sr-only">Open tab</span>
//                         </Button>
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           onClick={() => handleDeleteTab(tab.id)}
//                           className="h-8 w-8 text-destructive hover:bg-cyber-darker hover:text-destructive"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                           <span className="sr-only">Delete tab</span>
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </TabsContent>
//             </Tabs>

//             <Dialog>
//               <DialogTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className="w-full border-cyber-neon text-cyber-neon hover:bg-cyber-neon hover:text-cyber-dark"
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Add Tab Manually
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="bg-cyber-dark border-cyber-border">
//                 <DialogHeader>
//                   <DialogTitle className="text-cyber-neon">Add New Tab</DialogTitle>
//                   <DialogDescription className="text-muted-foreground">
//                     Enter the details of the tab you want to save.
//                   </DialogDescription>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <label htmlFor="title" className="text-sm font-medium text-cyber-neon">
//                       Title
//                     </label>
//                     <Input
//                       id="title"
//                       placeholder="Tab title"
//                       className="bg-cyber-darker border-cyber-border focus-visible:ring-cyber-neon"
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <label htmlFor="url" className="text-sm font-medium text-cyber-neon">
//                       URL
//                     </label>
//                     <Input
//                       id="url"
//                       placeholder="https://example.com"
//                       className="bg-cyber-darker border-cyber-border focus-visible:ring-cyber-neon"
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <label htmlFor="session" className="text-sm font-medium text-cyber-neon">
//                       Session Name
//                     </label>
//                     <Input
//                       id="session"
//                       placeholder="Work Session"
//                       className="bg-cyber-darker border-cyber-border focus-visible:ring-cyber-neon"
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <label htmlFor="tags" className="text-sm font-medium text-cyber-neon">
//                       Tags (comma separated)
//                     </label>
//                     <Input
//                       id="tags"
//                       placeholder="work, research, important"
//                       className="bg-cyber-darker border-cyber-border focus-visible:ring-cyber-neon"
//                     />
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button type="submit" className="bg-cyber-neon text-cyber-dark hover:bg-cyber-neon/80">
//                     Save Tab
//                   </Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </div>
//       </div>
//     </SidebarProvider>
//   )
// }
