import { IngestionJobSummary } from "@/3rdparty/bedrock";
import { FC } from "react";

export interface IngestionStatusProps {
  job: IngestionJobSummary | undefined;
}

export const IngestionStatus: FC<IngestionStatusProps> = ({ job }) => {
  if (typeof job === "undefined") {
    return <span className="text-gray-600">Last status: UNKNOWN</span>;
  }

  const { status } = job;
  const updatedAt = job.updatedAt!.toLocaleString();
  const documents = job.statistics?.numberOfDocumentsScanned ?? 0;
  if (status === "COMPLETE") {
    return (
      <span
        className="text-green-600"
        title={documents > 0 ? `Documents: ${documents}` : undefined}
      >{`Updated at ${updatedAt}`}</span>
    );
  }

  return (
    <span className="text-orange-500">{`${status} since ${updatedAt}`}</span>
  );
};
