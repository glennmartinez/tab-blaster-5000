import { SessionInterface } from "../SessionInterface";
import { StorageFactory } from "../StorageFactory";

// Custom error types for better error handling
export class RepositoryError extends Error {
  constructor(
    message: string,
    public context: Record<string, unknown>,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class RepositoryAuthError extends RepositoryError {
  constructor(
    message: string,
    context: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message, context, originalError);
    this.name = "RepositoryAuthError";
  }
}

export class RepositoryNetworkError extends RepositoryError {
  constructor(
    message: string,
    context: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message, context, originalError);
    this.name = "RepositoryNetworkError";
  }
}

// Result wrapper for consistent response patterns
export interface RepositoryResult<T> {
  success: boolean;
  data?: T;
  error?: {
    type: string;
    message: string;
    context: Record<string, unknown>;
  };
  metadata: {
    provider: string;
    operation: string;
    timestamp: Date;
    duration?: number;
  };
}

// Options for repository operations
export interface RepositoryOptions<T = unknown> {
  fallback?: T;
  skipValidation?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Base Repository class that provides standardized CRUD operations
 *
 * Unlike Java where you might inject serializers, here we use abstract methods
 * that concrete repositories must implement for their specific entity types.
 */
export abstract class BaseRepository<
  TEntity,
  TCreateDto = Omit<TEntity, "id" | "createdAt" | "updatedAt">
> {
  // Abstract properties that concrete repositories must define
  protected abstract readonly entityName: string;
  protected abstract readonly storageKey: string;

  // Abstract methods for entity-specific logic (like your Java serializers)
  protected abstract deserialize(data: unknown): TEntity | null;
  protected abstract serialize(entity: TEntity): unknown;
  protected abstract createEntity(dto: TCreateDto): TEntity;
  protected abstract getId(entity: TEntity): string;
  protected abstract validateEntity(entity: TEntity): boolean;

  // Get storage dynamically (not singleton due to your runtime switching requirement)
  protected getStorage(): SessionInterface {
    return StorageFactory.getStorageService();
  }

  /**
   * Find all entities
   */
  async findAll(
    options: RepositoryOptions<TEntity[]> = {}
  ): Promise<RepositoryResult<TEntity[]>> {
    const startTime = Date.now();
    const operation = "findAll";

    try {
      console.log(`🔍 ${this.entityName}Repository.${operation}() - Starting`);

      const storage = this.getStorage();
      const rawData = await storage.get(this.storageKey);
      const dataArray = (rawData[this.storageKey] as unknown[]) || [];

      console.log(
        `📊 Retrieved ${dataArray.length} raw ${this.entityName} records`
      );

      // Deserialize each item, filtering out invalid ones
      const entities = dataArray
        .map((item) => {
          try {
            return this.deserialize(item);
          } catch (error) {
            console.warn(
              `⚠️ Failed to deserialize ${this.entityName}:`,
              error,
              item
            );
            return null;
          }
        })
        .filter((entity): entity is TEntity => entity !== null);

      console.log(
        `✅ Successfully deserialized ${entities.length} ${this.entityName} entities`
      );

      return {
        success: true,
        data: entities,
        metadata: {
          provider: storage.constructor.name,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(
        error,
        operation,
        options.fallback || [],
        startTime
      );
    }
  }

  /**
   * Find entity by ID
   */
  async findById(
    id: string,
    options: RepositoryOptions<TEntity> = {}
  ): Promise<RepositoryResult<TEntity | null>> {
    const startTime = Date.now();
    const operation = "findById";

    try {
      console.log(
        `🔍 ${this.entityName}Repository.${operation}(${id}) - Starting`
      );

      const allEntitiesResult = await this.findAll();
      if (!allEntitiesResult.success || !allEntitiesResult.data) {
        throw new Error("Failed to fetch entities for findById");
      }

      const entity =
        allEntitiesResult.data.find((item) => this.getId(item) === id) || null;

      console.log(
        `${entity ? "✅" : "⚠️"} ${this.entityName} ${id} ${
          entity ? "found" : "not found"
        }`
      );

      return {
        success: true,
        data: entity,
        metadata: {
          provider: allEntitiesResult.metadata.provider,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(
        error,
        operation,
        options.fallback || null,
        startTime
      );
    }
  }

  /**
   * Create new entity
   */
  async create(
    dto: TCreateDto,
    options: RepositoryOptions<TEntity> = {}
  ): Promise<RepositoryResult<TEntity>> {
    const startTime = Date.now();
    const operation = "create";

    try {
      console.log(`🆕 ${this.entityName}Repository.${operation}() - Starting`);

      // Create the entity using the abstract method
      const newEntity = this.createEntity(dto);

      // Validate if not skipped
      if (!options.skipValidation && !this.validateEntity(newEntity)) {
        throw new Error(`Invalid ${this.entityName} entity`);
      }

      // Get all existing entities and add the new one
      const allEntitiesResult = await this.findAll();
      if (!allEntitiesResult.success || !allEntitiesResult.data) {
        throw new Error("Failed to fetch existing entities");
      }

      const entities = [...allEntitiesResult.data, newEntity];
      await this.saveAll(entities);

      console.log(
        `✅ Created ${this.entityName} with ID: ${this.getId(newEntity)}`
      );

      return {
        success: true,
        data: newEntity,
        metadata: {
          provider: allEntitiesResult.metadata.provider,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      const context = {
        entity: this.entityName,
        operation,
        provider: this.getStorage().constructor.name,
      };

      if (error instanceof Error && error.message.includes("Authentication")) {
        throw new RepositoryAuthError(
          `${this.entityName} ${operation} failed`,
          context,
          error
        );
      }

      throw new RepositoryError(
        `${this.entityName} ${operation} failed`,
        context,
        error
      );
    }
  }

  /**
   * Update existing entity
   */
  async update(
    id: string,
    updates: Partial<TEntity>,
    options: RepositoryOptions<TEntity> = {}
  ): Promise<RepositoryResult<TEntity | null>> {
    const startTime = Date.now();
    const operation = "update";

    try {
      console.log(
        `📝 ${this.entityName}Repository.${operation}(${id}) - Starting`
      );

      const allEntitiesResult = await this.findAll();
      if (!allEntitiesResult.success || !allEntitiesResult.data) {
        throw new Error("Failed to fetch entities for update");
      }

      const entities = [...allEntitiesResult.data];
      const entityIndex = entities.findIndex(
        (entity) => this.getId(entity) === id
      );

      if (entityIndex === -1) {
        console.warn(
          `⚠️ ${this.entityName} with ID ${id} not found for update`
        );
        return {
          success: true,
          data: null,
          metadata: {
            provider: allEntitiesResult.metadata.provider,
            operation,
            timestamp: new Date(),
            duration: Date.now() - startTime,
          },
        };
      }

      // Update the entity
      const updatedEntity = {
        ...entities[entityIndex],
        ...updates,
        updatedAt: new Date(), // Assuming entities have updatedAt
      } as TEntity;

      // Validate if not skipped
      if (!options.skipValidation && !this.validateEntity(updatedEntity)) {
        throw new Error(`Updated ${this.entityName} entity is invalid`);
      }

      entities[entityIndex] = updatedEntity;
      await this.saveAll(entities);

      console.log(`✅ Updated ${this.entityName} with ID: ${id}`);

      return {
        success: true,
        data: updatedEntity,
        metadata: {
          provider: allEntitiesResult.metadata.provider,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(
        error,
        operation,
        options.fallback || null,
        startTime
      );
    }
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<RepositoryResult<boolean>> {
    const startTime = Date.now();
    const operation = "delete";

    try {
      console.log(
        `🗑️ ${this.entityName}Repository.${operation}(${id}) - Starting`
      );

      const allEntitiesResult = await this.findAll();
      if (!allEntitiesResult.success || !allEntitiesResult.data) {
        throw new Error("Failed to fetch entities for delete");
      }

      const entities = allEntitiesResult.data;
      const initialLength = entities.length;
      const filteredEntities = entities.filter(
        (entity) => this.getId(entity) !== id
      );

      if (filteredEntities.length === initialLength) {
        console.warn(
          `⚠️ ${this.entityName} with ID ${id} not found for deletion`
        );
        return {
          success: true,
          data: false,
          metadata: {
            provider: allEntitiesResult.metadata.provider,
            operation,
            timestamp: new Date(),
            duration: Date.now() - startTime,
          },
        };
      }

      await this.saveAll(filteredEntities);
      console.log(`✅ Deleted ${this.entityName} with ID: ${id}`);

      return {
        success: true,
        data: true,
        metadata: {
          provider: allEntitiesResult.metadata.provider,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(error, operation, false, startTime);
    }
  }

  /**
   * Save all entities to storage
   */
  protected async saveAll(entities: TEntity[]): Promise<void> {
    const storage = this.getStorage();
    const serializedEntities = entities.map((entity) => this.serialize(entity));

    await storage.set({
      [this.storageKey]: serializedEntities,
    });
  }

  /**
   * Standardized error handling
   */
  protected handleError<T>(
    error: unknown,
    operation: string,
    fallback: T,
    startTime: number
  ): RepositoryResult<T> {
    const context = {
      entity: this.entityName,
      operation,
      provider: this.getStorage().constructor.name,
    };

    console.error(
      `❌ ${this.entityName}Repository.${operation}() failed:`,
      error,
      context
    );

    // Determine error type
    let errorType = "StorageError";
    if (error instanceof Error) {
      if (
        error.message.includes("Authentication") ||
        error.message.includes("401")
      ) {
        errorType = "AuthenticationError";
      } else if (
        error.message.includes("Network") ||
        error.message.includes("fetch")
      ) {
        errorType = "NetworkError";
      }
    }

    return {
      success: false,
      data: fallback,
      error: {
        type: errorType,
        message: error instanceof Error ? error.message : String(error),
        context,
      },
      metadata: {
        provider: context.provider,
        operation,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      },
    };
  }
}
