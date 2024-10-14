"use server";

import { listIngestionJobs, startIngestionJob } from "@/3rdparty/bedrock";

export async function getJob() {
  const { ingestionJobSummaries: jobs } = await listIngestionJobs({
    maxResults: 1,
    sortBy: { attribute: "STARTED_AT", order: "DESCENDING" },
  });
  const job = (jobs ?? []).shift();
  return { job };
}

export async function startJob() {
  const { ingestionJob: job } = await startIngestionJob({});
  return { job };
}
