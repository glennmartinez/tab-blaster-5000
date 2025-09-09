// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";
// import { ServerSessionService } from "../services/NEWSERVICE/ServerSessionService";
// import { SimpleAuthService } from "../services/SimpleAuthService";
// import { Session } from "../models/Session";
// import { Tab } from "../interfaces/TabInterface";

// interface User {
//   uid: string;
//   email?: string;
//   displayName?: string;
// }

// interface ServerServicesContextType {
//   sessionService: ServerSessionService;
//   isAuthenticated: boolean;
//   isInitialized: boolean;
//   user: User | null;
//   authService: SimpleAuthService;
// }

// const ServerServicesContext = createContext<ServerServicesContextType | null>(
//   null
// );

// interface ServerServicesProviderProps {
//   children: ReactNode;
// }

// /**
//  * Server Services Provider
//  * Provides server-based repository services throughout the app
//  * Use this instead of StorageFactory when you want direct server communication
//  */
// export function ServerServicesProvider({
//   children,
// }: ServerServicesProviderProps) {
//   const [sessionService] = useState(() => new ServerSessionService());
//   const [authService] = useState(() => SimpleAuthService.getInstance());
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     let isMounted = true;

//     const initializeAuth = async () => {
//       try {
//         console.log(
//           "🔐 ServerServicesProvider: Initializing authentication..."
//         );

//         // Check current authentication state
//         const currentUser = await authService.getCurrentUser();

//         if (isMounted) {
//           if (currentUser) {
//             console.log(
//               "✅ ServerServicesProvider: User authenticated",
//               currentUser
//             );
//             setUser(currentUser as User);
//             setIsAuthenticated(true);
//           } else {
//             console.log("❌ ServerServicesProvider: No authenticated user");
//             setUser(null);
//             setIsAuthenticated(false);
//           }
//           setIsInitialized(true);
//         }
//       } catch (error) {
//         console.error(
//           "💥 ServerServicesProvider: Auth initialization failed:",
//           error
//         );
//         if (isMounted) {
//           setUser(null);
//           setIsAuthenticated(false);
//           setIsInitialized(true);
//         }
//       }
//     };

//     initializeAuth();

//     return () => {
//       isMounted = false;
//     };
//   }, [authService]);

//   const contextValue: ServerServicesContextType = {
//     sessionService,
//     isAuthenticated,
//     isInitialized,
//     user,
//     authService,
//   };

//   return (
//     <ServerServicesContext.Provider value={contextValue}>
//       {children}
//     </ServerServicesContext.Provider>
//   );
// }

// /**
//  * Hook to access server-based services
//  */
// export function useServerServices(): ServerServicesContextType {
//   const context = useContext(ServerServicesContext);

//   if (!context) {
//     throw new Error(
//       "useServerServices must be used within a ServerServicesProvider"
//     );
//   }

//   return context;
// }

// /**
//  * Hook specifically for server-based sessions
//  */
// export function useServerSessions() {
//   const { sessionService, isAuthenticated, isInitialized } =
//     useServerServices();
//   const [sessions, setSessions] = useState<Session[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Load sessions when authenticated
//   const loadSessions = React.useCallback(async () => {
//     if (!isAuthenticated) {
//       setSessions([]);
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const result = await sessionService.getSessions();

//       if (result.success) {
//         setSessions(result.data || []);
//       } else {
//         setError(result.error || "Failed to load sessions");
//         setSessions([]);
//       }
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : "Unknown error";
//       setError(errorMessage);
//       setSessions([]);
//       console.error("Failed to load server sessions:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [sessionService, isAuthenticated]);

//   // Load sessions when authentication changes
//   useEffect(() => {
//     if (isInitialized) {
//       loadSessions();
//     }
//   }, [isInitialized, isAuthenticated, loadSessions]);

//   // Create session
//   const createSession = React.useCallback(
//     async (sessionData: {
//       name: string;
//       description?: string;
//       tabs: Tab[];
//     }) => {
//       const result = await sessionService.createSession(sessionData);

//       if (result.success) {
//         await loadSessions(); // Refresh the list
//         return result.data;
//       } else {
//         throw new Error(result.error || "Failed to create session");
//       }
//     },
//     [sessionService, loadSessions]
//   );

//   // Update session
//   const updateSession = React.useCallback(
//     async (
//       id: string,
//       updates: {
//         name?: string;
//         description?: string;
//         tabs?: Tab[];
//       }
//     ) => {
//       const result = await sessionService.updateSession(id, updates);

//       if (result.success) {
//         await loadSessions(); // Refresh the list
//         return result.data;
//       } else {
//         throw new Error(result.error || "Failed to update session");
//       }
//     },
//     [sessionService, loadSessions]
//   );

//   // Delete session
//   const deleteSession = React.useCallback(
//     async (id: string) => {
//       const result = await sessionService.deleteSession(id);

//       if (result.success) {
//         await loadSessions(); // Refresh the list
//       } else {
//         throw new Error(result.error || "Failed to delete session");
//       }
//     },
//     [sessionService, loadSessions]
//   );

//   // Search sessions
//   const searchSessions = React.useCallback(
//     async (query: string) => {
//       const result = await sessionService.searchSessions(query);

//       if (result.success) {
//         return result.data || [];
//       } else {
//         throw new Error(result.error || "Failed to search sessions");
//       }
//     },
//     [sessionService]
//   );

//   return {
//     sessions,
//     loading,
//     error,
//     loadSessions,
//     createSession,
//     updateSession,
//     deleteSession,
//     searchSessions,
//     isAuthenticated,
//   };
// }
