export const clientConfig = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
  region: process.env.AWS_REGION ?? "",
} as const;

export const knowledgeBaseConfig = {
  dataSourceId: process.env.DATA_SOURCE_ID ?? "",
  knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID ?? "",
} as const;
