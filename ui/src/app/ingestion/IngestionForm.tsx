"use client";

import { FC, useEffect, useState } from "react";
import { IngestionStatus, IngestionStatusProps } from "./IngestionStatus";
import { getJob, startJob } from "./actions";

function isStartingOrInProgress(state: IngestionStatusProps) {
  const status = state.job?.status;
  return status === "STARTING" || status === "IN_PROGRESS";
}

export const IngestionForm: FC<IngestionStatusProps> = (props) => {
  const [state, setState] = useState(props);

  useEffect(() => {
    if (isStartingOrInProgress(state)) {
      const timer = setTimeout(() => getJob().then(setState), 100);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <form
      action={() => startJob().then(setState)}
      className="text-xs mx-3 leading-none absolute right-auto top-0 left-0 opacity-10 hover:opacity-80"
    >
      <IngestionStatus {...state} />
      <input
        className="m-1 p-2 font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
        disabled={isStartingOrInProgress(state)}
        type="submit"
        value="Update"
      />
    </form>
  );
};
