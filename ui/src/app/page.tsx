"use client";

import { Thread } from "@assistant-ui/react";
import { useVercelUseChatRuntime } from "@assistant-ui/react-ai-sdk";
import { useChat } from "ai/react";
import avatar from "./avatar.jpg";

const assistantAvatar = { alt: "Shinobi Chatbot", src: avatar.src };

export default function Home() {
  const search = typeof window === "object" ? window.location.search : "";
  const chat = useChat({ api: `/api/chat${search}` });
  const runtime = useVercelUseChatRuntime(chat);

  return (
    <div className="h-full">
      <Thread assistantAvatar={assistantAvatar} runtime={runtime} />
    </div>
  );
}
