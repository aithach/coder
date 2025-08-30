'use client'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { schema } from '@/lib/utils'
import { Check, Copy, Plus, ChevronDown, ChevronUp } from 'lucide-react'

SyntaxHighlighter.registerLanguage('tsx', tsx)

const TokenTable = ({ usage }: { usage: { inputTokens?: number; outputTokens?: number; totalTokens?: number } }) => (
  <table className="w-full text-left text-sm border-b">
    <thead className="bg-gray-100 text-gray-700">
      <tr>
        <th className="px-4 py-0 border-r">Input Tokens</th>
        <th className="px-4 py-0 border-r">Output Tokens</th>
        <th className="px-4 py-0 border-r">Total Tokens</th>
      </tr>
    </thead>
    <tbody>
      <tr className="text-gray-800">
        <td className="px-4 py-0 border-r">{usage.inputTokens ?? '-'}</td>
        <td className="px-4 py-0 border-r">{usage.outputTokens ?? '-'}</td>
        <td className="px-4 py-0 border-r">{usage.totalTokens ?? '-'}</td>
      </tr>
    </tbody>
  </table>
)

const ChatArea = ({ chat }: { chat: string | undefined }) => (
  <div className="flex-1 overflow-y-auto p-4">{chat ? <div dangerouslySetInnerHTML={{ __html: chat }} /> : null}</div>
)

const SyntaxHighlighterMemo = ({ code }: { code: string | undefined }) => (
  <SyntaxHighlighter language="jsx" style={vs}>
    {code ?? ''}
  </SyntaxHighlighter>
)

