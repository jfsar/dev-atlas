import { AlertTriangleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export interface ActionAlertData {
  formError?: string;
  issues?: { field: string; message: string }[];
  [key: string]: unknown;
}

export function ActionAlerts({ data }: { data?: ActionAlertData }) {
  if (!data) return null;
  const hasIssues = Boolean(data.issues && data.issues.length > 0);
  if (!data.formError && !hasIssues) return null;

  return (
    <div className="space-y-3">
      {data.formError ? (
        <Alert variant="destructive">
          <AlertTriangleIcon aria-hidden />
          <AlertTitle>Could not save</AlertTitle>
          <AlertDescription>{data.formError}</AlertDescription>
        </Alert>
      ) : null}
      {hasIssues ? (
        <Alert variant="destructive">
          <AlertTriangleIcon aria-hidden />
          <AlertTitle>This content is not ready to publish</AlertTitle>
          <AlertDescription>
            <ul className="list-disc space-y-1 pl-4">
              {data.issues?.map((issue, index) => (
                <li key={`${issue.field}-${index}`}>{issue.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
