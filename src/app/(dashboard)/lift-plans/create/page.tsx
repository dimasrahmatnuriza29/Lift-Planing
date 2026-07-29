"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Weight,
  Construction,
  ShieldCheck,
  Mountain,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Save,
  Send,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useWizard } from "@/lib/wizard-store";

interface MasterData {
  divisi: Array<{ id: number; name: string; code: string; description: string | null }>;
  loadTypes: Array<{ id: number; name: string; category: string; defaultWeight: number | null }>;
  hazards: Array<{ id: number; name: string; category: string; description: string | null; defaultMitigation: string | null; riskWeight: number }>;
  cranes: Array<{
    id: number;
    model: string;
    craneClass: string;
    maxCapacity: number;
    maxBoomLength: number;
    maxRadius: number;
    outriggerLoad: number | null;
    loadChart: Array<{ radius: number; capacity: number }>;
  }>;
}

const steps = [
  { title: "Lift Request", icon: ClipboardList, desc: "Informasi dasar lift" },
  { title: "Load Analysis", icon: Weight, desc: "Detail beban" },
  { title: "Crane Selection", icon: Construction, desc: "Pilih crane & check kapasitas" },
  { title: "Rigging Plan", icon: ShieldCheck, desc: "Sling & shackle calculation" },
  { title: "Site Assessment", icon: Mountain, desc: "Kondisi lokasi" },
  { title: "Risk Assessment", icon: AlertTriangle, desc: "Hazard & mitigasi" },
  { title: "Review", icon: FileText, desc: "Review semua data" },
  { title: "Submit", icon: CheckCircle2, desc: "Submit & generate" },
];

