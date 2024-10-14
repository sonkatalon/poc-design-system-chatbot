# Instructions

## 1. Deploy IaC via CDK

```bash
cd ./cdk
npm install
npx deploy
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

### Start ingestion job

Once all the data has been crawled, upload to S3 and start the ingestion job.

```bash
cd ./crawler
export OUTPUT_DIR=$(pwd)/crawled
aws s3 sync "${OUTPUT_DIR}" s3://${DocsBucketName} --delete
curl -X POST ${ApiGatewayUrl}ingestions
```

## 3. Build the UI

### Environment variables

Create a `.env.local` file inside `./ui` with these:

| Name                 | Description | Note                                                  |
| -------------------- | ----------- | ----------------------------------------------------- |
| GOOGLE_CLIENT_ID     |             | See https://console.cloud.google.com/apis/credentials |
| GOOGLE_CLIENT_SECRET |             |                                                       |
| NEXTAUTH_SECRET      |             | See https://www.random.org/passwords/                 |
