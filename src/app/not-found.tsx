import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cat-yellow/10 mb-6">
        <Compass className="h-8 w-8 text-cat-yellow" />
      </div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-lg font-medium mb-1">Page Not Found</p>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
