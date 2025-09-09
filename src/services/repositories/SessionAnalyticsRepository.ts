import { STORAGE_KEYS } from "../../constants/storageKeys";
import { BaseRepository, RepositoryResult } from "./BaseRepository";

// Interface for session tab analytics
export interface SessionTabAnalytics {
  url: string;
  title: string;
  visitCount: number;
  lastAccess: Date | null;
  sessionNames: string[];
}

// Interface for aggregated session analytics
export interface SessionAnalyticsData {
  id: string; // url-based ID for tab analytics
  url: string;
  title: string;
  visitCount: number;
  lastAccess: Date | null;
  sessionNames: string[];
  updatedAt: Date;
}

// Type for creating new analytics entries
export type SessionAnalyticsCreateDto = Omit<
  SessionAnalyticsData,
  "id" | "updatedAt"
>;

export class SessionAnalyticsRepository extends BaseRepository<
  SessionAnalyticsData,
  SessionAnalyticsCreateDto
> {
  protected readonly entityName = "SessionAnalytics";
  protected readonly storageKey = STORAGE_KEYS.SESSION_ANALYTICS;

  protected deserialize(data: unknown): SessionAnalyticsData | null {
    try {
      if (!data || typeof data !== "object") {
        return null;
      }

      const analyticsData = data as Record<string, unknown>;

      const analytics: SessionAnalyticsData = {
        id: analyticsData.id as string,
        url: analyticsData.url as string,
        title: analyticsData.title as string,
        visitCount: analyticsData.visitCount as number,
        lastAccess: analyticsData.lastAccess
          ? new Date(analyticsData.lastAccess as string)
          : null,
        sessionNames: (analyticsData.sessionNames as string[]) || [],
        updatedAt: new Date(analyticsData.updatedAt as string),
      };

      return analytics;
    } catch (error) {
      console.error("Error deserializing session analytics:", error, data);
      return null;
    }
  }

  protected serialize(entity: SessionAnalyticsData): unknown {
    return {
      id: entity.id,
      url: entity.url,
      title: entity.title,
      visitCount: entity.visitCount,
      lastAccess: entity.lastAccess?.toISOString() || null,
      sessionNames: entity.sessionNames,
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  protected createEntity(dto: SessionAnalyticsCreateDto): SessionAnalyticsData {
    return {
      id: this.generateUrlId(dto.url),
      url: dto.url,
      title: dto.title,
      visitCount: dto.visitCount,
      lastAccess: dto.lastAccess,
      sessionNames: dto.sessionNames,
      updatedAt: new Date(),
    };
  }

  protected getId(entity: SessionAnalyticsData): string {
    return entity.id;
  }

  protected validateEntity(entity: SessionAnalyticsData): boolean {
    return !!(
      entity.id &&
      entity.url &&
      entity.title &&
      typeof entity.visitCount === "number" &&
      Array.isArray(entity.sessionNames)
    );
  }

  /**
   * Generate a consistent ID from a URL
   */
  private generateUrlId(url: string): string {
    // Create a simple hash-like ID from the URL
    return `analytics_${btoa(url)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 16)}_${Date.now()}`;
  }

  /**
   * Find analytics by URL
   */
  async findByUrl(
    url: string
  ): Promise<RepositoryResult<SessionAnalyticsData | null>> {
    const startTime = Date.now();
    const operation = "findByUrl";

    try {
      console.log(
        `🔍 ${this.entityName}Repository.${operation}(${url}) - Starting`
      );

      const allAnalyticsResult = await this.findAll();
      if (!allAnalyticsResult.success || !allAnalyticsResult.data) {
        throw new Error("Failed to fetch analytics for findByUrl");
      }

      const analytics =
        allAnalyticsResult.data.find((item) => item.url === url) || null;

      console.log(
        `${analytics ? "✅" : "⚠️"} Analytics for URL ${
          analytics ? "found" : "not found"
        }`
      );

      return {
        success: true,
        data: analytics,
        metadata: {
          provider: allAnalyticsResult.metadata.provider,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(error, operation, null, startTime);
    }
  }

  /**
   * Update or create analytics for a URL
   */
  async upsertAnalytics(
    url: string,
    title: string,
    sessionName: string,
    visitCount: number = 1,
    lastAccess: Date | null = null
  ): Promise<RepositoryResult<SessionAnalyticsData>> {
    const startTime = Date.now();
    const operation = "upsertAnalytics";

    try {
      console.log(
        `📝 ${this.entityName}Repository.${operation}(${url}) - Starting`
      );

      // Try to find existing analytics
      const existingResult = await this.findByUrl(url);
      if (!existingResult.success) {
        throw new Error("Failed to check for existing analytics");
      }

      const existing = existingResult.data;

      if (existing) {
        // Update existing analytics
        const updatedSessionNames = [...existing.sessionNames];
        if (!updatedSessionNames.includes(sessionName)) {
          updatedSessionNames.push(sessionName);
        }

        const updatedAnalytics = {
          ...existing,
          title, // Update title in case it changed
          visitCount: existing.visitCount + visitCount,
          lastAccess:
            lastAccess &&
            (!existing.lastAccess || lastAccess > existing.lastAccess)
              ? lastAccess
              : existing.lastAccess,
          sessionNames: updatedSessionNames,
          updatedAt: new Date(),
        };

        const updateResult = await this.update(existing.id, updatedAnalytics);

        console.log(`✅ Updated analytics for URL: ${url}`);

        return {
          success: true,
          data: updateResult.data!,
          metadata: {
            provider: updateResult.metadata.provider,
            operation,
            timestamp: new Date(),
            duration: Date.now() - startTime,
          },
        };
      } else {
        // Create new analytics
        const createDto: SessionAnalyticsCreateDto = {
          url,
          title,
          visitCount,
          lastAccess,
          sessionNames: [sessionName],
        };

        const createResult = await this.create(createDto);

        console.log(`✅ Created new analytics for URL: ${url}`);

        return {
          success: true,
          data: createResult.data!,
          metadata: {
            provider: createResult.metadata.provider,
            operation,
            timestamp: new Date(),
            duration: Date.now() - startTime,
          },
        };
      }
    } catch (error) {
      return this.handleError(
        error,
        operation,
        {} as SessionAnalyticsData,
        startTime
      );
    }
  }

  /**
   * Get most visited URLs
   */
  async getMostVisited(
    limit: number = 10
  ): Promise<RepositoryResult<SessionAnalyticsData[]>> {
    const startTime = Date.now();
    const operation = "getMostVisited";

    try {
      console.log(
        `🔍 ${this.entityName}Repository.${operation}(${limit}) - Starting`
      );

      const allAnalyticsResult = await this.findAll();
      if (!allAnalyticsResult.success || !allAnalyticsResult.data) {
        throw new Error("Failed to fetch analytics for getMostVisited");
      }

      const sortedAnalytics = allAnalyticsResult.data
        .filter((item) => item.visitCount > 0)
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, limit);

      console.log(
        `✅ Retrieved ${sortedAnalytics.length} most visited analytics`
      );

      return {
        success: true,
        data: sortedAnalytics,
        metadata: {
          provider: allAnalyticsResult.metadata.provider,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(error, operation, [], startTime);
    }
  }

  /**
   * Get recently accessed URLs
   */
  async getRecentlyAccessed(
    limit: number = 10
  ): Promise<RepositoryResult<SessionAnalyticsData[]>> {
    const startTime = Date.now();
    const operation = "getRecentlyAccessed";

    try {
      console.log(
        `🔍 ${this.entityName}Repository.${operation}(${limit}) - Starting`
      );

      const allAnalyticsResult = await this.findAll();
      if (!allAnalyticsResult.success || !allAnalyticsResult.data) {
        throw new Error("Failed to fetch analytics for getRecentlyAccessed");
      }

      const sortedAnalytics = allAnalyticsResult.data
        .filter((item) => item.lastAccess)
        .sort((a, b) => {
          const aTime = a.lastAccess?.getTime() || 0;
          const bTime = b.lastAccess?.getTime() || 0;
          return bTime - aTime;
        })
        .slice(0, limit);

      console.log(
        `✅ Retrieved ${sortedAnalytics.length} recently accessed analytics`
      );

      return {
        success: true,
        data: sortedAnalytics,
        metadata: {
          provider: allAnalyticsResult.metadata.provider,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(error, operation, [], startTime);
    }
  }
}
