# Repository Pattern Implementation

## Overview

The Repository Pattern provides a standardized way to access data while abstracting away storage implementation details. This implementation allows you to switch between storage providers (LocalStorage, Chrome, Firebase, Server) at runtime while maintaining consistent error handling and response patterns.

## How It Actually Works (Step by Step)

### 1. App Launch

- No special setup needed
- StorageFactory loads user's storage preference from localStorage automatically
- Repositories are created on-demand when components need them

### 2. Component Usage

```typescript
// In any React component:
import { NewSessionsService } from "../services/NEWSERVICE";

const MyComponent = () => {
  const sessionService = new NewSessionsService(); // Creates fresh instance

  useEffect(() => {
    const loadData = async () => {
      const result = await sessionService.getSessions(); // Triggers the whole chain
      if (result.success) {
        setData(result.data);
      }
    };
    loadData();
  }, []);
};
```

### 3. Data Flow

```
Component → Service → Repository → BaseRepository → StorageFactory → Storage Provider → Data
```

**What happens when you call `sessionService.getSessions()`:**

1. **NewSessionsService** calls `repository.findAll()`
2. **SessionRepository** calls `BaseRepository.findAll()`
3. **BaseRepository** calls `StorageFactory.getStorageService()`
4. **StorageFactory** returns current storage (Local/Chrome/Firebase/Server)
5. **Storage Provider** fetches the data
6. **SessionRepository** deserializes raw data into Session objects
7. **NewSessionsService** formats result for UI

### 4. Storage Provider Switching

When user changes storage preference:

- StorageFactory automatically returns the new provider
- No code changes needed - repositories adapt automatically
- Same component code works with any storage type

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

## Key Files

### BaseRepository.ts

- Abstract base class with standardized CRUD operations
- Handles error wrapping and storage provider switching
- All concrete repositories extend this

### SessionRepository.ts / TaskRepository.ts

- Concrete implementations for specific entities
- Handle entity-specific serialization/deserialization
- Validate entity data

### NewSessionsService.ts / NewTasksService.ts

- Business logic layer that wraps repositories
- Provides UI-friendly error messages and response formats
- Where you add domain-specific methods

## Why SessionCreateDto Has Tabs

Sessions capture browser state - that's their purpose:

```typescript
interface SessionCreateDto {
  name: string; // "Work Session"
  description?: string; // "Monday morning work"
  tabs: Tab[]; // The actual browser tabs to save
}
```

When you save a session, you're capturing the tabs you currently have open.

## Usage Examples

### Simple Usage

```typescript
// Create service instance
const sessionService = new NewSessionsService();

// Get all sessions
const result = await sessionService.getSessions();
if (result.success) {
  console.log("Sessions:", result.data);
} else {
  console.error("Error:", result.error);
}

// Create a new session
const newResult = await sessionService.createSession({
  name: "Work Session",
  description: "Monday morning work",
  tabs: currentTabs,
});
```

### Migration from Existing Services

```typescript
// OLD WAY (existing code):
const sessions = await SessionController.getSessions();

// NEW WAY (repository pattern):
const sessionService = new NewSessionsService();
const result = await sessionService.getSessions();
const sessions = result.success ? result.data : [];
```

## Benefits

1. **No Setup Required** - Just import and use, works with your existing storage
2. **Standardized Error Handling** - All operations return consistent success/error info
3. **Storage Switching** - Same code works with any storage provider
4. **Type Safety** - Full TypeScript support
5. **Easy Migration** - Use alongside existing services, switch gradually

## Files in This Folder

- **BaseRepository.ts** - Abstract base class with CRUD operations
- **TaskRepository.ts** - Task entity repository
- **SessionRepository.ts** - Session entity repository
- **NewTasksService.ts** - Business logic service for tasks
- **NewSessionsService.ts** - Business logic service for sessions
- **index.ts** - Easy imports for everything
