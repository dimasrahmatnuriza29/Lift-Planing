"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  HardHat,
  Weight,
  Ruler,
  Construction,
  Wind,
  Mountain,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Edit,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { generateLiftPlanPDF } from "@/lib/pdf-generator";

interface LiftPlanDetail {
  id: number;
  planNumber: string;
  title: string;
  description: string | null;
  liftType: string;
  status: string;
  scheduledDate: string | null;
  location: string | null;
  divisi: { name: string; code: string };
  loadType: { name: string; category: string } | null;
  loadDescription: string | null;
  loadWeight: number | null;
  loadLength: number | null;
  loadWidth: number | null;
  loadHeight: number | null;
  cogX: number | null;
  cogY: number | null;
  cogZ: number | null;
  totalLoad: number | null;
  crane: {
    id: number;
    model: string;
    craneClass: string;
    maxCapacity: number;
    loadChart: Array<{ radius: number; capacity: number }>;
  } | null;
  liftRadius: number | null;
  boomLength: number | null;
  boomAngle: number | null;
  craneCapacityAtRadius: number | null;
  utilizationPct: number | null;
  slingLegs: number | null;
  slingAngle: number | null;
  slingTension: number | null;
  slingWllRequired: number | null;
  slingSizeSelected: string | null;
  shackleSizeSelected: string | null;
  groundType: string | null;
  groundBearingCapacity: number | null;
  slope: number | null;
  windSpeed: number | null;
  overheadClearance: number | null;
  nearestObstacle: number | null;
  riskScore: number | null;
  riskLevel: string | null;
  hazardsIdentified: string[];
  mitigations: string[];
  createdBy: string | null;
  createdAt: string;
  approvals: Array<{
    id: number;
    approverRole: string;
    approverName: string;
    status: string;
    comment: string | null;
    approvedAt: string | null;
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

const roleLabel: Record<string, string> = {
  rigger: "Rigger",
  supervisor: "Supervisor",
  safety_officer: "Safety Officer",
  manager: "Manager",
};

export default function LiftPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<LiftPlanDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lift-plans/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPlan(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Lift plan not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/lift-plans")}>
          Back to Lift Plans
        </Button>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const loadChartData = plan.crane?.loadChart || [];
  const utilizationColor =
    (plan.utilizationPct ?? 0) > 75
      ? "text-status-danger"
      : (plan.utilizationPct ?? 0) > 50
      ? "text-status-warning"
      : "text-status-success";

  return (
    <div className="space-y-6">
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" className="gap-2" onClick={() => router.push("/lift-plans")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Lift Plans
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cat-yellow">
            <HardHat className="h-8 w-8 text-cat-black" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-muted-foreground">{plan.planNumber}</span>
              <Badge variant={statusVariant[plan.status] || "secondary"}>
                {statusLabel[plan.status] || plan.status}
              </Badge>
              {plan.liftType === "critical" && <Badge variant="danger">Critical</Badge>}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{plan.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => {
            if (!plan) return;
            try {
              const doc = generateLiftPlanPDF(plan);
              doc.save(`${plan.planNumber}.pdf`);
              toast.success("PDF downloaded successfully!");
            } catch {
              toast.error("Failed to generate PDF");
            }
          }}>
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button variant="cat" className="gap-2" onClick={() => router.push(`/lift-plans/${plan.id}/edit`)}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </motion.div>

      {/* Quick Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 lg:grid-cols-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Divisi</p>
                <p className="text-sm font-medium">{plan.divisi?.name || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Schedule</p>
                <p className="text-sm font-medium">{formatDate(plan.scheduledDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{plan.location || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Construction className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Crane</p>
                <p className="text-sm font-medium">{plan.crane?.model || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Load</p>
                <p className="text-sm font-medium">
                  {plan.totalLoad ? `${(plan.totalLoad / 1000).toFixed(1)} ton` : "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Risk</p>
                {plan.riskLevel ? (
                  <Badge variant={riskVariant[plan.riskLevel] || "secondary"} className="text-xs">
                    {plan.riskLevel}
                  </Badge>
                ) : (
                  <p className="text-sm font-medium">-</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Load Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-blue/10">
                  <Weight className="h-5 w-5 text-cat-blue" />
                </div>
                <div>
                  <CardTitle>Load Analysis</CardTitle>
                  <CardDescription>Detail beban yang diangkat</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Load Type" value={plan.loadType?.name || "-"} />
                <InfoRow label="Description" value={plan.loadDescription || "-"} />
                <InfoRow label="Weight" value={plan.loadWeight ? `${plan.loadWeight.toLocaleString()} kg` : "-"} />
                <InfoRow label="Total Load" value={plan.totalLoad ? `${plan.totalLoad.toLocaleString()} kg` : "-"} highlight />
                <InfoRow label="Length" value={plan.loadLength ? `${plan.loadLength} m` : "-"} />
                <InfoRow label="Width" value={plan.loadWidth ? `${plan.loadWidth} m` : "-"} />
                <InfoRow label="Height" value={plan.loadHeight ? `${plan.loadHeight} m` : "-"} />
                <InfoRow label="CoG (X, Y, Z)" value={
                  plan.cogX != null
                    ? `${plan.cogX}, ${plan.cogY}, ${plan.cogZ} m`
                    : "-"
                } />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Crane & Utilization */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-yellow/10">
                  <Construction className="h-5 w-5 text-cat-black" />
                </div>
                <div>
                  <CardTitle>Crane & Utilization</CardTitle>
                  <CardDescription>Crane selection & capacity check</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Crane Model" value={plan.crane?.model || "-"} />
                <InfoRow label="Crane Class" value={plan.crane?.craneClass || "-"} />
                <InfoRow label="Lift Radius" value={plan.liftRadius ? `${plan.liftRadius} m` : "-"} />
                <InfoRow label="Boom Length" value={plan.boomLength ? `${plan.boomLength} m` : "-"} />
                <InfoRow label="Boom Angle" value={plan.boomAngle ? `${plan.boomAngle}°` : "-"} />
                <InfoRow label="Capacity at Radius" value={plan.craneCapacityAtRadius ? `${plan.craneCapacityAtRadius.toLocaleString()} kg` : "-"} />
              </div>
              {plan.utilizationPct != null && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Utilization</span>
                    <span className={`text-lg font-bold ${utilizationColor}`}>
                      {plan.utilizationPct.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={plan.utilizationPct}
                    indicatorClassName={
                      plan.utilizationPct > 75
                        ? "bg-status-danger"
                        : plan.utilizationPct > 50
                        ? "bg-status-warning"
                        : "bg-status-success"
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {plan.utilizationPct > 75
                      ? "⚠️ Over 75% — Critical threshold"
                      : plan.utilizationPct > 50
                      ? "Moderate utilization — within safe range"
                      : "✅ Safe utilization — well within capacity"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Rigging Plan */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-success/10">
                  <ShieldCheck className="h-5 w-5 text-status-success" />
                </div>
                <div>
                  <CardTitle>Rigging Plan</CardTitle>
                  <CardDescription>Sling & shackle specifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Sling Legs" value={plan.slingLegs ? `${plan.slingLegs}` : "-"} />
                <InfoRow label="Sling Angle" value={plan.slingAngle ? `${plan.slingAngle}°` : "-"} />
                <InfoRow label="Sling Tension" value={plan.slingTension ? `${plan.slingTension.toLocaleString()} kg` : "-"} />
                <InfoRow label="WLL Required" value={plan.slingWllRequired ? `${plan.slingWllRequired.toLocaleString()} kg` : "-"} highlight />
                <InfoRow label="Sling Selected" value={plan.slingSizeSelected || "-"} />
                <InfoRow label="Shackle Selected" value={plan.shackleSizeSelected || "-"} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Site Assessment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-warning/10">
                  <Mountain className="h-5 w-5 text-status-warning" />
                </div>
                <div>
                  <CardTitle>Site Assessment</CardTitle>
                  <CardDescription>Ground & environmental conditions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Ground Type" value={plan.groundType || "-"} />
                <InfoRow label="Bearing Capacity" value={plan.groundBearingCapacity ? `${plan.groundBearingCapacity} kPa` : "-"} />
                <InfoRow label="Slope" value={plan.slope != null ? `${plan.slope}°` : "-"} />
                <InfoRow
                  label="Wind Speed"
                  value={plan.windSpeed != null ? `${plan.windSpeed} km/h` : "-"}
                  highlight={plan.windSpeed != null && plan.windSpeed > 20}
                />
                <InfoRow label="Overhead Clearance" value={plan.overheadClearance ? `${plan.overheadClearance} m` : "-"} />
                <InfoRow label="Nearest Obstacle" value={plan.nearestObstacle ? `${plan.nearestObstacle} m` : "-"} />
              </div>
              {plan.windSpeed != null && plan.windSpeed > 20 && (
                <div className="flex items-center gap-2 rounded-lg bg-status-danger/10 p-3 text-sm text-status-danger">
                  <Wind className="h-4 w-4" />
                  Wind speed exceeds safe threshold (20 km/h)
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Load Chart with Reference Line */}
      {plan.crane && loadChartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-yellow/10">
                  <FileText className="h-5 w-5 text-cat-black" />
                </div>
                <div>
                  <CardTitle>Load Chart - {plan.crane.model}</CardTitle>
                  <CardDescription>
                    Capacity curve dengan marker pada radius lift ({plan.liftRadius}m)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={loadChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="capacityGradDetail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffcd11" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ffcd11" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="radius"
                      label={{ value: "Radius (m)", position: "insideBottom", offset: -5 }}
                      className="text-xs"
                    />
                    <YAxis
                      label={{ value: "Capacity (kg)", angle: -90, position: "insideLeft" }}
                      className="text-xs"
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                      formatter={(v) => [`${Number(v).toLocaleString()} kg`, "Capacity"]}
                      labelFormatter={(l) => `Radius: ${l}m`}
                    />
                    {plan.liftRadius != null && (
                      <ReferenceLine
                        x={plan.liftRadius}
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        label={{
                          value: `Lift Radius: ${plan.liftRadius}m`,
                          position: "top",
                          fill: "#ef4444",
                          fontSize: 12,
                        }}
                      />
                    )}
                    {plan.totalLoad != null && (
                      <ReferenceLine
                        y={plan.totalLoad}
                        stroke="#22c55e"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        label={{
                          value: `Load: ${(plan.totalLoad / 1000).toFixed(1)}t`,
                          position: "right",
                          fill: "#22c55e",
                          fontSize: 12,
                        }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="capacity"
                      stroke="#ffcd11"
                      strokeWidth={3}
                      fill="url(#capacityGradDetail)"
                      dot={{ fill: "#1a1a1a", r: 5 }}
                      activeDot={{ r: 7, fill: "#ffcd11" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Risk Assessment */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-danger/10">
                <AlertTriangle className="h-5 w-5 text-status-danger" />
              </div>
              <div>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Hazard identification & mitigation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.riskScore != null && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Risk Score</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{plan.riskScore.toFixed(0)}</span>
                    <Badge variant={riskVariant[plan.riskLevel || "low"] || "secondary"}>
                      {plan.riskLevel || "low"}
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={plan.riskScore}
                  indicatorClassName={
                    plan.riskScore > 60
                      ? "bg-status-danger"
                      : plan.riskScore > 30
                      ? "bg-status-warning"
                      : "bg-status-success"
                  }
                />
              </div>
            )}
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-2">Hazards Identified</h4>
              {plan.hazardsIdentified.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {plan.hazardsIdentified.map((hazard, i) => (
                    <Badge key={i} variant="warning">{hazard}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hazards identified</p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Mitigations</h4>
              {plan.mitigations.length > 0 ? (
                <ul className="space-y-1.5">
                  {plan.mitigations.map((mit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-status-success mt-0.5 shrink-0" />
                      {mit}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No mitigations specified</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Approval Workflow */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <Card>
          <CardHeader>
            <CardTitle>Approval Workflow</CardTitle>
            <CardDescription>Multi-level approval tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plan.approvals.map((approval, i) => (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  {/* Status Icon */}
                  <div className="relative flex flex-col items-center">
                    {approval.status === "approved" ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-success/10">
                        <CheckCircle2 className="h-5 w-5 text-status-success" />
                      </div>
                    ) : approval.status === "rejected" ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-danger/10">
                        <XCircle className="h-5 w-5 text-status-danger" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    {i < plan.approvals.length - 1 && (
                      <div className="absolute top-10 h-full w-0.5 bg-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {roleLabel[approval.approverRole] || approval.approverRole}
                        </p>
                        <p className="text-xs text-muted-foreground">{approval.approverName}</p>
                      </div>
                      <Badge
                        variant={
                          approval.status === "approved"
                            ? "success"
                            : approval.status === "rejected"
                            ? "danger"
                            : "secondary"
                        }
                      >
                        {approval.status}
                      </Badge>
                    </div>
                    {approval.approvedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(approval.approvedAt)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm ${highlight ? "font-bold text-cat-black dark:text-cat-yellow" : "font-medium"}`}>
        {value}
      </p>
    </div>
  );
}
