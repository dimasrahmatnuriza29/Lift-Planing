"use client";

import { Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Topbar({ title }: { title: string }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const getDynamicTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/lift-plans") return "Lift Plans";
    if (pathname === "/lift-plans/create") return "Create Lift Plan";
    if (pathname.startsWith("/lift-plans/") && pathname.endsWith("/edit")) return "Edit Lift Plan";
    if (pathname.startsWith("/lift-plans/")) return "Lift Plan Detail";
    if (pathname === "/cranes") return "Crane Database";
    if (pathname === "/cranes/compare") return "Crane Compare";
    if (pathname.startsWith("/cranes/")) return "Crane Detail";
    if (pathname === "/approvals") return "Approvals";
    if (pathname === "/settings") return "Settings";
    return title;
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <div className="w-10 lg:hidden" />
      <h2 className="text-lg font-semibold hidden sm:block truncate">{getDynamicTitle()}</h2>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="hover:bg-accent"
        >
          <Sun className="h-5 w-5 dark:hidden" />
          <Moon className="h-5 w-5 hidden dark:block" />
        </Button>
        <Button variant="ghost" size="icon" className="relative hover:bg-accent">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-cat-yellow" />
        </Button>
      </div>
    </header>
  );
}
