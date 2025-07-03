import { createClient } from 'redis'

// Redis connection singleton
let redis: ReturnType<typeof createClient> | null = null

// Check if we have Redis URL (production) or should use local fallback
const isRedisAvailable = !!process.env.REDIS_URL

console.log(`🔧 Database Mode: ${isRedisAvailable ? 'REDIS CLOUD' : 'LOCAL FALLBACK'}`)

export async function getRedisClient() {
  if (!isRedisAvailable) {
    // Return null for local development - will use in-memory fallback
    return null
  }

  if (redis) {
    return redis
  }

  try {
    redis = createClient({
      url: process.env.REDIS_URL
    })

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    redis.on('connect', () => {
      console.log('✅ Connected to Redis Cloud')
    })

    await redis.connect()
    return redis
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error)
    // Fall back to local development mode
    return null
  }
}

export async function closeRedisConnection() {
  if (redis) {
    await redis.quit()
    redis = null
  }
} 