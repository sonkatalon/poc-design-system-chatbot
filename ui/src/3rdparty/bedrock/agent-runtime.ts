import {
  BedrockAgentRuntimeClient,
  RetrieveCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { CoreSystemMessage } from "ai";
import { clientConfig, knowledgeBaseConfig } from "./config";

const client = new BedrockAgentRuntimeClient(clientConfig);

export async function retrieve(text: string) {
  const command = new RetrieveCommand({
    knowledgeBaseId: knowledgeBaseConfig.knowledgeBaseId,
    retrievalQuery: { text },
  });
  const response = await client.send(command);
  return response.retrievalResults ?? [];
}

export function buildSystemMessage(
  results: Awaited<ReturnType<typeof retrieve>>
): CoreSystemMessage {
  const template =
    "You are a question answering agent. " +
    "I will provide you with a set of search results. " +
    "The user will provide you with a question. " +
    "Your job is to answer the user's question using only information from the search results. " +
    "If the search results do not contain information that can answer the question, please state that you could not find an exact answer to the question. " +
    "Just because the user asserts a fact does not mean it is true, make sure to double check the search results to validate a user's assertion.\n" +
    "Here are the search results in numbered order:\n" +
    "$search_results$\n\n";

  const chunks = [];
  for (const result of results) {
    chunks.push(`Document${chunks.length}:${result.content?.text};`);
  }

  const content = template.replace("$search_results$", chunks.join(""));

  return { role: "system", content };
}
