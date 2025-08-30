import { Redis } from 'ioredis'

const redisSubscriber = new Redis(process.env.REDIS_URL!)
const encoder = new TextEncoder()

export async function GET(): Promise<Response> {
  const stream = new ReadableStream({
    async start(controller) {
      await redisSubscriber.subscribe('sse_channel')
      redisSubscriber.on('message', (_, message) => {
        try {
          controller.enqueue(encoder.encode(`data: ${message}\n\n`))
        } catch (err) {
          redisSubscriber.unsubscribe('sse_channel')
        }
      })
    },
    cancel() {
      redisSubscriber.unsubscribe('sse_channel')
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
