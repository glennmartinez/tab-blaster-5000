# Repository Pattern - Complete Explanation

## Understanding the Repository Pattern

The Repository Pattern is a design pattern that encapsulates data access logic and provides a uniform interface for accessing domain objects. Think of it as a "collection of objects in memory" - but the objects are actually stored in various storage systems.

### Java vs TypeScript Comparison

**Java Spring Data Example:**

```java
@Entity
public class Task {
    @Id
    private String id;
    private String title;
    // ... other fields
}

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByStatus(String status);
    // Spring generates the implementation automatically
}

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;

    public List<Task> getTasks() {
        return taskRepository.findAll(); // Spring handles serialization
    }
}
```

**Our TypeScript Implementation:**

```typescript
// Entity interface
interface Task extends BaseEntity {
  title: string;
  // ... other fields
}

// Repository class (we implement manually)
class TaskRepository extends BaseRepository<Task> {
  // We manually implement serialize/deserialize
  protected deserialize(data: unknown): Task | null {
    /* ... */
  }
  protected serialize(entity: Task): unknown {
    /* ... */
  }
  protected createEntity(dto: CreateDto<Task>): Task {
    /* ... */
  }
}

// Service class
class TaskService {
  private taskRepository = new TaskRepository();

  async getTasks(): Promise<Task[]> {
    const result = await this.taskRepository.findAll();
    return result.data || [];
  }
}
```

## Key Differences from Your Current Setup

### Current Architecture:

```
TasksService ──> StorageFactory ──> ServerStorageService ──> Raw API
     │                                      │
     └── Manual serialization              └── Manual error handling
     └── Manual error handling             └── Direct JSON response
```

### Repository Architecture:

```
TaskService ──> TaskRepository ──> BaseRepository ──> StorageFactory ──> ServerStorageService
     │               │                    │                                      │
     │               │                    └── Standardized error handling       │
     │               └── Entity-specific serialization                          │
     └── Business logic only                                                     └── Raw API
```

## How Storage Provider Switching Works

### Your Current System:

```typescript
// StorageFactory checks settings and returns appropriate provider
const storage = StorageFactory.getStorageService();
// Returns: LocalStorageService | ChromeStorageService | ServerStorageService | etc.

// When user changes storage type:
StorageFactory.setPreferredStorageType(StorageType.SERVER);
// Next call to getStorageService() returns ServerStorageService
```

### With Repository Pattern:

```typescript
// Repository gets storage through factory (same as before)
class BaseRepository<T> {
  constructor() {
    this.storage = StorageFactory.getStorageService(); // Your existing factory!
  }
}

// When storage changes, repository adapts automatically:
// User changes setting → StorageFactory switches provider → Repository uses new provider
// No code changes needed in TaskService or components!
```

## Error Handling Standardization

### Current (Inconsistent):

```typescript
// TasksService - throws errors
async getTasks(): Promise<Task[]> {
    try {
        const data = await storage.get(STORAGE_KEYS.TASKS);
        return this.deserializeData(data);
    } catch (error) {
        console.error("Error:", error);
        return []; // Sometimes returns empty array
    }
}

// FocusSessionService - returns null
async getCurrentSession(): Promise<FocusSession | null> {
    try {
        const data = await storage.get(key);
        return data;
    } catch (error) {
        console.error("Error:", error);
        return null; // Sometimes returns null
    }
}
```

### New (Standardized):

```typescript
// All repositories return RepositoryResult<T>
async getTasks(): Promise<RepositoryResult<Task[]>> {
    // BaseRepository handles all errors consistently
    return this.taskRepository.findAll();
    // Always returns: { success: boolean, data?: T[], error?: RepositoryError, metadata: {...} }
}

// Service layer decides how to handle errors for UI
async getTasksForUI(): Promise<Task[]> {
    const result = await this.taskRepository.findAll();

    if (!result.success) {
        // Log error with rich context
        console.error('Task loading failed:', {
            error: result.error,
            provider: result.metadata.provider,
            duration: result.metadata.duration
        });
        return []; // Consistent fallback
    }

    return result.data || [];
}
```

## Migration Example

Let me show you how to migrate your FocusSessionService step by step:

### Step 1: Create FocusSession entity that extends BaseEntity

```typescript
// If your current FocusSession doesn't have createdAt/updatedAt:
interface FocusSessionEntity extends BaseEntity {
  taskId: string;
  startTime: Date;
  endTime?: Date;
  totalMinutes: number;
  // Inherit: id, createdAt, updatedAt from BaseEntity
}
```

### Step 2: Create FocusSessionRepository

```typescript
class FocusSessionRepository extends BaseRepository<FocusSessionEntity> {
  protected deserialize(data: unknown): FocusSessionEntity | null {
    // Convert storage data to FocusSessionEntity
  }

  protected serialize(entity: FocusSessionEntity): unknown {
    // Convert FocusSessionEntity to storage format
  }

  protected createEntity(
    dto: CreateDto<FocusSessionEntity>
  ): FocusSessionEntity {
    // Add id, createdAt, updatedAt to DTO
  }
}
```

### Step 3: Create NewFocusSessionService

```typescript
class NewFocusSessionService {
  private repository = new FocusSessionRepository();

  async startFocusSession(taskId: string): Promise<FocusSessionEntity> {
    const result = await this.repository.create({
      taskId,
      startTime: new Date(),
      totalMinutes: 0,
    });

    if (!result.success) {
      throw new Error(
        `Failed to start focus session: ${result.error?.message}`
      );
    }

    return result.data!;
  }
}
```

## Benefits Over Current System

1. **Consistent Error Handling**: Every operation returns rich error context
2. **Storage Agnostic**: Same code works with LocalStorage, Chrome, Firebase, or Server
3. **Type Safety**: Full generics ensure compile-time safety
4. **DRY**: No repeated serialization/deserialization code
5. **Testability**: Easy to mock repositories
6. **Performance Tracking**: Built-in timing and metadata
7. **Runtime Flexibility**: Maintains your storage switching capability

## Working with Your Existing StorageFactory

The repository pattern **enhances** your existing StorageFactory rather than replacing it:

```typescript
// Your StorageFactory remains unchanged:
export class StorageFactory {
  static getStorageService(): SessionInterface {
    // Your existing logic for provider selection
  }
}

// Repositories use your factory:
class BaseRepository<T> {
  constructor() {
    this.storage = StorageFactory.getStorageService(); // Uses YOUR factory
  }
}

// When you change storage settings:
StorageFactory.setPreferredStorageType(StorageType.SERVER);
// Repositories automatically use the new provider!
```

The beauty is that your **existing StorageFactory logic remains exactly the same** - the repository pattern just adds a standardized layer on top of it.

Would you like me to create a specific repository for any of your other entities, or would you prefer to see how to migrate one of your existing services?
