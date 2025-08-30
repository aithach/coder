import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import z from 'zod/v4'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const schema = z.object({
  chat: z.string(),
  code: z.string().describe('return the code'),
})
