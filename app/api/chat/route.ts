import { getModel } from '@/app/model'
import { sendSse } from '@/lib/redis'
import { schema } from '@/lib/utils'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamObject } from 'ai'
import { NextRequest } from 'next/server'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function POST(req: NextRequest) {
  const payload = await req.json()

  const result = streamObject({
    schema,
    model: openrouter.chat(payload.model),
    prompt: payload.prompt,
    maxOutputTokens: 8192,
    temperature: 0.1,
    system: `You are a Next.js 15 expert. Keep responses brief. Show only necessary code changes without comments. Assist with building, updating, and troubleshooting components.`,
  })

  result.usage.then((u) => {
    sendSse(JSON.stringify(u))
  })

  return result.toTextStreamResponse()
}
