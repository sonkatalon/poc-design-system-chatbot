import {
  BedrockAgentClient,
  ListIngestionJobsCommand,
  StartIngestionJobCommand,
} from "@aws-sdk/client-bedrock-agent";
import { clientConfig, knowledgeBaseConfig } from "./config";
export type { IngestionJobSummary } from "@aws-sdk/client-bedrock-agent";

const client = new BedrockAgentClient(clientConfig);

export function listIngestionJobs(
  input: Omit<
    ListIngestionJobsCommand["input"],
    keyof typeof knowledgeBaseConfig
  >
) {
  const command = new ListIngestionJobsCommand({
    ...input,
    ...knowledgeBaseConfig,
  });
  return client.send(command);
}

export function startIngestionJob(
  input: Omit<
    StartIngestionJobCommand["input"],
    keyof typeof knowledgeBaseConfig
  >
) {
  const command = new StartIngestionJobCommand({
    ...input,
    ...knowledgeBaseConfig,
  });
  return client.send(command);
}
