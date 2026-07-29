"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Check,
  X,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  Weight,
  Construction,
  ShieldCheck,
  Loader2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

type ApprovalStep = {
  id: number;
  approverRole: string;
  approverName: string;
  status: string;
  approvedAt: string | null;
  orderSequence: number;
  comment?: string | null;
};

type LiftPlanWithApprovals = {
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
  approvals: ApprovalStep[];
};

const roleLabels: Record<string, string> = {
  rigger: "Rigger",
  supervisor: "Supervisor",
  safety_officer: "Safety Officer",
  manager: "Manager",
};

const roleColors: Record<string, string> = {
  rigger: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  supervisor: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  safety_officer: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  manager: "bg-red-500/10 text-red-600 border-red-500/30",
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-status-warning", bg: "bg-status-warning/10 border-status-warning/30" },
  approved: { label: "Approved", color: "text-status-success", bg: "bg-status-success/10 border-status-success/30" },
  rejected: { label: "Rejected", color: "text-status-danger", bg: "bg-status-danger/10 border-status-danger/30" },
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted border-border" },
  submitted: { label: "In Review", color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/30" },
  completed: { label: "Completed", color: "text-status-success", bg: "bg-status-success/10 border-status-success/30" },
};

const riskColors: Record<string, string> = {
  low: "text-status-success bg-status-success/10",
  medium: "text-status-warning bg-status-warning/10",
  high: "text-status-danger bg-status-danger/10",
};

export default function ApprovalsPage() {
  const [plans, setPlans] = useState<LiftPlanWithApprovals[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<LiftPlanWithApprovals[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lift-plans");
      const data = await res.json();
      setPlans(data);
    } catch {
      setToast({ msg: "Failed to load lift plans", type: "error" });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    let filtered = plans;
    if (filter === "pending") {
      filtered = plans.filter((p) => p.status === "submitted" && p.approvals.some((a) => a.status === "pending"));
    } else if (filter === "approved") {
      filtered = plans.filter((p) => p.status === "approved");
    } else if (filter === "rejected") {
      filtered = plans.filter((p) => p.status === "rejected");
    } else if (filter === "all") {
      filtered = plans.filter((p) => p.status === "submitted" || p.status === "approved" || p.status === "rejected");
    }
    if (search) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.planNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredPlans(filtered);
  }, [plans, filter, search]);

  const handleAction = async (planId: number, action: "approve" | "reject") => {
    setActionLoading(planId);
    try {
      const res = await fetch(`/api/lift-plans/${planId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment: comment || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ msg: data.error || "Action failed", type: "error" });
      } else {
        setToast({ msg: data.message || `Lift plan ${action}d`, type: "success" });
        setComment("");
        setExpandedId(null);
        await fetchPlans();
      }
    } catch {
      setToast({ msg: "Network error", type: "error" });
    }
    setActionLoading(null);
    setTimeout(() => setToast(null), 4000);
  };

  const pendingCount = plans.filter((p) => p.status === "submitted" && p.approvals.some((a) => a.status === "pending")).length;
  const approvedCount = plans.filter((p) => p.status === "approved").length;
  const rejectedCount = plans.filter((p) => p.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-yellow/10">
            <CheckSquare className="h-5 w-5 text-cat-yellow" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Approvals Queue</h1>
            <p className="text-sm text-muted-foreground">Review and approve submitted lift plans</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-status-warning/30">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold text-status-warning">{pendingCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-warning/10">
              <Clock className="h-6 w-6 text-status-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-status-success/30">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-status-success">{approvedCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-success/10">
              <Check className="h-6 w-6 text-status-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-status-danger/30">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-status-danger">{rejectedCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-danger/10">
              <X className="h-6 w-6 text-status-danger" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All Submitted</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search by title or plan number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-lg p-3 text-sm font-medium ${
              toast.type === "success"
                ? "bg-status-success/10 text-status-success border border-status-success/30"
                : "bg-status-danger/10 text-status-danger border border-status-danger/30"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-cat-yellow" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No lift plans in this category</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPlans.map((plan, idx) => (
            <ApprovalCard
              key={plan.id}
              plan={plan}
              expanded={expandedId === plan.id}
              onToggle={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
              onAction={handleAction}
              actionLoading={actionLoading === plan.id}
              comment={comment}
              setComment={setComment}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalCard({
  plan,
  expanded,
  onToggle,
  onAction,
  actionLoading,
  comment,
  setComment,
  index,
}: {
  plan: LiftPlanWithApprovals;
  expanded: boolean;
  onToggle: () => void;
  onAction: (id: number, action: "approve" | "reject") => void;
  actionLoading: boolean;
  comment: string;
  setComment: (v: string) => void;
  index: number;
}) {
  const currentStep = plan.approvals.find((a) => a.status === "pending");
  const isPending = plan.status === "submitted" && currentStep;
  const statusCfg = statusConfig[plan.status] || statusConfig.pending;
  const riskColor = riskColors[plan.riskLevel || "low"] || riskColors.low;
  const utilPct = plan.utilizationPct || 0;
  const utilColor = utilPct > 75 ? "text-status-danger" : utilPct > 50 ? "text-status-warning" : "text-status-success";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={isPending ? "border-status-warning/40 shadow-md" : ""}>
        <CardContent className="p-4">
          {/* Top Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/lift-plans/${plan.id}`} className="font-semibold hover:underline">
                  {plan.title}
                </Link>
                <Badge variant="outline" className="text-xs">{plan.planNumber}</Badge>
                <Badge variant="outline" className={`text-xs ${statusCfg.bg} ${statusCfg.color} border-0`}>
                  {statusCfg.label}
                </Badge>
                {plan.liftType === "critical" && (
                  <Badge variant="outline" className="text-xs bg-status-danger/10 text-status-danger border-status-danger/30">
                    Critical
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {plan.divisi}</span>
                {plan.crane && <span className="flex items-center gap-1"><Construction className="h-3 w-3" /> {plan.crane}</span>}
                {plan.totalLoad && <span className="flex items-center gap-1"><Weight className="h-3 w-3" /> {(plan.totalLoad / 1000).toFixed(1)}t</span>}
                {utilPct > 0 && <span className={utilColor}>{utilPct.toFixed(0)}% util</span>}
                {plan.riskLevel && <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${riskColor}`}>{plan.riskLevel} risk</span>}
                {plan.location && <span>{plan.location}</span>}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle} className="shrink-0">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Current Approver Banner */}
          {isPending && currentStep && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-status-warning/10 border border-status-warning/30 p-2.5">
              <Clock className="h-4 w-4 text-status-warning shrink-0" />
              <span className="text-sm">
                Waiting for <strong>{roleLabels[currentStep.approverRole] || currentStep.approverRole}</strong> ({currentStep.approverName})
              </span>
            </div>
          )}

          {/* Expanded Detail */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Separator className="my-4" />

                {/* Approval Timeline */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">APPROVAL WORKFLOW</p>
                  {plan.approvals.map((step, i) => {
                    const stepStatus = statusConfig[step.status] || statusConfig.pending;
                    const roleColor = roleColors[step.approverRole] || "";
                    return (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          {step.status === "approved" ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-status-success/10">
                              <Check className="h-4 w-4 text-status-success" />
                            </div>
                          ) : step.status === "rejected" ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-status-danger/10">
                              <X className="h-4 w-4 text-status-danger" />
                            </div>
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-status-warning/10">
                              <Clock className="h-4 w-4 text-status-warning" />
                            </div>
                          )}
                          {i < plan.approvals.length - 1 && (
                            <div className={`w-0.5 h-5 ${step.status === "approved" ? "bg-status-success/30" : "bg-border"}`} />
                          )}
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium">{roleLabels[step.approverRole] || step.approverRole}</span>
                            <span className="text-xs text-muted-foreground ml-2">{step.approverName}</span>
                            {step.comment && <p className="text-xs text-muted-foreground italic mt-0.5">"{step.comment}"</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            {step.approvedAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(step.approvedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            )}
                            <Badge variant="outline" className={`text-xs ${stepStatus.bg} ${stepStatus.color} border-0`}>
                              {stepStatus.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Plan Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Load</p>
                    <p className="text-sm font-bold">{plan.totalLoad ? `${(plan.totalLoad / 1000).toFixed(1)}t` : "-"}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Crane</p>
                    <p className="text-sm font-bold">{plan.crane || "-"}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Utilization</p>
                    <p className={`text-sm font-bold ${utilColor}`}>{utilPct > 0 ? `${utilPct.toFixed(0)}%` : "-"}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Risk</p>
                    <p className={`text-sm font-bold capitalize ${riskColor.split(" ")[0]}`}>{plan.riskLevel || "-"}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isPending && (
                  <div className="space-y-3">
                    <Input
                      placeholder="Add comment (optional)..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onAction(plan.id, "approve")}
                        disabled={actionLoading}
                        className="bg-status-success hover:bg-status-success/90 text-white"
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                        Approve
                      </Button>
                      <Button
                        onClick={() => onAction(plan.id, "reject")}
                        disabled={actionLoading}
                        variant="destructive"
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <X className="h-4 w-4 mr-1" />}
                        Reject
                      </Button>
                      <Link href={`/lift-plans/${plan.id}`}>
                        <Button variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          View Full Plan
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {!isPending && (
                  <Link href={`/lift-plans/${plan.id}`}>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      View Full Plan
                    </Button>
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
