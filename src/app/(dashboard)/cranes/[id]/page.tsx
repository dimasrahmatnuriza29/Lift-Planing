"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Construction,
  Weight,
  Ruler,
  Maximize,
  Gauge,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CraneDetail {
  id: number;
  model: string;
  craneClass: string;
  maxCapacity: number;
  maxBoomLength: number;
  maxRadius: number;
  outriggerLoad: number | null;
  loadChart: Array<{ radius: number; capacity: number }>;
}

export default function CraneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [crane, setCrane] = useState<CraneDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cranes/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCrane(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!crane) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Crane not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/cranes")}>
          Back to Cranes
        </Button>
      </div>
    );
  }

  const specs = [
    {
      label: "Max Capacity",
      value: `${(crane.maxCapacity / 1000).toFixed(0)} ton`,
      icon: Weight,
      color: "text-cat-blue",
      bg: "bg-cat-blue/10",
    },
    {
      label: "Max Boom Length",
      value: `${crane.maxBoomLength}m`,
      icon: Ruler,
      color: "text-status-success",
      bg: "bg-status-success/10",
    },
    {
      label: "Max Radius",
      value: `${crane.maxRadius}m`,
      icon: Maximize,
      color: "text-status-info",
      bg: "bg-status-info/10",
    },
    {
      label: "Outrigger Load",
      value: crane.outriggerLoad
        ? `${(crane.outriggerLoad / 1000).toFixed(0)} ton`
        : "-",
      icon: Gauge,
      color: "text-status-warning",
      bg: "bg-status-warning/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/cranes")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cranes
        </Button>
      </motion.div>

      {/* Crane Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cat-yellow">
            <Construction className="h-8 w-8 text-cat-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{crane.model}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Caterpillar Crane · {crane.craneClass} class
            </p>
          </div>
        </div>
        <Badge variant="cat" className="text-sm px-4 py-2 self-start">
          {crane.craneClass}
        </Badge>
      </motion.div>

      {/* Spec Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {specs.map((spec, i) => {
          const Icon = spec.icon;
          return (
            <motion.div
              key={spec.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${spec.bg}`}>
                    <Icon className={`h-6 w-6 ${spec.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{spec.label}</p>
                    <p className="text-xl font-bold">{spec.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Load Chart Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-yellow/10">
                <TrendingDown className="h-5 w-5 text-cat-black" />
              </div>
              <div>
                <CardTitle>Load Chart</CardTitle>
                <CardDescription>
                  Capacity vs Radius — semakin besar radius, semakin kecil kapasitas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={crane.loadChart}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="capacityGradient" x1="0" y1="0" x2="0" y2="1">
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
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}t`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [
                      `${Number(value).toLocaleString()} kg (${(Number(value) / 1000).toFixed(1)} ton)`,
                      "Capacity",
                    ]}
                    labelFormatter={(label) => `Radius: ${label}m`}
                  />
                  <Area
                    type="monotone"
                    dataKey="capacity"
                    stroke="#ffcd11"
                    strokeWidth={3}
                    fill="url(#capacityGradient)"
                    dot={{ fill: "#1a1a1a", r: 5 }}
                    activeDot={{ r: 7, fill: "#ffcd11" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Load Chart Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Detailed Load Chart Data</CardTitle>
            <CardDescription>
              Kapasitas crane pada setiap radius
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Radius (m)</TableHead>
                  <TableHead className="text-right">Capacity (kg)</TableHead>
                  <TableHead className="text-right">Capacity (ton)</TableHead>
                  <TableHead className="text-right">% of Max</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crane.loadChart.map((point, i) => (
                  <motion.tr
                    key={point.radius}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{point.radius}m</TableCell>
                    <TableCell className="text-right">
                      {point.capacity.toLocaleString()} kg
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(point.capacity / 1000).toFixed(1)} ton
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          point.capacity / crane.maxCapacity > 0.75
                            ? "success"
                            : point.capacity / crane.maxCapacity > 0.4
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {((point.capacity / crane.maxCapacity) * 100).toFixed(0)}%
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
