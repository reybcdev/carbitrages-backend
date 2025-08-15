import { createClient } from 'redis';
import { logger } from '../utils/logger';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info('🔴 Redis Connected');

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis Client Reconnecting');
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
    });

  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};
