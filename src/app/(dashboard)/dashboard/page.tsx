"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  HardHat,
  Gauge,
  TrendingUp,
} from "lucide-react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DashboardStats {
  totalPlans: number;
  approvedPlans: number;
  pendingPlans: number;
  criticalPlans: number;
  avgUtilization: number;
  highUtilCount: number;
  recentPlans: Array<{
    id: number;
    planNumber: string;
    title: string;
    status: string;
    liftType: string;
    divisi: string;
    scheduledDate: string | null;
  }>;
  statusDist: Array<{ name: string; value: number; color: string }>;
  riskDist: Array<{ name: string; value: number; color: string }>;
  divisiBreakdown: Array<{ name: string; plans: number }>;
  monthlyTrends: Array<{ month: string; plans: number; critical: number }>;
  craneUsage: Array<{ name: string; plans: number }>;
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-xl bg-muted" />
          <div className="h-80 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Lift Plans",
      value: stats?.totalPlans ?? 0,
      icon: ClipboardList,
      color: "text-cat-blue",
      bg: "bg-cat-blue/10",
    },
    {
      title: "Approved",
      value: stats?.approvedPlans ?? 0,
      icon: CheckCircle2,
      color: "text-status-success",
      bg: "bg-status-success/10",
    },
    {
      title: "Pending Approval",
      value: stats?.pendingPlans ?? 0,
      icon: Clock,
      color: "text-status-warning",
      bg: "bg-status-warning/10",
    },
    {
      title: "Critical Lifts",
      value: stats?.criticalPlans ?? 0,
      icon: AlertTriangle,
      color: "text-status-danger",
      bg: "bg-status-danger/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview Lift Planning System - Trakindo
          </p>
        </div>
        <Link href="/lift-plans/create">
          <Button variant="cat" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Lift Plan
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1: Status Pie + Risk Pie */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Plan Status Distribution</CardTitle>
              <CardDescription>Lift plans by current status</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.statusDist && stats.statusDist.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={(props) => `${props.name ?? ""}: ${props.value ?? 0}`} labelLine={false} style={{ fontSize: "11px" }}>
                        {stats.statusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No data available</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader>
              <CardTitle>Risk Level Distribution</CardTitle>
              <CardDescription>Lift plans by risk classification</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.riskDist && stats.riskDist.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.riskDist} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={(props) => `${props.name ?? ""}: ${props.value ?? 0}`} labelLine={false} style={{ fontSize: "11px" }}>
                        {stats.riskDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No data available</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2: Monthly Trends + Divisi Breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cat-yellow" />
                <div>
                  <CardTitle>Monthly Lift Plan Trends</CardTitle>
                  <CardDescription>Last 6 months activity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {stats?.monthlyTrends ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.monthlyTrends} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="plansGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffcd11" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ffcd11" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis allowDecimals={false} className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Area type="monotone" dataKey="plans" stroke="#ffcd11" strokeWidth={2} fill="url(#plansGrad)" name="Total Plans" />
                      <Area type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} fill="url(#criticalGrad)" name="Critical" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No data available</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card>
            <CardHeader>
              <CardTitle>Lift Plans by Division</CardTitle>
              <CardDescription>Distribution across Trakindo divisions</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.divisiBreakdown && stats.divisiBreakdown.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.divisiBreakdown} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis allowDecimals={false} className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} cursor={{ fill: "var(--muted)" }} />
                      <Bar dataKey="plans" fill="#ffcd11" radius={[6, 6, 0, 0]} name="Plans" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No data available</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 3: Utilization + Crane Usage */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-cat-blue" />
                <div>
                  <CardTitle>Crane Utilization Overview</CardTitle>
                  <CardDescription>Average utilization across all plans</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Utilization</span>
                <span className={`text-2xl font-bold ${(stats?.avgUtilization ?? 0) > 75 ? "text-status-danger" : (stats?.avgUtilization ?? 0) > 50 ? "text-status-warning" : "text-status-success"}`}>
                  {stats?.avgUtilization ?? 0}%
                </span>
              </div>
              <Progress value={stats?.avgUtilization ?? 0} indicatorClassName={(stats?.avgUtilization ?? 0) > 75 ? "bg-status-danger" : (stats?.avgUtilization ?? 0) > 50 ? "bg-status-warning" : "bg-status-success"} />
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-lg bg-status-success/10 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Safe (&lt;50%)</p>
                  <p className="text-lg font-bold text-status-success">{(stats?.totalPlans ?? 0) - (stats?.highUtilCount ?? 0)}</p>
                </div>
                <div className="rounded-lg bg-status-warning/10 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Moderate (50-75%)</p>
                  <p className="text-lg font-bold text-status-warning">{Math.max(0, (stats?.highUtilCount ?? 0) > 0 ? Math.round((stats?.highUtilCount ?? 0) / 2) : 0)}</p>
                </div>
                <div className="rounded-lg bg-status-danger/10 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Critical (&gt;75%)</p>
                  <p className="text-lg font-bold text-status-danger">{stats?.highUtilCount ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Card>
            <CardHeader>
              <CardTitle>Crane Usage</CardTitle>
              <CardDescription>Most used cranes in lift plans</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.craneUsage && stats.craneUsage.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.craneUsage} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} className="text-xs" />
                      <YAxis type="category" dataKey="name" className="text-xs" width={70} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} cursor={{ fill: "var(--muted)" }} />
                      <Bar dataKey="plans" fill="#1a1a1a" radius={[0, 6, 6, 0]} name="Plans" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No crane usage data</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Lift Plans */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Lift Plans</CardTitle>
                <CardDescription>Latest lift plan activities</CardDescription>
              </div>
              <Link href="/lift-plans">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentPlans?.map((plan, i) => (
                <motion.div key={plan.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.1 }}>
                  <Link href={`/lift-plans/${plan.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cat-yellow/10">
                          <HardHat className="h-5 w-5 text-cat-black" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{plan.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {plan.planNumber} · {plan.divisi}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {plan.liftType === "critical" && (
                          <Badge variant="danger">Critical</Badge>
                        )}
                        <Badge variant={statusVariant[plan.status] || "secondary"}>
                          {statusLabel[plan.status] || plan.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
