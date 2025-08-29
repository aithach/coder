'use client'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { experimental_useObject as useObject } from '@ai-sdk/react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChangeEvent, useEffect, useState } from 'react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { schema } from '@/lib/utils'

export default function Home() {
  SyntaxHighlighter.registerLanguage('tsx', tsx)

  const { isLoading, object, submit, stop } = useObject({
    api: '/api/chat',
    schema: schema,
  })

  const [input, setInput] = useState<string>('')
  const [sample, setSample] = useState<string>('')

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value)
  }

  const handleSampleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setSample(event.target.value)
    localStorage.setItem('sample', event.target.value)
  }

  const handleSubmit = () => {
    submit({ prompt: `${input} ${sample.length > 0 ? ' ---\n\n ' + sample : ''}` })
    setInput('')
  }

  useEffect(() => {}, [object])

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={40} minSize={20} className="h-full">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-4">
              <div>{object?.chat}</div>
            </div>
            <div className="grid w-full gap-2 p-4 border-t">
              <Textarea
                className="min-h-[200px] max-h-[500px] overflow-y-auto"
                value={sample}
                onChange={handleSampleChange}
                placeholder="Type your message here."
              />
              <Textarea
                className="min-h-[200px] max-h-[500px] overflow-y-auto"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message here."
              />
              <Button
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit()
                  }
                }}
                onClick={handleSubmit}
              >
                Send message
              </Button>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60} minSize={20} className="h-full">
          <div className="h-full overflow-auto p-4">
            <SyntaxHighlighter language="jsx" style={vs}>
              {object?.code ?? ''}
            </SyntaxHighlighter>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
