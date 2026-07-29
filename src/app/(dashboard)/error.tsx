"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-status-danger/10 mb-6">
        <AlertTriangle className="h-8 w-8 text-status-danger" />
      </div>
      <h1 className="text-xl font-bold mb-2">Failed to load page</h1>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
        {error.message || "An error occurred while loading this page."}
      </p>
      <Button onClick={reset} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
