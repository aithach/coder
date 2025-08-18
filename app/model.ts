import { bedrock } from '@ai-sdk/amazon-bedrock'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export const getModel = () => {
  return bedrock('us.anthropic.claude-sonnet-4-20250514-v1:0')

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  })

  return openrouter.chat('deepseek/deepseek-r1-0528-qwen3-8b')
}
