import { bedrock } from "@ai-sdk/amazon-bedrock";
import { CoreMessage, streamText } from "ai";
import { buildSystemMessage, retrieve } from "@/3rdparty/bedrock";

function getLastUserText(messages: CoreMessage[]) {
  const message = messages.findLast((m) => m.role === "user");
  if (typeof message === "undefined") {
    throw new Error("No user message found");
  }
  const { content } = message;
  if (typeof content === "string") {
    return content;
  }

  const last = content.findLast((c) => c.type === "text");
  if (typeof last === "undefined") {
    throw new Error("No text content found");
  }
  return last.text;
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const text = getLastUserText(messages);
  const results = await retrieve(text);

  const stream = await streamText({
    model: bedrock("anthropic.claude-3-5-sonnet-20240620-v1:0"),
    messages: [buildSystemMessage(results), ...messages],
  });

  return stream.toDataStreamResponse();
}

export const maxDuration = 300;
export const dynamic = "force-dynamic";
