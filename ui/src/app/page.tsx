"use client";

import { Thread } from "@assistant-ui/react";
import { useVercelUseChatRuntime } from "@assistant-ui/react-ai-sdk";
import { makeMarkdownText } from "@assistant-ui/react-markdown";
import { useChat } from "ai/react";
import avatar from "./avatar.jpg";

const assistantAvatar = { alt: "Katbot", src: avatar.src };

const assistantMessage = { components: { Text: makeMarkdownText() } };

export default function Home() {
  const search = typeof window === "object" ? window.location.search : "";
  const chat = useChat({ api: `/api/chat${search}` });
  const runtime = useVercelUseChatRuntime(chat);

  return (
    <div className="h-full">
      <Thread
        assistantAvatar={assistantAvatar}
        assistantMessage={assistantMessage}
        runtime={runtime}
      />
    </div>
  );
}
