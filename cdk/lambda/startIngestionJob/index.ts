import {
  BedrockAgentClient,
  StartIngestionJobCommand,
} from "@aws-sdk/client-bedrock-agent";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new BedrockAgentClient();

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
  .use(httpErrorHandler())
  .handler(async (_, context) => {
    const command = new StartIngestionJobCommand({
      clientToken: context.awsRequestId,
      dataSourceId: process.env.DATA_SOURCE_ID,
      knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
    });

    const { $metadata, ingestionJob } = await client.send(command);
    return {
      statusCode: $metadata.httpStatusCode ?? 202,
      body: JSON.stringify({ ingestionJob }),
    };
  });
