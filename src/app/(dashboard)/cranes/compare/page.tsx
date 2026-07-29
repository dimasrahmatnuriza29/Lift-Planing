"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GitCompare,
  X,
  Construction,
  Weight,
  Ruler,
  Maximize,
  Gauge,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Crane {
  id: number;
  model: string;
  craneClass: string;
  maxCapacity: number;
  maxBoomLength: number;
  maxRadius: number;
  outriggerLoad: number | null;
  loadChart: Array<{ radius: number; capacity: number }>;
}

const craneColors = ["#ffcd11", "#1a1a1a", "#3b82f6"];

export default function CraneComparePage() {
  const [cranes, setCranes] = useState<Crane[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [testLoad, setTestLoad] = useState<string>("");
  const [testRadius, setTestRadius] = useState<string>("");

  useEffect(() => {
    fetch("/api/cranes")
      .then((res) => res.json())
      .then((data) => {
        setCranes(data);
        if (data.length >= 2) {
          setSelectedIds([data[0].id, data[1].id]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedCranes = cranes.filter((c) => selectedIds.includes(c.id));
  const filteredCranes = cranes.filter(
    (c) =>
      c.model.toLowerCase().includes(search.toLowerCase()) ||
      c.craneClass.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCrane = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  // Build overlay chart data: merge all load charts by radius
  const allRadii = [...new Set(selectedCranes.flatMap((c) => c.loadChart.map((p) => p.radius)))].sort((a, b) => a - b);
  const overlayData = allRadii.map((radius) => {
    const point: Record<string, number> = { radius };
    selectedCranes.forEach((c) => {
      const entry = c.loadChart.find((p) => p.radius === radius);
      point[c.model] = entry ? entry.capacity : 0;
    });
    return point;
  });

  // Test load/radius recommendation
  const testLoadNum = testLoad ? parseFloat(testLoad) : 0;
  const testRadiusNum = testRadius ? parseFloat(testRadius) : 0;
  const recommendations = selectedCranes.map((c) => {
    const capacityAtRadius = c.loadChart
      .filter((p) => p.radius <= testRadiusNum)
      .sort((a, b) => b.radius - a.radius)[0];
    const canLift = capacityAtRadius ? capacityAtRadius.capacity >= testLoadNum * 1000 : false;
    const utilization = capacityAtRadius ? (testLoadNum * 1000 / capacityAtRadius.capacity) * 100 : 0;
    return {
      crane: c,
      capacityAtRadius: capacityAtRadius?.capacity || 0,
      canLift,
      utilization: Math.round(utilization),
    };
  });
  const bestPick = recommendations.filter((r) => r.canLift).sort((a, b) => a.utilization - b.utilization)[0];

  const specRows = [
    { label: "Max Capacity", key: "maxCapacity", format: (v: number | null) => v != null ? `${(v / 1000).toFixed(0)} ton` : "-", icon: Weight },
    { label: "Max Boom Length", key: "maxBoomLength", format: (v: number | null) => v != null ? `${v} m` : "-", icon: Ruler },
    { label: "Max Radius", key: "maxRadius", format: (v: number | null) => v != null ? `${v} m` : "-", icon: Maximize },
    { label: "Outrigger Load", key: "outriggerLoad", format: (v: number | null) => v ? `${(v / 1000).toFixed(0)} ton` : "-", icon: Gauge },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GitCompare className="h-7 w-7 text-cat-yellow" />
            Crane Compare
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bandingkan spesifikasi & load chart 2-3 crane side-by-side
          </p>
        </div>
        <Badge variant="cat" className="text-sm px-3 py-1.5">
          {selectedIds.length}/3 Selected
        </Badge>
      </div>

      {/* Crane Selector */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>Select Cranes to Compare</CardTitle>
            <CardDescription>Pilih maksimal 3 crane untuk perbandingan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md mb-4">
              <Input placeholder="Search crane..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {filteredCranes.map((crane) => {
                const isSelected = selectedIds.includes(crane.id);
                const isDisabled = !isSelected && selectedIds.length >= 3;
                return (
                  <button
                    key={crane.id}
                    onClick={() => toggleCrane(crane.id)}
                    disabled={isDisabled}
                    className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                      isSelected
                        ? "border-cat-yellow bg-cat-yellow/10"
                        : isDisabled
                        ? "border-muted opacity-40 cursor-not-allowed"
                        : "border-border hover:border-cat-yellow/50 hover:bg-muted/50"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-cat-yellow flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cat-black" />
                      </div>
                    )}
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cat-yellow/10 mb-2">
                      <Construction className="h-4 w-4 text-cat-black" />
                    </div>
                    <p className="font-bold text-sm">{crane.model}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{(crane.maxCapacity / 1000).toFixed(0)}t · {crane.craneClass}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {selectedCranes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GitCompare className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground mt-4">Select at least 2 cranes to compare</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Load Chart Overlay */}
          {selectedCranes.length >= 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-cat-yellow" />
                    <div>
                      <CardTitle>Load Chart Overlay</CardTitle>
                      <CardDescription>Capacity vs Radius comparison</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={overlayData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="radius" className="text-xs" label={{ value: "Radius (m)", position: "insideBottom", offset: -5, className: "text-xs" }} />
                        <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`} label={{ value: "Capacity (ton)", angle: -90, position: "insideLeft", className: "text-xs" }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                          formatter={(v) => `${Number(v).toLocaleString()} kg`}
                          labelFormatter={(l) => `Radius: ${l}m`}
                        />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        {selectedCranes.map((crane, i) => (
                          <Line
                            key={crane.id}
                            type="monotone"
                            dataKey={crane.model}
                            stroke={craneColors[i]}
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: craneColors[i] }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                        {testRadiusNum > 0 && (
                          <ReferenceLine x={testRadiusNum} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" label={{ value: `${testRadiusNum}m`, position: "top", fill: "#ef4444", fontSize: 11 }} />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Spec Comparison Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Specification Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Specification</th>
                        {selectedCranes.map((crane, i) => (
                          <th key={crane.id} className="text-center py-3 px-4">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${craneColors[i]}20` }}>
                                <Construction className="h-5 w-5" style={{ color: craneColors[i] }} />
                              </div>
                              <span className="font-bold text-sm">{crane.model}</span>
                              <Badge variant="outline" className="text-xs">{crane.craneClass}</Badge>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {specRows.map((row) => {
                        const Icon = row.icon;
                        const values = selectedCranes.map((c) => (c as unknown as Record<string, unknown>)[row.key] as number | null);
                        const maxVal = Math.max(...values.filter((v) => v != null).map((v) => v as number));
                        return (
                          <tr key={row.key} className="border-b last:border-0">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{row.label}</span>
                              </div>
                            </td>
                            {selectedCranes.map((crane, i) => {
                              const val = (crane as unknown as Record<string, unknown>)[row.key] as number | null;
                              const isBest = val === maxVal && val != null;
                              return (
                                <td key={crane.id} className="text-center py-3 px-4">
                                  <div className="inline-flex items-center gap-1.5">
                                    <span className={`text-sm font-medium ${isBest ? "text-status-success" : ""}`}>
                                      {row.format(val)}
                                    </span>
                                    {isBest && <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lift Scenario Tester */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-cat-blue" />
                  <div>
                    <CardTitle>Lift Scenario Tester</CardTitle>
                    <CardDescription>Test load & radius to find the best crane for your lift</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Load (ton)</label>
                    <Input type="number" placeholder="e.g. 45" value={testLoad} onChange={(e) => setTestLoad(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Radius (m)</label>
                    <Input type="number" placeholder="e.g. 12" value={testRadius} onChange={(e) => setTestRadius(e.target.value)} />
                  </div>
                </div>

                {testLoadNum > 0 && testRadiusNum > 0 && (
                  <div className="space-y-3 pt-2">
                    {bestPick && (
                      <div className="rounded-lg bg-status-success/10 border border-status-success/30 p-4 flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-status-success shrink-0" />
                        <div>
                          <p className="font-bold text-status-success">Recommended: {bestPick.crane.model}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {bestPick.utilization}% utilization at {testRadiusNum}m radius — capacity {((bestPick.capacityAtRadius) / 1000).toFixed(1)}t
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-3">
                      {recommendations.map((rec, i) => (
                        <div
                          key={rec.crane.id}
                          className={`rounded-xl border-2 p-4 ${
                            rec.canLift
                              ? bestPick?.crane.id === rec.crane.id
                                ? "border-status-success bg-status-success/5"
                                : "border-border"
                              : "border-status-danger/30 bg-status-danger/5"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm" style={{ color: craneColors[i] }}>{rec.crane.model}</span>
                            {rec.canLift ? (
                              <CheckCircle2 className="h-4 w-4 text-status-success" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-status-danger" />
                            )}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Capacity at {testRadiusNum}m</span>
                              <span className="font-medium">{((rec.capacityAtRadius) / 1000).toFixed(1)}t</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Utilization</span>
                              <span className={`font-bold ${rec.utilization > 75 ? "text-status-danger" : rec.utilization > 50 ? "text-status-warning" : "text-status-success"}`}>
                                {rec.utilization > 0 ? `${rec.utilization}%` : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status</span>
                              <span className={`font-medium ${rec.canLift ? "text-status-success" : "text-status-danger"}`}>
                                {rec.canLift ? "Can Lift" : "Cannot Lift"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {!bestPick && (
                      <div className="rounded-lg bg-status-danger/10 border border-status-danger/30 p-4 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-status-danger shrink-0" />
                        <p className="text-sm text-status-danger">
                          None of the selected cranes can lift {testLoadNum}t at {testRadiusNum}m radius. Consider a larger crane.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {(!testLoadNum || !testRadiusNum) && (
                  <p className="text-sm text-muted-foreground">Enter load and radius to see which crane is best suited for your lift scenario.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Selected Crane Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedCranes.map((crane, i) => (
              <motion.div key={crane.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                <Card className="relative">
                  <button
                    onClick={() => toggleCrane(crane.id)}
                    className="absolute top-3 right-3 h-6 w-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${craneColors[i]}20` }}>
                        <Construction className="h-5 w-5" style={{ color: craneColors[i] }} />
                      </div>
                      <div>
                        <p className="font-bold">{crane.model}</p>
                        <Badge variant="outline" className="text-xs mt-0.5">{crane.craneClass}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Capacity</span>
                        <span className="font-medium">{(crane.maxCapacity / 1000).toFixed(0)} ton</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Boom Length</span>
                        <span className="font-medium">{crane.maxBoomLength} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Radius</span>
                        <span className="font-medium">{crane.maxRadius} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Outrigger Load</span>
                        <span className="font-medium">{crane.outriggerLoad ? `${(crane.outriggerLoad / 1000).toFixed(0)} t` : "-"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
