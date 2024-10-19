import { bedrock } from "@ai-sdk/amazon-bedrock";
import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { type NextRequest } from "next/server";
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

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const provider = searchParams.get("provider");
  const modelParam = searchParams.get("model");

  const { messages } = await req.json();
  const question = getLastUserText(messages);
  console.log({ question });

  const results = await retrieve(question);
  console.log({ results: results.map(({ metadata }) => metadata) });

  const model =
    provider === "openai"
      ? openai(modelParam ?? "gpt-4o")
      : bedrock(modelParam ?? "anthropic.claude-3-5-sonnet-20240620-v1:0");
  const stream = await streamText({
    model,
    messages: [buildSystemMessage(results), ...messages],
    onFinish: ({ text: answer, usage }) =>
      console.log({
        provider: model.provider,
        modelId: model.modelId,
        answer,
        usage,
      }),
  });

  return stream.toDataStreamResponse();
}

export const maxDuration = 300;
export const dynamic = "force-dynamic";