export default function CreateLiftPlanPage() {
  const router = useRouter();
  const { step, nextStep, prevStep, setStep, formData, updateFormData, reset } = useWizard();
  const [master, setMaster] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: number; planNumber: string } | null>(null);

  useEffect(() => {
    fetch("/api/master")
      .then((res) => res.json())
      .then((data) => {
        setMaster(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (status: "draft" | "submitted") => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/lift-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status }),
      });
      const result = await res.json();
      if (res.ok) {
        if (status === "submitted") {
          setSubmitted({ id: result.id, planNumber: result.planNumber });
          setStep(8);
          toast.success(`Lift Plan ${result.planNumber} submitted successfully!`);
        } else {
          toast.success(`Draft ${result.planNumber} saved!`);
          router.push(`/lift-plans/${result.id}`);
        }
      } else {
        toast.error("Failed to create lift plan");
      }
    } catch {
      toast.error("Failed to create lift plan");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (submitted && step === 8) {
    return <SuccessScreen planNumber={submitted.planNumber} planId={submitted.id} router={router} reset={reset} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/lift-plans")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Lift Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">Wizard 8-step untuk membuat lift plan baru</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex overflow-x-auto pb-2">
        <div className="flex items-center gap-1 min-w-max">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === i + 1;
            const isDone = step > i + 1;
            return (
              <div key={i} className="flex items-center">
                <button
                  onClick={() => step > i + 1 && setStep(i + 1)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                    isActive ? "bg-cat-yellow text-cat-black font-semibold" : isDone ? "text-status-success cursor-pointer hover:bg-muted" : "text-muted-foreground"
                  }`}
                  disabled={!isDone && !isActive}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? "bg-cat-black text-cat-yellow" : isDone ? "bg-status-success/10" : "bg-muted"}`}>
                    {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="text-sm hidden sm:block">{s.title}</span>
                </button>
                {i < steps.length - 1 && <div className={`h-0.5 w-4 sm:w-8 ${isDone ? "bg-status-success" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {step === 1 && <Step1LiftRequest master={master} formData={formData} updateFormData={updateFormData} />}
          {step === 2 && <Step2LoadAnalysis master={master} formData={formData} updateFormData={updateFormData} />}
          {step === 3 && <Step3CraneSelection master={master} formData={formData} updateFormData={updateFormData} />}
          {step === 4 && <Step4RiggingPlan formData={formData} updateFormData={updateFormData} />}
          {step === 5 && <Step5SiteAssessment formData={formData} updateFormData={updateFormData} />}
          {step === 6 && <Step6RiskAssessment master={master} formData={formData} updateFormData={updateFormData} />}
          {step === 7 && <Step7Review master={master} formData={formData} />}
        </motion.div>
      </AnimatePresence>

      {step < 8 && (
        <div className="flex justify-between gap-4">
          <Button variant="outline" onClick={prevStep} disabled={step === 1} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex gap-2">
            {step === 7 && (
              <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Draft
              </Button>
            )}
            {step === 7 ? (
              <Button variant="cat" onClick={() => handleSubmit("submitted")} disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit Plan
              </Button>
            ) : (
              <Button variant="cat" onClick={nextStep} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Step1LiftRequest({ master, formData, updateFormData }: { master: MasterData | null; formData: Record<string, unknown>; updateFormData: (data: Record<string, unknown>) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-yellow/10"><ClipboardList className="h-5 w-5 text-cat-black" /></div>
          <div><CardTitle>Step 1: Lift Request</CardTitle><CardDescription>Informasi dasar permintaan lift</CardDescription></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Divisi *</Label>
            <Select value={String(formData.divisiId || "")} onValueChange={(v) => updateFormData({ divisiId: parseInt(v) })}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih divisi" /></SelectTrigger>
              <SelectContent>{master?.divisi.map((d) => (<SelectItem key={d.id} value={String(d.id)}>{d.name} — {d.description}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Lift Type</Label>
            <Select value={String(formData.liftType || "routine")} onValueChange={(v) => updateFormData({ liftType: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih tipe" /></SelectTrigger>
              <SelectContent><SelectItem value="routine">Routine Lift</SelectItem><SelectItem value="critical">Critical Lift</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Title *</Label>
          <Input className="mt-1.5" placeholder="e.g. Engine Overhaul Cat 3512 - Lift Engine" value={String(formData.title || "")} onChange={(e) => updateFormData({ title: e.target.value })} />
        </div>
        <div>
          <Label>Description</Label>
          <Input className="mt-1.5" placeholder="Deskripsi singkat lift plan" value={String(formData.description || "")} onChange={(e) => updateFormData({ description: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Scheduled Date</Label><Input type="date" className="mt-1.5" value={String(formData.scheduledDate || "")} onChange={(e) => updateFormData({ scheduledDate: e.target.value })} /></div>
          <div><Label>Location</Label><Input className="mt-1.5" placeholder="e.g. Workshop Trakindo Balikpapan" value={String(formData.location || "")} onChange={(e) => updateFormData({ location: e.target.value })} /></div>
        </div>
      </CardContent>
    </Card>
  );
}

function Step2LoadAnalysis({ master, formData, updateFormData }: { master: MasterData | null; formData: Record<string, unknown>; updateFormData: (data: Record<string, unknown>) => void }) {
  const weight = Number(formData.loadWeight || 0);
  const riggingEstimate = Math.round(weight * 0.05 * 100) / 100;
  const totalLoad = Math.round((weight + riggingEstimate) * 100) / 100;
  useEffect(() => { if (weight > 0) updateFormData({ totalLoad, riggingEstimate }); }, [weight, totalLoad, updateFormData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-blue/10"><Weight className="h-5 w-5 text-cat-blue" /></div>
          <div><CardTitle>Step 2: Load Analysis</CardTitle><CardDescription>Detail beban yang akan diangkat</CardDescription></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Load Type</Label>
          <Select value={String(formData.loadTypeId || "")} onValueChange={(v) => { const lt = master?.loadTypes.find((l) => l.id === parseInt(v)); updateFormData({ loadTypeId: parseInt(v), loadDescription: lt?.name || "", loadWeight: lt?.defaultWeight || formData.loadWeight }); }}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih tipe beban" /></SelectTrigger>
            <SelectContent>{master?.loadTypes.map((lt) => (<SelectItem key={lt.id} value={String(lt.id)}>{lt.name} {lt.defaultWeight ? `(${lt.defaultWeight.toLocaleString()} kg)` : ""}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div><Label>Load Description</Label><Input className="mt-1.5" placeholder="e.g. Engine Cat 3512B" value={String(formData.loadDescription || "")} onChange={(e) => updateFormData({ loadDescription: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><Label>Weight (kg) *</Label><Input type="number" className="mt-1.5" placeholder="8500" value={String(formData.loadWeight || "")} onChange={(e) => updateFormData({ loadWeight: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label>Length (m)</Label><Input type="number" className="mt-1.5" placeholder="3.2" value={String(formData.loadLength || "")} onChange={(e) => updateFormData({ loadLength: parseFloat(e.target.value) || undefined })} /></div>
          <div><Label>Width (m)</Label><Input type="number" className="mt-1.5" placeholder="1.8" value={String(formData.loadWidth || "")} onChange={(e) => updateFormData({ loadWidth: parseFloat(e.target.value) || undefined })} /></div>
          <div><Label>Height (m)</Label><Input type="number" className="mt-1.5" placeholder="2.1" value={String(formData.loadHeight || "")} onChange={(e) => updateFormData({ loadHeight: parseFloat(e.target.value) || undefined })} /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label>CoG X (m)</Label><Input type="number" className="mt-1.5" placeholder="1.6" value={String(formData.cogX || "")} onChange={(e) => updateFormData({ cogX: parseFloat(e.target.value) || undefined })} /></div>
          <div><Label>CoG Y (m)</Label><Input type="number" className="mt-1.5" placeholder="0.9" value={String(formData.cogY || "")} onChange={(e) => updateFormData({ cogY: parseFloat(e.target.value) || undefined })} /></div>
          <div><Label>CoG Z (m)</Label><Input type="number" className="mt-1.5" placeholder="1.05" value={String(formData.cogZ || "")} onChange={(e) => updateFormData({ cogZ: parseFloat(e.target.value) || undefined })} /></div>
        </div>
        {weight > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-cat-yellow/10 p-4 border border-cat-yellow/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-Calculated Total Load:</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-cat-black dark:text-cat-yellow">{totalLoad.toLocaleString()} kg</span>
                <p className="text-xs text-muted-foreground mt-0.5">Weight ({weight.toLocaleString()} kg) + Rigging Est. ({riggingEstimate.toLocaleString()} kg)</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function Step3CraneSelection({ master, formData, updateFormData }: { master: MasterData | null; formData: Record<string, unknown>; updateFormData: (data: Record<string, unknown>) => void }) {
  const selectedCrane = master?.cranes.find((c) => c.id === Number(formData.craneId));
  const radius = Number(formData.liftRadius || 0);
  const totalLoad = Number(formData.totalLoad || 0);
  const getCapacityAtRadius = (crane: MasterData["cranes"][0], r: number) => {
    const chart = crane.loadChart;
    if (chart.length === 0) return 0;
    if (r <= chart[0].radius) return chart[0].capacity;
    if (r >= chart[chart.length - 1].radius) return chart[chart.length - 1].capacity;
    for (let i = 0; i < chart.length - 1; i++) {
      if (r >= chart[i].radius && r <= chart[i + 1].radius) {
        const ratio = (r - chart[i].radius) / (chart[i + 1].radius - chart[i].radius);
        return Math.round(chart[i].capacity + ratio * (chart[i + 1].capacity - chart[i].capacity));
      }
    }
    return 0;
  };
  const capacity = selectedCrane ? getCapacityAtRadius(selectedCrane, radius) : 0;
  const utilization = capacity > 0 ? (totalLoad / capacity) * 100 : 0;
  useEffect(() => { if (selectedCrane && radius > 0) updateFormData({ craneCapacityAtRadius: capacity, utilizationPct: Math.round(utilization * 100) / 100 }); }, [capacity, utilization, selectedCrane, radius, updateFormData]);
  const utilColor = utilization > 75 ? "text-status-danger" : utilization > 50 ? "text-status-warning" : "text-status-success";
  const utilBg = utilization > 75 ? "bg-status-danger" : utilization > 50 ? "bg-status-warning" : "bg-status-success";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-yellow/10"><Construction className="h-5 w-5 text-cat-black" /></div>
          <div><CardTitle>Step 3: Crane Selection</CardTitle><CardDescription>Pilih crane dan check kapasitas pada radius lift</CardDescription></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <Label>Crane *</Label>
            <Select value={String(formData.craneId || "")} onValueChange={(v) => updateFormData({ craneId: parseInt(v) })}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih crane" /></SelectTrigger>
              <SelectContent>{master?.cranes.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.model} ({c.craneClass})</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div><Label>Lift Radius (m) *</Label><Input type="number" className="mt-1.5" placeholder="10" value={String(formData.liftRadius || "")} onChange={(e) => updateFormData({ liftRadius: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label>Boom Length (m)</Label><Input type="number" className="mt-1.5" placeholder="25" value={String(formData.boomLength || "")} onChange={(e) => updateFormData({ boomLength: parseFloat(e.target.value) || undefined })} /></div>
        </div>
        {selectedCrane && radius > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted p-4"><p className="text-xs text-muted-foreground">Crane</p><p className="text-lg font-bold">{selectedCrane.model}</p><p className="text-xs text-muted-foreground">{selectedCrane.craneClass}</p></div>
              <div className="rounded-lg bg-muted p-4"><p className="text-xs text-muted-foreground">Capacity at {radius}m</p><p className="text-lg font-bold">{capacity.toLocaleString()} kg</p><p className="text-xs text-muted-foreground">{(capacity / 1000).toFixed(1)} ton</p></div>
              <div className="rounded-lg bg-muted p-4"><p className="text-xs text-muted-foreground">Utilization</p><p className={`text-lg font-bold ${utilColor}`}>{utilization.toFixed(0)}%</p><Progress value={utilization} className="mt-2 h-2" indicatorClassName={utilBg} /></div>
            </div>
            {utilization > 75 && (<div className="flex items-center gap-2 rounded-lg bg-status-danger/10 p-3 text-sm text-status-danger"><AlertTriangle className="h-4 w-4" />Utilization di atas 75% — Critical threshold! Pertimbangkan crane yang lebih besar.</div>)}
            {utilization > 100 && (<div className="flex items-center gap-2 rounded-lg bg-status-danger/10 p-3 text-sm text-status-danger"><AlertTriangle className="h-4 w-4" />OVERLOAD! Beban melebihi kapasitas crane pada radius ini.</div>)}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedCrane.loadChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="wizCapacity" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ffcd11" stopOpacity={0.8} /><stop offset="95%" stopColor="#ffcd11" stopOpacity={0.1} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="radius" className="text-xs" label={{ value: "Radius (m)", position: "insideBottom", offset: -5 }} />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`} />
                  <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} kg`, "Capacity"]} labelFormatter={(l) => `Radius: ${l}m`} />
                  <ReferenceLine x={radius} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" label={{ value: `R: ${radius}m`, position: "top", fill: "#ef4444", fontSize: 11 }} />
                  {totalLoad > 0 && (<ReferenceLine y={totalLoad} stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" label={{ value: `Load: ${(totalLoad / 1000).toFixed(1)}t`, position: "right", fill: "#22c55e", fontSize: 11 }} />)}
                  <Area type="monotone" dataKey="capacity" stroke="#ffcd11" strokeWidth={3} fill="url(#wizCapacity)" dot={{ fill: "#1a1a1a", r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function Step4RiggingPlan({ formData, updateFormData }: { formData: Record<string, unknown>; updateFormData: (data: Record<string, unknown>) => void }) {
  const load = Number(formData.totalLoad || 0);
  const legs = Number(formData.slingLegs || 0);
  const angle = Number(formData.slingAngle || 0);
  const useSpreader = Boolean(formData.useSpreaderBeam);
  const beamLength = Number(formData.beamLength || 3);
  const beamCapacity = Number(formData.beamCapacity || 20);
  const angleRad = (angle * Math.PI) / 180;
  const loadLength = Number(formData.loadLength || 0);
  const cogX = Number(formData.cogX || 0);

  // Auto-recommend spreader beam if load length > 3m
  const recommendBeam = loadLength > 3;
  const recommendedBeamLength = Math.max(2, Math.ceil(loadLength * 0.8 * 2) / 2);

  // CoG imbalance: if CoG X is not at center, tension is asymmetric
  // imbalanceRatio = how much the heavier side carries (0.5 = balanced, >0.5 = heavier side)
  let cogImbalanceRatio = 0.5;
  if (loadLength > 0 && cogX > 0) {
    cogImbalanceRatio = cogX / loadLength;
    cogImbalanceRatio = Math.max(0.1, Math.min(0.9, cogImbalanceRatio));
  }
  const cogImbalanced = Math.abs(cogImbalanceRatio - 0.5) > 0.05;

  let slingTension = 0;
  let wllRequired = 0;
  let topTension = 0;
  let bottomTension = 0;
  let beamCompression = 0;
  let maxLegTension = 0;

  if (useSpreader && legs >= 2) {
    const beamHalf = beamLength / 2;
    const hookToBeam = beamHalf / Math.tan(angleRad);
    topTension = load / (2 * Math.sin(angleRad));
    bottomTension = load / legs;
    beamCompression = load / (2 * Math.tan(angleRad));
    slingTension = Math.max(topTension, bottomTension);
    // Apply CoG imbalance to bottom tension (each leg carries different load)
    maxLegTension = cogImbalanced ? bottomTension * Math.max(cogImbalanceRatio, 1 - cogImbalanceRatio) / 0.5 : slingTension;
    wllRequired = maxLegTension * 6;
  } else {
    slingTension = legs > 0 && angle > 0 ? load / (legs * Math.sin(angleRad)) : 0;
    // Apply CoG imbalance: heaviest leg carries more than equal share
    maxLegTension = cogImbalanced ? slingTension * Math.max(cogImbalanceRatio, 1 - cogImbalanceRatio) / 0.5 : slingTension;
    wllRequired = maxLegTension * 6;
  }

  useEffect(() => { if (slingTension > 0) updateFormData({ slingTension: Math.round(slingTension * 100) / 100, slingWllRequired: Math.round(wllRequired * 100) / 100, beamCompression: Math.round(beamCompression * 100) / 100 }); }, [slingTension, wllRequired, beamCompression, updateFormData]);
  const slingOptions = [{ wll: 1000, label: "1 ton WLL" }, { wll: 2000, label: "2 ton WLL" }, { wll: 4000, label: "4 ton WLL" }, { wll: 8000, label: "8 ton WLL" }, { wll: 12000, label: "12 ton WLL" }, { wll: 16000, label: "16 ton WLL" }, { wll: 25000, label: "25 ton WLL" }, { wll: 35000, label: "35 ton WLL" }, { wll: 50000, label: "50 ton WLL" }, { wll: 80000, label: "80 ton WLL" }, { wll: 100000, label: "100 ton WLL" }];
  const recommendedSling = slingOptions.find((s) => s.wll >= wllRequired);
  const beamOverload = beamCompression > 0 && beamCompression > beamCapacity * 1000;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-success/10"><ShieldCheck className="h-5 w-5 text-status-success" /></div>
          <div><CardTitle>Step 4: Rigging Plan</CardTitle><CardDescription>Hitung sling tension, WLL & spreader beam</CardDescription></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Number of Sling Legs *</Label><Select value={String(formData.slingLegs || "")} onValueChange={(v) => updateFormData({ slingLegs: parseInt(v) })}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih jumlah sling" /></SelectTrigger><SelectContent><SelectItem value="1">1 leg</SelectItem><SelectItem value="2">2 legs</SelectItem><SelectItem value="3">3 legs</SelectItem><SelectItem value="4">4 legs</SelectItem></SelectContent></Select></div>
          <div><Label>Sling Angle (degrees) *</Label><Select value={String(formData.slingAngle || "")} onValueChange={(v) => updateFormData({ slingAngle: parseInt(v) })}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih sudut sling" /></SelectTrigger><SelectContent><SelectItem value="30">30°</SelectItem><SelectItem value="45">45°</SelectItem><SelectItem value="60">60°</SelectItem><SelectItem value="75">75°</SelectItem><SelectItem value="90">90° (vertical)</SelectItem></SelectContent></Select></div>
        </div>

        {/* Spreader Beam Toggle */}
        <div className="rounded-lg border p-4 space-y-3">
          {recommendBeam && !useSpreader && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-lg bg-cat-yellow/10 border border-cat-yellow/30 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-cat-yellow" />
                <span className="text-sm">Beban {loadLength}m panjang — disarankan pakai spreader beam ({recommendedBeamLength}m)</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => updateFormData({ useSpreaderBeam: true, beamLength: recommendedBeamLength })}>Apply</Button>
            </motion.div>
          )}
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox checked={useSpreader} onCheckedChange={(v) => updateFormData({ useSpreaderBeam: Boolean(v) })} />
            <span className="text-sm font-medium">Use Spreader Beam</span>
            <span className="text-xs text-muted-foreground">— untuk beban dengan lift point lebar</span>
          </label>
          {useSpreader && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid gap-4 sm:grid-cols-2">
              <div><Label>Beam Length (m)</Label><Input type="number" step="0.5" className="mt-1.5" placeholder="3.0" value={String(formData.beamLength || "")} onChange={(e) => updateFormData({ beamLength: parseFloat(e.target.value) || 3 })} /></div>
              <div><Label>Beam Capacity (ton)</Label><Input type="number" className="mt-1.5" placeholder="20" value={String(formData.beamCapacity || "")} onChange={(e) => updateFormData({ beamCapacity: parseFloat(e.target.value) || 20 })} /></div>
            </motion.div>
          )}
        </div>

        {slingTension > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted p-4"><p className="text-xs text-muted-foreground">Sling Tension per Leg {cogImbalanced && "(avg)"}</p><p className="text-2xl font-bold">{Math.round(slingTension).toLocaleString()} kg</p><p className="text-xs text-muted-foreground mt-1">{useSpreader ? `Top: ${Math.round(topTension).toLocaleString()} | Bottom: ${Math.round(bottomTension).toLocaleString()}` : `= ${load.toLocaleString()} ÷ (${legs} × sin ${angle}°)`}</p></div>
              <div className="rounded-lg bg-muted p-4"><p className="text-xs text-muted-foreground">WLL Required (Safety Factor 6:1)</p><p className="text-2xl font-bold">{Math.round(wllRequired).toLocaleString()} kg</p><p className="text-xs text-muted-foreground mt-1">{cogImbalanced ? `= ${Math.round(maxLegTension).toLocaleString()} (max leg) × 6` : `= ${Math.round(slingTension).toLocaleString()} × 6`}</p></div>
            </div>

            {cogImbalanced && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-lg bg-status-warning/10 border border-status-warning/30 p-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-status-warning shrink-0" />
                <div>
                  <span className="font-medium text-status-warning">CoG Offset Detected!</span> CoG X = {cogX}m dari {loadLength}m beban.
                  <br />Tension tidak simetris — heaviest leg: <span className="font-bold">{Math.round(maxLegTension).toLocaleString()} kg</span> vs avg: {Math.round(slingTension).toLocaleString()} kg ({Math.round((Math.max(cogImbalanceRatio, 1 - cogImbalanceRatio) / 0.5) * 100)}% dari average).
                  WLL dihitung dari tension tertinggi.
                </div>
              </motion.div>
            )}

            {useSpreader && beamCompression > 0 && (
              <div className={`rounded-lg p-4 border ${beamOverload ? "bg-status-danger/10 border-status-danger/30" : "bg-cat-blue/10 border-cat-blue/30"}`}>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Beam Compression Force</p><p className="text-xs text-muted-foreground mt-0.5">= {load.toLocaleString()} ÷ (2 × tan {angle}°)</p></div>
                  <div className="text-right"><p className={`text-xl font-bold ${beamOverload ? "text-status-danger" : ""}`}>{Math.round(beamCompression).toLocaleString()} kg</p><p className="text-xs text-muted-foreground">Beam capacity: {beamCapacity} ton</p></div>
                </div>
                {beamOverload && <p className="text-sm text-status-danger mt-2 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />Beam overload! Pilih beam dengan capacity lebih besar.</p>}
              </div>
            )}

            {recommendedSling && (<div className="rounded-lg bg-status-success/10 p-4 border border-status-success/30"><p className="text-sm font-medium text-status-success">Recommended Sling:</p><p className="text-lg font-bold">{recommendedSling.label}</p></div>)}

            <RiggingDiagram legs={legs} angle={angle} load={load} slingTension={slingTension} useSpreader={useSpreader} beamLength={beamLength} topTension={topTension} bottomTension={bottomTension} beamCompression={beamCompression} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Sling Size Selected</Label><Select value={String(formData.slingSizeSelected || recommendedSling?.label || "")} onValueChange={(v) => updateFormData({ slingSizeSelected: v })}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih sling" /></SelectTrigger><SelectContent>{slingOptions.map((s) => (<SelectItem key={s.wll} value={s.label}>{s.label}</SelectItem>))}</SelectContent></Select></div>
              <div><Label>Shackle Size</Label><Input className="mt-1.5" placeholder="e.g. 15 ton" value={String(formData.shackleSizeSelected || "")} onChange={(e) => updateFormData({ shackleSizeSelected: e.target.value })} /></div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function Step5SiteAssessment({ formData, updateFormData }: { formData: Record<string, unknown>; updateFormData: (data: Record<string, unknown>) => void }) {
  const wind = Number(formData.windSpeed || 0);
  const slope = Number(formData.slope || 0);
  const clearance = Number(formData.overheadClearance || 0);
  const loadHeight = Number(formData.loadHeight || 0);
  const requiredClearance = loadHeight > 0 ? loadHeight + 2 : 3;
  const clearanceInsufficient = clearance > 0 && clearance < requiredClearance;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-warning/10"><Mountain className="h-5 w-5 text-status-warning" /></div>
          <div><CardTitle>Step 5: Site Assessment</CardTitle><CardDescription>Kondisi lokasi & lingkungan</CardDescription></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Ground Type</Label><Select value={String(formData.groundType || "")} onValueChange={(v) => updateFormData({ groundType: v })}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih tipe ground" /></SelectTrigger><SelectContent><SelectItem value="Concrete">Concrete</SelectItem><SelectItem value="Asphalt">Asphalt</SelectItem><SelectItem value="Gravel">Gravel</SelectItem><SelectItem value="Soil">Soil</SelectItem><SelectItem value="Mud">Mud</SelectItem><SelectItem value="Sand">Sand</SelectItem></SelectContent></Select></div>
          <div><Label>Ground Bearing Capacity (kPa)</Label><Input type="number" className="mt-1.5" placeholder="200" value={String(formData.groundBearingCapacity || "")} onChange={(e) => updateFormData({ groundBearingCapacity: parseFloat(e.target.value) || undefined })} /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><Label>Slope (degrees)</Label><Input type="number" className="mt-1.5" placeholder="2" value={String(formData.slope ?? "")} onChange={(e) => updateFormData({ slope: parseFloat(e.target.value) ?? 0 })} /></div>
          <div><Label>Wind Speed (km/h)</Label><Input type="number" className="mt-1.5" placeholder="12" value={String(formData.windSpeed || "")} onChange={(e) => updateFormData({ windSpeed: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label>Overhead Clearance (m)</Label><Input type="number" className="mt-1.5" placeholder="8" value={String(formData.overheadClearance || "")} onChange={(e) => updateFormData({ overheadClearance: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label>Nearest Obstacle (m)</Label><Input type="number" className="mt-1.5" placeholder="5" value={String(formData.nearestObstacle || "")} onChange={(e) => updateFormData({ nearestObstacle: parseFloat(e.target.value) || 0 })} /></div>
        </div>
        <div className="space-y-2">
          {wind > 30 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 rounded-lg bg-status-danger/10 p-3 text-sm text-status-danger"><AlertTriangle className="h-4 w-4" />Wind speed {wind} km/h — STOP LIFT! Melebihi batas aman (30 km/h)</motion.div>)}
          {wind > 20 && wind <= 30 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 rounded-lg bg-status-warning/10 p-3 text-sm text-status-warning"><AlertTriangle className="h-4 w-4" />Wind speed {wind} km/h — Warning! Monitor wind continuously</motion.div>)}
          {slope > 5 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 rounded-lg bg-status-warning/10 p-3 text-sm text-status-warning"><AlertTriangle className="h-4 w-4" />Slope {slope}° — Level crane atau pindah ke area flat</motion.div>)}
          {clearance > 0 && clearance < 3 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 rounded-lg bg-status-warning/10 p-3 text-sm text-status-warning"><AlertTriangle className="h-4 w-4" />Overhead clearance {clearance}m — Terlalu rendah (min 3m)</motion.div>)}
          {clearanceInsufficient && clearance >= 3 && loadHeight > 0 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 rounded-lg bg-status-warning/10 p-3 text-sm text-status-warning"><AlertTriangle className="h-4 w-4" />Overhead clearance {clearance}m — Beban {loadHeight}m + 2m safety = butuh min {requiredClearance}m. Clearance tidak cukup!</motion.div>)}
          {clearance > 0 && clearance >= requiredClearance && loadHeight > 0 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 rounded-lg bg-status-success/10 p-3 text-sm text-status-success"><CheckCircle2 className="h-4 w-4" />Overhead clearance OK — {clearance}m &gt; {requiredClearance}m required (load {loadHeight}m + 2m safety)</motion.div>)}
          {wind <= 20 && slope <= 5 && clearance >= 3 && !clearanceInsufficient && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 rounded-lg bg-status-success/10 p-3 text-sm text-status-success"><CheckCircle2 className="h-4 w-4" />Site conditions within safe parameters</motion.div>)}
        </div>
      </CardContent>
    </Card>
  );
}

function Step6RiskAssessment({ master, formData, updateFormData }: { master: MasterData | null; formData: Record<string, unknown>; updateFormData: (data: Record<string, unknown>) => void }) {
  const [selectedHazards, setSelectedHazards] = useState<number[]>((formData.hazardIds as number[]) || []);
  const toggleHazard = (id: number) => {
    const updated = selectedHazards.includes(id) ? selectedHazards.filter((h) => h !== id) : [...selectedHazards, id];
    setSelectedHazards(updated);
    const hazardDetails = master?.hazards.filter((h) => updated.includes(h.id)) || [];
    const names = hazardDetails.map((h) => h.name);
    const mitigations = hazardDetails.map((h) => h.defaultMitigation).filter(Boolean) as string[];
    let score = 0;
    hazardDetails.forEach((h) => (score += h.riskWeight));
    const util = Number(formData.utilizationPct || 0);
    const wind = Number(formData.windSpeed || 0);
    const slope = Number(formData.slope || 0);
    if (util > 75) score += 15; else if (util > 50) score += 8;
    if (wind > 30) score += 20; else if (wind > 20) score += 10;
    if (slope > 5) score += 10;
    score = Math.min(score, 100);
    let level = "low";
    if (score > 60) level = "high"; else if (score > 30) level = "medium";
    updateFormData({ hazardIds: updated, hazardsIdentified: names, mitigations, riskScore: score, riskLevel: level });
  };
  const riskScore = Number(formData.riskScore || 0);
  const riskLevel = String(formData.riskLevel || "low");
  const riskColor = riskLevel === "high" ? "text-status-danger" : riskLevel === "medium" ? "text-status-warning" : "text-status-success";
  const riskBg = riskLevel === "high" ? "bg-status-danger" : riskLevel === "medium" ? "bg-status-warning" : "bg-status-success";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-danger/10"><AlertTriangle className="h-5 w-5 text-status-danger" /></div>
          <div><CardTitle>Step 6: Risk Assessment</CardTitle><CardDescription>Identifikasi hazard & mitigasi</CardDescription></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-3 block">Select Identified Hazards</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {master?.hazards.map((hazard) => (
              <label key={hazard.id} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${selectedHazards.includes(hazard.id) ? "border-cat-yellow bg-cat-yellow/5" : "hover:bg-muted/50"}`}>
                <Checkbox checked={selectedHazards.includes(hazard.id)} onCheckedChange={() => toggleHazard(hazard.id)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{hazard.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{hazard.description}</p>
                  {selectedHazards.includes(hazard.id) && hazard.defaultMitigation && (<p className="text-xs text-status-success mt-1.5 flex items-start gap-1"><CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" />{hazard.defaultMitigation}</p>)}
                </div>
              </label>
            ))}
          </div>
        </div>
        {riskScore > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Score</span>
              <div className="flex items-center gap-3"><span className={`text-3xl font-bold ${riskColor}`}>{riskScore}</span><Badge variant={riskLevel === "high" ? "danger" : riskLevel === "medium" ? "warning" : "success"}>{riskLevel.toUpperCase()}</Badge></div>
            </div>
            <Progress value={riskScore} className="h-3" indicatorClassName={riskBg} />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function Step7Review({ master, formData }: { master: MasterData | null; formData: Record<string, unknown> }) {
  const divisi = master?.divisi.find((d) => d.id === Number(formData.divisiId));
  const crane = master?.cranes.find((c) => c.id === Number(formData.craneId));
  const loadType = master?.loadTypes.find((lt) => lt.id === Number(formData.loadTypeId));
  const f = formData;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-yellow/10"><FileText className="h-5 w-5 text-cat-black" /></div>
          <div><CardTitle>Step 7: Review Summary</CardTitle><CardDescription>Review semua data sebelum submit</CardDescription></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewSection title="Lift Request"><ReviewItem label="Divisi" value={divisi?.name || "-"} /><ReviewItem label="Type" value={String(f.liftType || "-")} /><ReviewItem label="Title" value={String(f.title || "-")} /><ReviewItem label="Location" value={String(f.location || "-")} /></ReviewSection>
          <ReviewSection title="Load Analysis"><ReviewItem label="Load Type" value={loadType?.name || "-"} /><ReviewItem label="Weight" value={`${Number(f.loadWeight || 0).toLocaleString()} kg`} /><ReviewItem label="Total Load" value={`${Number(f.totalLoad || 0).toLocaleString()} kg`} highlight /><ReviewItem label="Dimensions" value={`${f.loadLength || "-"} × ${f.loadWidth || "-"} × ${f.loadHeight || "-"} m`} /></ReviewSection>
          <ReviewSection title="Crane & Utilization"><ReviewItem label="Crane" value={crane?.model || "-"} /><ReviewItem label="Radius" value={`${f.liftRadius || "-"} m`} /><ReviewItem label="Capacity" value={`${Number(f.craneCapacityAtRadius || 0).toLocaleString()} kg`} /><ReviewItem label="Utilization" value={`${Number(f.utilizationPct || 0).toFixed(0)}%`} highlight /></ReviewSection>
          <ReviewSection title="Rigging"><ReviewItem label="Sling Legs" value={String(f.slingLegs || "-")} /><ReviewItem label="Sling Angle" value={`${f.slingAngle || "-"}°`} /><ReviewItem label="Tension/Leg" value={`${Number(f.slingTension || 0).toLocaleString()} kg`} /><ReviewItem label="WLL Required" value={`${Number(f.slingWllRequired || 0).toLocaleString()} kg`} highlight /></ReviewSection>
          <ReviewSection title="Site Assessment"><ReviewItem label="Ground" value={String(f.groundType || "-")} /><ReviewItem label="Wind" value={`${f.windSpeed || "-"} km/h`} /><ReviewItem label="Slope" value={`${f.slope ?? "-"}°`} /><ReviewItem label="Clearance" value={`${f.overheadClearance || "-"} m`} /></ReviewSection>
          <ReviewSection title="Risk Assessment"><ReviewItem label="Risk Score" value={String(f.riskScore || "-")} highlight /><ReviewItem label="Risk Level" value={String(f.riskLevel || "-").toUpperCase()} /><ReviewItem label="Hazards" value={`${(f.hazardsIdentified as string[])?.length || 0} identified`} /><ReviewItem label="Mitigations" value={`${(f.mitigations as string[])?.length || 0} actions`} /></ReviewSection>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="rounded-lg border p-4"><h4 className="text-sm font-semibold mb-3">{title}</h4><div className="space-y-2">{children}</div></div>);
}

function ReviewItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (<div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className={highlight ? "font-bold text-cat-black dark:text-cat-yellow" : "font-medium"}>{value}</span></div>);
}

function Gauge({ value, label, displayValue, color, sublabel }: { value: number; label: string; displayValue: string; color: string; sublabel?: string }) {
  const data = [{ name: label, value: Math.max(0, Math.min(100, value)), fill: color }];
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full" style={{ maxWidth: 140 }}>
        <ResponsiveContainer width="100%" height={100}>
          <RadialBarChart data={data} innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: "currentColor", opacity: 0.15 }} dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: "15%" }}>
          <span className="text-lg font-bold" style={{ color }}>{displayValue}</span>
          {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
        </div>
      </div>
      <p className="text-xs font-medium text-center mt-1">{label}</p>
    </div>
  );
}

