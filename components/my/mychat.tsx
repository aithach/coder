"use client";

import { useChat } from "@ai-sdk/react";

import { Chat } from "@/components/ui/chat";

export function MyChat() {
  const { messages, input, handleInputChange, handleSubmit, status, stop } =
    useChat();

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <Chat
      messages={messages}
      input={input}
      className="h-full overflow-auto"
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isGenerating={isLoading}
      stop={stop}
    />
  );
}
