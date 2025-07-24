import { redisClient } from './Redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix for namespacing
}

class CacheService {
  private defaultTTL = 300; // 5 minutes default
  private defaultPrefix = 'strapi';

  private generateKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || this.defaultPrefix;
    return `${keyPrefix}:${key}`;
  }

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(key, options?.prefix);
      const cached = await redisClient.get(cacheKey);
      
      if (!cached) {
        return null;
      }

      return JSON.parse(cached) as T;
    } catch (error) {
      console.error('Cache GET error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key, options?.prefix);
      const ttl = options?.ttl || this.defaultTTL;
      const serialized = JSON.stringify(value);
      
      return await redisClient.set(cacheKey, serialized, ttl);
    } catch (error) {
      console.error('Cache SET error:', error);
      return false;
    }
  }

  async del(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key, options?.prefix);
      return await redisClient.del(cacheKey);
    } catch (error) {
      console.error('Cache DEL error:', error);
      return false;
    }
  }

  async delPattern(pattern: string, options?: CacheOptions): Promise<boolean> {
    try {
      const prefix = options?.prefix || this.defaultPrefix;
      const searchPattern = `${prefix}:${pattern}`;
      return await redisClient.delPattern(searchPattern);
    } catch (error) {
      console.error('Cache DEL pattern error:', error);
      return false;
    }
  }

  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key, options?.prefix);
      return await redisClient.exists(cacheKey);
    } catch (error) {
      console.error('Cache EXISTS error:', error);
      return false;
    }
  }

  // Wrapper for caching function results
  async remember<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      console.log(`📦 Cache HIT: ${key}`);
      return cached;
    }

    // If not in cache, fetch the data
    console.log(`🔄 Cache MISS: ${key} - Fetching fresh data`);
    const fresh = await fetchFunction();
    
    // Store in cache for next time
    await this.set(key, fresh, options);
    
    return fresh;
  }

  // Cache invalidation for posts
  async invalidatePosts(): Promise<boolean> {
    console.log('🗑️ Invalidating all posts cache');
    return await this.delPattern('posts:*');
  }

  async invalidatePost(slug: string): Promise<boolean> {
    console.log(`🗑️ Invalidating post cache: ${slug}`);
    return await this.del(`post:${slug}`);
  }

  // Cache invalidation for categories
  async invalidateCategories(): Promise<boolean> {
    console.log('🗑️ Invalidating categories cache');
    return await this.delPattern('categories:*');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; connected: boolean }> {
    try {
      const testKey = 'health:check';
      const testValue = Date.now().toString();
      
      await this.set(testKey, testValue, { ttl: 10 });
      const retrieved = await this.get<string>(testKey);
      await this.del(testKey);
      
      const isHealthy = retrieved === testValue;
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        connected: isHealthy
      };
    } catch (error) {
      return {
        status: 'error',
        connected: false
      };
    }
  }
}

export const cacheService = new CacheService();