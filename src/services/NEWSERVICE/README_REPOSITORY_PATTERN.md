# Repository Pattern Implementation

## Overview

The Repository Pattern provides a standardized way to access data while abstracting away storage implementation details. This implementation allows you to switch between storage providers (LocalStorage, Chrome, Firebase, Server) at runtime while maintaining consistent error handling and response patterns.

## Architecture

```
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Storage Factory (Provider Selection)
    ↓
Storage Providers (LocalStorage, Chrome, Firebase, Server)
```

## How It Works

### 1. Base Repository (`BaseRepositoryClean.ts`)

This is the abstract base class that all entity repositories extend. It provides:

- **Standardized CRUD operations**: `findAll()`, `findById()`, `create()`, `update()`, `delete()`
- **Error handling**: Wraps all errors in `RepositoryResult<T>` with metadata
- **Storage abstraction**: Uses `StorageFactory` to get the current storage provider
- **Type safety**: Generic `<TEntity extends BaseEntity>` ensures type safety

### 2. Concrete Repository (`TaskRepository.ts`)

Each entity (Task, Session, etc.) gets its own repository that implements:

```typescript
// These are the methods you must implement (like Java abstract methods)
protected abstract deserialize(data: unknown): TEntity | null;
protected abstract serialize(entity: TEntity): unknown;
protected abstract createEntity(dto: CreateDto<TEntity>): TEntity;
```

**Example for Tasks:**

```typescript
protected deserialize(data: unknown): Task | null {
  // Convert raw storage data → Task object
  // Handle dates, validate fields, set defaults
}

protected serialize(entity: Task): unknown {
  // Convert Task object → storage format
  // Convert dates to ISO strings, prepare for JSON
}

protected createEntity(dto: CreateDto<Task>): Task {
  // Convert DTO → full Task entity
  // Add id, createdAt, updatedAt fields
}
```

### 3. Service Layer (`NewTasksService.ts`)

The service wraps the repository and provides:

- **Business logic**: Validation, complex operations
- **Error handling for UI**: Converts repository errors to user-friendly responses
- **Caching and optimization**: Can add caching logic here
- **Domain-specific methods**: Like `moveTaskToStatus()`, `getTaskStats()`

## Response Pattern

All repository operations return `RepositoryResult<T>`:

```typescript
interface RepositoryResult<T> {
  success: boolean; // Operation succeeded?
  data?: T; // The actual data (if success)
  error?: RepositoryError; // Error details (if failed)
  metadata: {
    // Operation metadata
    operation: string; // What operation was performed
    entityType: string; // What entity type
    timestamp: Date; // When it happened
    provider: string; // Which storage provider
    duration?: number; // How long it took
    context?: any; // Additional context
  };
}
```

## Storage Provider Integration

### Current StorageFactory Behavior:

```typescript
// Your current factory checks at runtime:
StorageFactory.getStorageService();
// Returns: LocalStorageService | ChromeStorageService | FirebaseStorageService | ServerStorageService
```

### Repository Integration:

```typescript
// Repository gets fresh storage instance each time:
this.storage = StorageFactory.getStorageService();

// When storage type changes at runtime:
service.refreshStorage(); // Gets new storage provider
```

## Usage Examples

### Current Way (TasksService):

```typescript
// Direct storage access with manual error handling
async getTasks(): Promise<Task[]> {
  try {
    const storage = this.getStorage();
    const data = await storage.get(STORAGE_KEYS.TASKS);
    // Manual deserialization...
    // Manual error handling...
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}
```

### New Way (Repository Pattern):

```typescript
// Standardized access with automatic error handling
async getTasks(): Promise<Task[]> {
  const result = await this.taskRepository.findAll();

  if (!result.success) {
    // Standardized error with context
    console.error('Failed to load tasks:', result.error);
    return [];
  }

  return result.data || [];
}
```

## Migration Strategy

### Phase 1: Add Repository Alongside Existing Service

```typescript
// Keep existing TasksService working
export class TasksService {
  // Current implementation
}

// Add new repository-based service
export class NewTasksService {
  // Repository-based implementation
}
```

### Phase 2: Gradually Replace Calls

```typescript
// In components, switch one method at a time:
// OLD: const tasks = await tasksService.getTasks();
// NEW: const tasks = await newTasksService.getTasks();
```

### Phase 3: Remove Old Service

Once all components use the new service, remove the old one.

## Benefits

1. **Standardized Error Handling**: All storage operations return consistent error information
2. **Storage Provider Agnostic**: Same code works with any storage provider
3. **Type Safety**: Full TypeScript generics ensure compile-time safety
4. **Metadata Rich**: Every operation includes timing, provider, context information
5. **DRY Principle**: Common CRUD logic in base class, entity-specific logic in concrete repositories
6. **Testable**: Easy to mock repositories for unit testing
7. **Runtime Storage Switching**: Can change storage providers without restarting app

## Compared to Java Spring Data

| Java Spring Data            | This TypeScript Implementation               |
| --------------------------- | -------------------------------------------- |
| `@Entity` classes           | `BaseEntity` interface                       |
| `JpaRepository<Entity, ID>` | `BaseRepository<TEntity>`                    |
| `@Service` classes          | Service classes (like `NewTasksService`)     |
| Automatic serialization     | Manual `serialize()`/`deserialize()` methods |
| Exception handling          | `RepositoryResult<T>` wrapper                |
| `@Transactional`            | Can add transaction support later            |

## Next Steps

1. Test the Task repository implementation
2. Create repositories for other entities (Session, FocusSession, etc.)
3. Gradually migrate existing services to use repositories
4. Add caching and performance optimizations
5. Add transaction support if needed

## Storage Provider Switching

The repository pattern preserves your current runtime storage switching capability:

```typescript
// User changes storage provider in settings
StorageFactory.setPreferredStorageType(StorageType.SERVER);

// Services automatically use new provider
service.refreshStorage(); // Optional - gets new storage instance
const tasks = await service.getTasks(); // Now uses server storage
```

This maintains your current flexibility while providing much better structure and error handling.
