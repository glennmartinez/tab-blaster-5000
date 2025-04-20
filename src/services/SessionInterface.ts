import { Session } from "../models/Session";

export interface SessionInterface {
  fetchSessions(): Promise<Session[]>;
  storeSession(session: Session): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  fetchSessionById(sessionId: string): Promise<Session | null>;
}