function RiggingDiagram({ legs, angle, load, slingTension, useSpreader, beamLength, topTension, bottomTension, beamCompression }: { legs: number; angle: number; load: number; slingTension: number; useSpreader: boolean; beamLength: number; topTension: number; bottomTension: number; beamCompression: number }) {
  const legsForCalc = useSpreader ? 2 : legs;
  const angleRad = (angle * Math.PI) / 180;

  // Gauge 1: Angle Efficiency = sin(angle) × 100 (higher = better)
  const efficiency = Math.sin(angleRad) * 100;
  const effColor = efficiency >= 86 ? "#22c55e" : efficiency >= 70 ? "#eab308" : "#ef4444";

  // Gauge 2: Tension Multiplier vs vertical = 1/sin(angle) (lower = better). Map 1.0-2.0× → 0-100 (inverted for fill)
  const multiplier = angle > 0 ? 1 / Math.sin(angleRad) : 2;
  const multiplierPct = Math.min(100, ((multiplier - 1) / 1) * 100); // 1×→0%, 2×→100%
  const multColor = multiplier <= 1.16 ? "#22c55e" : multiplier <= 1.42 ? "#eab308" : "#ef4444";

  // Gauge 3: Load per Leg = slingTension / load × 100 (lower = better)
  const perLegPct = load > 0 ? (slingTension / load) * 100 : 0;
  const perLegColor = perLegPct <= 40 ? "#22c55e" : perLegPct <= 70 ? "#eab308" : "#ef4444";

  // Tension vs Angle chart data
  const chartData = [30, 45, 60, 75, 90].map((a) => {
    const t = load / (legsForCalc * Math.sin((a * Math.PI) / 180));
    return { angle: `${a}°`, tension: Math.round(t), current: a === angle };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border-2 border-cat-yellow/30 bg-gradient-to-b from-cat-yellow/5 to-transparent p-4 space-y-4">
      <p className="text-sm font-semibold text-center">Rigging Analysis — {useSpreader ? `${legs}-Point + Spreader Beam` : `${legs}-Point Lift`}, {angle}°</p>

      {/* Gauges */}
      <div className="grid grid-cols-3 gap-2">
        <Gauge value={efficiency} label="Angle Efficiency" displayValue={`${Math.round(efficiency)}%`} color={effColor} sublabel={efficiency >= 86 ? "Optimal" : efficiency >= 70 ? "Acceptable" : "Poor"} />
        <Gauge value={multiplierPct} label="Tension Factor" displayValue={`${multiplier.toFixed(2)}×`} color={multColor} sublabel={multiplier <= 1.16 ? "Low" : multiplier <= 1.42 ? "Moderate" : "High"} />
        <Gauge value={perLegPct} label="Load per Leg" displayValue={`${Math.round(perLegPct)}%`} color={perLegColor} sublabel={`${Math.round(slingTension).toLocaleString()} kg`} />
      </div>

      {/* Tension vs Angle Chart */}
      <div>
        <p className="text-xs font-medium mb-2 text-center text-muted-foreground">Sling Tension vs Angle — kenapa sudut penting</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
            <XAxis dataKey="angle" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`} />
            <Tooltip
              formatter={(v) => [`${Number(v).toLocaleString()} kg`, "Tension/leg"]}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="tension" radius={[6, 6, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.current ? "#ffcd11" : "#d1d5db"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-center text-muted-foreground mt-1">
          Sudut terpilih <span className="font-bold text-cat-black dark:text-cat-yellow">{angle}°</span> = {Math.round(slingTension).toLocaleString()} kg/leg.
          {angle < 60 && <span className="text-status-danger font-medium"> Sudut kecil → tension tinggi!</span>}
          {angle >= 60 && <span className="text-status-success font-medium"> Sudut ideal.</span>}
        </p>
      </div>

      {useSpreader && beamCompression > 0 && (
        <div className="rounded-lg bg-cat-blue/10 border border-cat-blue/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">Spreader Beam {beamLength}m — Compression Force</p>
          <p className="text-lg font-bold text-cat-blue">{Math.round(beamCompression).toLocaleString()} kg</p>
        </div>
      )}
    </motion.div>
  );
}

function SuccessScreen({ planNumber, planId, router, reset }: { planNumber: string; planId: number; router: ReturnType<typeof useRouter>; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 0.8 }} className="flex h-24 w-24 items-center justify-center rounded-full bg-status-success/10 mb-6">
        <CheckCircle2 className="h-14 w-14 text-status-success" />
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-bold mb-2">Lift Plan Created!</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted-foreground mb-1">Plan Number: <span className="font-mono font-bold text-cat-black dark:text-cat-yellow">{planNumber}</span></motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-sm text-muted-foreground mb-8">Approval workflow has been initiated. Supervisors will be notified.</motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex gap-3">
        <Button variant="cat" onClick={() => router.push(`/lift-plans/${planId}`)}>View Detail</Button>
        <Button variant="outline" onClick={() => { reset(); router.push("/lift-plans"); }}>Back to List</Button>
      </motion.div>
    </div>
  );
}
