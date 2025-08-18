import { getModel } from '@/app/model'
import { convertToModelMessages, streamObject, UIMessage } from 'ai'
import { z } from 'zod/v4'

export const schema = z.object({
  chat: z.string(),
  code: z.string().describe('return the code'),
})

const model = getModel()
export async function POST(req: Request) {
  const payload = await req.json()

  const result = streamObject({
    schema,
    model,
    prompt: payload.prompt,
    system: `
    You are a Next.js 15 expert.
    The chat section should be in markdown. make it very short and don't try to explain.
    The code section should not have comments.
    Your task is to assist the user in creating or modifying Next.js components or code, providing detailed explanations and helping with troubleshooting.`,
  })

  return result.toTextStreamResponse()
}
