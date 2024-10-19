# Instructions

## 1. Deploy IaC via CDK

```bash
cd ./cdk

# Create API key at https://app.pinecone.io/organizations/-/projects/-/keys
export PINECONE_API_KEY=

export CDK_APP_ID=
npx cdk deploy
```

## 2. Crawl data

### Confluence

```bash
cd ./crawler
export OUTPUT_DIR=$(pwd)/crawled

# Create API token at https://id.atlassian.com/manage-profile/security/api-tokens
export CONFLUENCE_API_TOKEN=
export CONFLUENCE_EMAIL=
export CONFLUENCE_HOST=

npx tsx bin/confluence.ts id1 id2 id3
```

### Upload to S3

Once all the data has been crawled, upload to S3 and start the ingestion job from UI (see below).

```bash
cd ./crawler
export OUTPUT_DIR=$(pwd)/crawled
aws s3 sync "${OUTPUT_DIR}" s3://${DocsBucketName} --delete
```

## 3. Build the UI

Create a `.env.local` file inside `./ui` with these:

| Group          | Variables             | Note                          |
| -------------- | --------------------- | ----------------------------- |
| AWS access key | AWS_ACCESS_KEY_ID     | `AccessKeyId` from CDK        |
|                | AWS_REGION            | `AwsRegion` from CDK          |
|                | AWS_SECRET_ACCESS_KEY | `AwsSecretAccessKey` from CDK |
| Knowledge Base | KNOWLEDGE_BASE_ID     | `KnowledgeBaseId` from CDK    |
|                | DATA_SOURCE_ID        | `DataSourceId` from CDK       |
| OpenAI         | OPENAI_API_KEY        | See [OpenAI Platform]         |

[OpenAI Platform]: https://platform.openai.com/api-keys
[random.org]: https://www.random.org/passwords/

Then you can start the development server:

```bash
cd ./ui
npm run dev
```

Quick links:

- [Claude 3.5 Sonnet](http://localhost:3000) via AWS Bedrock
- OpenAI
  - [GPT-4o](http://localhost:3000/?provider=openai)
  - [GPT-4o Mini](http://localhost:3000/?provider=openai&model=gpt-4o-mini)