export default function Home() {
  const initialModels: string[] = [
    'qwen/qwen3-coder',
    'qwen/qwen3-coder-30b-a3b-instruct',
    'x-ai/grok-code-fast-1',
    'google/gemini-2.5-flash',
    'deepseek/deepseek-chat-v3.1',
    'mistralai/codestral-2508',
  ]

  const [models, setModels] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const storedModels = localStorage.getItem('models')
      return storedModels ? JSON.parse(storedModels) : initialModels
    }
    return initialModels
  })

  const [selectedModel, setSelectedModel] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('selectedModel')) || models[0]
  })

  const [newModelInput, setNewModelInput] = useState('')
  const [isModelPanelOpen, setIsModelPanelOpen] = useState(false)

  const { isLoading, object, error, submit, stop } = useObject({
    api: '/api/chat',
    schema: schema,
  })
  const [input, setInput] = useState('')
  const [sample, setSample] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('sample')) || ''
  })

  const inputHistory = useRef<string[]>([])
  const historyIndex = useRef(-1)

  useEffect(() => {
    const savedHistory = localStorage.getItem('inputHistory')
    if (savedHistory) inputHistory.current = JSON.parse(savedHistory)
  }, [])

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return
    inputHistory.current = [...inputHistory.current, input]
    localStorage.setItem('inputHistory', JSON.stringify(inputHistory.current))
    historyIndex.current = -1
    submit({ prompt: `${input} ${sample.length > 0 ? sample : ''}`, model: selectedModel })
    setInput('')
  }, [input, sample, submit, selectedModel])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'ArrowUp' && inputHistory.current.length > 0) {
        e.preventDefault()
        if (historyIndex.current < inputHistory.current.length - 1) {
          historyIndex.current += 1
        } else if (historyIndex.current === -1) {
          historyIndex.current = 0
        }
        setInput(inputHistory.current[inputHistory.current.length - 1 - historyIndex.current])
      } else if (e.key === 'ArrowDown' && historyIndex.current >= 0) {
        e.preventDefault()
        if (historyIndex.current > 0) {
          historyIndex.current -= 1
          setInput(inputHistory.current[inputHistory.current.length - 1 - historyIndex.current])
        } else {
          historyIndex.current = -1
          setInput('')
        }
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  useEffect(() => {
    localStorage.setItem('models', JSON.stringify(models))
  }, [models])

  useEffect(() => {
    localStorage.setItem('selectedModel', selectedModel)
  }, [selectedModel])

  useEffect(() => {
    localStorage.setItem('sample', sample)
  }, [sample])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  const handleSampleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setSample(e.target.value)
  }, [])

  const [usage, setUsage] = useState({})

  useEffect(() => {
    const eventSource = new EventSource('/api/usage')

    eventSource.onmessage = (event) => {
      setUsage(JSON.parse(event.data))
    }

    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      eventSource.close()
    }

    return () => eventSource.close()
  }, [])

  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (object?.code) {
      await navigator.clipboard.writeText(object.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [object?.code])

  const handleMoveToSample = useCallback(() => {
    if (object?.code) {
      setSample(object.code)
    }
  }, [object?.code])

  const handleAddModel = useCallback(() => {
    if (newModelInput.trim() && !models.includes(newModelInput.trim())) {
      setModels((prev) => [...prev, newModelInput.trim()])
      setNewModelInput('')
    }
  }, [newModelInput, models])

  const handleRemoveModel = useCallback(
    (modelToRemove: string) => {
      if (models.length > 1) {
        setModels((prev) => prev.filter((model: string) => model !== modelToRemove))
        if (selectedModel === modelToRemove) {
          setSelectedModel(models.filter((model: string) => model !== modelToRemove)[0])
        }
      }
    },
    [models, selectedModel]
  )

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={40} minSize={20} className="h-full overflow-y-auto">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b bg-gray-50 p-2">
              <div className="flex items-center space-x-2">
                <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="border rounded p-2 text-sm">
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <Button onClick={() => setIsModelPanelOpen(!isModelPanelOpen)} variant="outline" size="sm" className="flex items-center gap-1">
                  {isModelPanelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  Models
                </Button>
              </div>
              <div className="ml-4 flex-shrink-0">
                <TokenTable usage={usage} />
              </div>
            </div>
            {isModelPanelOpen && (
              <div className="border-b bg-gray-50 p-3">
                <div className="flex items-center mb-2">
                  <input
                    type="text"
                    value={newModelInput}
                    onChange={(e) => setNewModelInput(e.target.value)}
                    placeholder="Add new model"
                    className="border rounded p-1 text-sm mr-1 flex-1"
                  />
                  <Button onClick={handleAddModel} size="sm" className="h-8 w-8 p-0">
                    <Plus size={14} />
                  </Button>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="space-y-1">
                    {models.map((model) => (
                      <li key={model} className="flex items-center justify-between text-sm p-1 hover:bg-gray-100 rounded">
                        <span className="truncate">{model}</span>
                        {models.length > 1 && (
                          <Button
                            onClick={() => handleRemoveModel(model)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                          >
                            ×
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <ChatArea chat={object?.chat} />
            {error && <div className="p-4 text-red-500">Error: {error.message}</div>}
            <div className="flex-shrink-0 grid gap-2 p-4 border-t">
              <Textarea
                className="min-h-[120px] max-h-[300px] overflow-y-auto"
                value={sample}
                onChange={handleSampleChange}
                placeholder="Sample message"
              />
              <Textarea
                className="min-h-[120px] max-h-[300px] overflow-y-auto"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Your input"
              />
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send message'}
              </Button>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={60} minSize={20} className="h-full">
          <div className="relative h-full overflow-auto p-4">
            <div className="sticky top-4 z-10 flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md bg-gray-200/90 px-2 py-1 text-xs shadow-md backdrop-blur-sm hover:bg-gray-300"
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy
                  </>
                )}
              </button>
              <button
                onClick={handleMoveToSample}
                className="flex items-center gap-1 rounded-md bg-gray-200/90 px-2 py-1 text-xs shadow-md backdrop-blur-sm hover:bg-gray-300"
              >
                Move to Sample
              </button>
            </div>
            <SyntaxHighlighterMemo code={object?.code} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
