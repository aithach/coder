import { Redis } from 'ioredis'

const redisPublisher = new Redis(process.env.REDIS_URL!)

export async function sendSse(str: string) {
  try {
    await redisPublisher.publish('sse_channel', str)
  } catch (err) {}
}
