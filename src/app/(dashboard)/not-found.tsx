import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cat-yellow/10 mb-6">
        <Compass className="h-8 w-8 text-cat-yellow" />
      </div>
      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="text-sm text-muted-foreground mb-6">Page not found</p>
      <Link href="/dashboard">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
