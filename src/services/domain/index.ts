// Repository Pattern Implementation - Clean and Organized
// This folder contains the improved repository pattern for data access

// Base repository class and types
export * from "../repositories/BaseRepository";

// Concrete repository implementations
export { TaskRepository } from "../repositories/TaskRepository";
export { FocusSessionRepository } from "../repositories/FocusSessionRepository";
export { DisruptionRepository } from "../repositories/DisruptionRepository";
export { SessionAnalyticsRepository } from "../repositories/SessionAnalyticsRepository";

// Service implementations using repositories
export { NewTasksService, newTasksService } from "./NewTasksService";
export {
  NewFocusSessionService,
  newFocusSessionService,
} from "./NewFocusSessionService";
export {
  NewDisruptionService,
  newDisruptionService,
} from "./NewDisruptionService";
export {
  NewSessionAnalyticsService,
  newSessionAnalyticsService,
} from "./NewSessionAnalyticsService";

/**
 * Quick Start Guide:
 *
 * 1. Import the service you want to use:
 *    import { NewTasksService, NewFocusSessionService, NewDisruptionService, NewSessionAnalyticsService } from './services/domain';
 *
 * 2. Create an instance and use it:
 *    const tasksService = new NewTasksService();
 *    const focusService = new NewFocusSessionService();
 *    const disruptionService = new NewDisruptionService();
 *    const analyticsService = new NewSessionAnalyticsService();
 *    const tasks = await tasksService.getTasks();
 *
 * 3. The service automatically uses your current StorageFactory settings
 *
 * 4. All operations return standardized RepositoryResult<T> with error info
 *
 * 5. Gradually replace existing service calls with repository-based ones
 *
 * Services available:
 * - NewTasksService: Task management using TaskRepository
 * - NewFocusSessionService: Focus session tracking using FocusSessionRepository
 * - NewDisruptionService: Disruption tracking and analytics using DisruptionRepository
 * - NewSessionAnalyticsService: Session analytics using SessionAnalyticsRepository
 */
