"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  Construction,
  CheckSquare,
  Settings,
  Menu,
  X,
  HardHat,
  GitCompare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lift-plans", label: "Lift Plans", icon: ClipboardList },
  { href: "/cranes", label: "Crane Database", icon: Construction },
  { href: "/cranes/compare", label: "Crane Compare", icon: GitCompare },
  { href: "/approvals", label: "Approvals", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden bg-cat-yellow text-cat-black hover:bg-cat-yellow/90"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-full w-72 bg-cat-black text-white lg:hidden"
          >
            <SidebarContent pathname={pathname} onClose={() => setMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-72 flex-col bg-cat-black text-white lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  );
}

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cat-yellow shadow-lg">
            <HardHat className="h-6 w-6 text-cat-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight">Lift Plan</h1>
            <p className="text-xs text-cat-yellow/80 font-medium">TRAKINDO · CAT®</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = item.href === "/cranes/compare"
            ? pathname === "/cranes/compare"
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-cat-yellow text-cat-black shadow-lg"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cat-yellow text-xs font-bold text-cat-black shrink-0">
            BS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Budi Santoso</p>
            <p className="text-xs text-white/50 truncate">Rigger · Service Div.</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 px-2">
          <span className="text-[10px] text-white/30">Powered by</span>
          <span className="text-[10px] font-bold text-cat-yellow">TRAKINDO</span>
          <span className="text-[10px] text-white/30">·</span>
          <span className="text-[10px] font-bold text-white/50">CATERPILLAR®</span>
        </div>
      </div>
    </div>
  );
}
