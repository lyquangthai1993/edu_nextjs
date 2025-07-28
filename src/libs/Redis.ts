/* eslint-disable no-console */
import Redis from 'ioredis';

class RedisClient {
  private client: Redis | null = null;
  private connectionPromise: Promise<Redis | null> | null = null;

  private createClient(): Redis {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });

    redis.on('close', () => {
      console.log('⚠️ Redis connection closed');
      this.client = null;
      this.connectionPromise = null;
    });

    return redis;
  }

  async getClient(): Promise<Redis | null> {
    if (this.client && this.client.status === 'ready') {
      return this.client;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.connect();
    return this.connectionPromise;
  }

  private async connect(): Promise<Redis | null> {
    try {
      if (!this.client) {
        this.client = this.createClient();
      }

      if (this.client.status !== 'ready') {
        await this.client.connect();
      }

      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.client = null;
      this.connectionPromise = null;
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const client = await this.getClient();
      if (!client) {
        return null;
      }

      return await client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client) {
        return false;
      }

      if (ttlSeconds) {
        await client.setex(key, ttlSeconds, value);
      } else {
        await client.set(key, value);
      }

      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client) {
        return false;
      }

      await client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async delPattern(pattern: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client) {
        return false;
      }

      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }

      return true;
    } catch (error) {
      console.error('Redis DEL pattern error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client) {
        return false;
      }

      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const client = await this.getClient();
      if (!client) {
        return -1;
      }

      return await client.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -1;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.connectionPromise = null;
    }
  }
}

export const redisClient = new RedisClient();
