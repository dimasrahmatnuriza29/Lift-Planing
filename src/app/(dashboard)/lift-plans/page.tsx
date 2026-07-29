"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Plus,
  ClipboardList,
  HardHat,
  Calendar,
  MapPin,
  Filter,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LiftPlan {
  id: number;
  planNumber: string;
  title: string;
  description: string | null;
  liftType: string;
  status: string;
  divisi: string;
  divisiCode: string;
  crane: string | null;
  loadWeight: number | null;
  totalLoad: number | null;
  utilizationPct: number | null;
  riskLevel: string | null;
  scheduledDate: string | null;
  location: string | null;
  createdAt: string;
  approvals: Array<{
    approverRole: string;
    approverName: string;
    status: string;
    orderSequence: number;
  }>;
}

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info" | "secondary"> = {
  draft: "secondary",
  submitted: "info",
  approved: "success",
  rejected: "danger",
  completed: "default",
};

const statusLabel: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

const riskVariant: Record<string, "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

export default function LiftPlansPage() {
  const [plans, setPlans] = useState<LiftPlan[]>([]);
  const [filtered, setFiltered] = useState<LiftPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<LiftPlan | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetch("/api/lift-plans")
      .then((res) => res.json())
      .then((data) => {
        setPlans(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = plans;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.planNumber.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (typeFilter !== "all") {
      result = result.filter((p) => p.liftType === typeFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, typeFilter, plans]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/lift-plans/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
      } else {
        toast.success(`${deleteTarget.planNumber} deleted successfully`);
        setPlans((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch {
      toast.error("Network error");
    }
    setDeleteLoading(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lift Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar semua lift plan dari semua divisi
          </p>
        </div>
        <Link href="/lift-plans/create">
          <Button variant="cat" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Lift Plan
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search lift plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="routine">Routine</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards (Mobile) */}
      <div className="grid gap-4 md:hidden">
        {loading
          ? [1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
            ))
          : filtered.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => (window.location.href = `/lift-plans/${plan.id}`)}>
                  <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-yellow/10">
                            <HardHat className="h-5 w-5 text-cat-black" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{plan.planNumber}</p>
                            <p className="font-medium text-sm">{plan.divisi}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={statusVariant[plan.status] || "secondary"}>
                            {statusLabel[plan.status] || plan.status}
                          </Badge>
                          {plan.liftType === "critical" && (
                            <Badge variant="danger">Critical</Badge>
                          )}
                        </div>
                      </div>
                      <h3 className="font-medium text-sm mb-3 line-clamp-2">{plan.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(plan.scheduledDate)}
                          </span>
                          {plan.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {plan.location}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Link href={`/lift-plans/${plan.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setDeleteTarget(plan); }}>
                            <Trash2 className="h-3 w-3 text-status-danger" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              </motion.div>
            ))}
      </div>

      {/* Table (Desktop) */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Lift Plan Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">No lift plans found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Divisi</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Crane</TableHead>
                  <TableHead className="text-right">Load</TableHead>
                  <TableHead className="text-right">Util.</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((plan, i) => (
                  <motion.tr
                    key={plan.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => (window.location.href = `/lift-plans/${plan.id}`)}
                  >
                    <TableCell className="font-mono text-xs font-medium">
                      {plan.planNumber}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {plan.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{plan.divisi}</Badge>
                    </TableCell>
                    <TableCell>
                      {plan.liftType === "critical" ? (
                        <Badge variant="danger">Critical</Badge>
                      ) : (
                        <Badge variant="secondary">Routine</Badge>
                      )}
                    </TableCell>
                    <TableCell>{plan.crane || "-"}</TableCell>
                    <TableCell className="text-right">
                      {plan.totalLoad ? `${(plan.totalLoad / 1000).toFixed(1)}t` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {plan.utilizationPct ? (
                        <span
                          className={
                            plan.utilizationPct > 75
                              ? "text-status-danger font-medium"
                              : plan.utilizationPct > 50
                              ? "text-status-warning font-medium"
                              : "text-status-success font-medium"
                          }
                        >
                          {plan.utilizationPct.toFixed(0)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.riskLevel ? (
                        <Badge variant={riskVariant[plan.riskLevel] || "secondary"}>
                          {plan.riskLevel}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(plan.scheduledDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[plan.status] || "secondary"}>
                        {statusLabel[plan.status] || plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/lift-plans/${plan.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/lift-plans/${plan.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(plan);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-status-danger" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Lift Plan?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-mono font-semibold">{deleteTarget?.planNumber}</span> —{" "}
              <span className="font-semibold">{deleteTarget?.title}</span>?
              <br />
              This action cannot be undone. All approval data will also be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
