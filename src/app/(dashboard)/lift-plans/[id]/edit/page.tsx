"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface EditData {
  title: string;
  description: string;
  liftType: string;
  status: string;
  scheduledDate: string;
  location: string;
  loadDescription: string;
  loadWeight: string;
  loadLength: string;
  loadWidth: string;
  loadHeight: string;
  cogX: string;
  cogY: string;
  cogZ: string;
  totalLoad: string;
  liftRadius: string;
  boomLength: string;
  boomAngle: string;
  craneCapacityAtRadius: string;
  utilizationPct: string;
  slingLegs: string;
  slingAngle: string;
  slingTension: string;
  slingWllRequired: string;
  slingSizeSelected: string;
  shackleSizeSelected: string;
  groundType: string;
  groundBearingCapacity: string;
  slope: string;
  windSpeed: string;
  overheadClearance: string;
  nearestObstacle: string;
  riskScore: string;
  riskLevel: string;
}

const emptyForm: EditData = {
  title: "", description: "", liftType: "routine", status: "draft",
  scheduledDate: "", location: "", loadDescription: "", loadWeight: "",
  loadLength: "", loadWidth: "", loadHeight: "", cogX: "", cogY: "", cogZ: "",
  totalLoad: "", liftRadius: "", boomLength: "", boomAngle: "",
  craneCapacityAtRadius: "", utilizationPct: "", slingLegs: "", slingAngle: "",
  slingTension: "", slingWllRequired: "", slingSizeSelected: "", shackleSizeSelected: "",
  groundType: "", groundBearingCapacity: "", slope: "", windSpeed: "",
  overheadClearance: "", nearestObstacle: "", riskScore: "", riskLevel: "low",
};

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

export default function EditLiftPlanPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<EditData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planNumber, setPlanNumber] = useState("");

  useEffect(() => {
    fetch(`/api/lift-plans/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          setLoading(false);
          return;
        }
        setPlanNumber(data.planNumber || "");
        setForm({
          title: data.title || "",
          description: data.description || "",
          liftType: data.liftType || "routine",
          status: data.status || "draft",
          scheduledDate: data.scheduledDate ? data.scheduledDate.split("T")[0] : "",
          location: data.location || "",
          loadDescription: data.loadDescription || "",
          loadWeight: data.loadWeight?.toString() || "",
          loadLength: data.loadLength?.toString() || "",
          loadWidth: data.loadWidth?.toString() || "",
          loadHeight: data.loadHeight?.toString() || "",
          cogX: data.cogX?.toString() || "",
          cogY: data.cogY?.toString() || "",
          cogZ: data.cogZ?.toString() || "",
          totalLoad: data.totalLoad?.toString() || "",
          liftRadius: data.liftRadius?.toString() || "",
          boomLength: data.boomLength?.toString() || "",
          boomAngle: data.boomAngle?.toString() || "",
          craneCapacityAtRadius: data.craneCapacityAtRadius?.toString() || "",
          utilizationPct: data.utilizationPct?.toString() || "",
          slingLegs: data.slingLegs?.toString() || "",
          slingAngle: data.slingAngle?.toString() || "",
          slingTension: data.slingTension?.toString() || "",
          slingWllRequired: data.slingWllRequired?.toString() || "",
          slingSizeSelected: data.slingSizeSelected || "",
          shackleSizeSelected: data.shackleSizeSelected || "",
          groundType: data.groundType || "",
          groundBearingCapacity: data.groundBearingCapacity?.toString() || "",
          slope: data.slope?.toString() || "",
          windSpeed: data.windSpeed?.toString() || "",
          overheadClearance: data.overheadClearance?.toString() || "",
          nearestObstacle: data.nearestObstacle?.toString() || "",
          riskScore: data.riskScore?.toString() || "",
          riskLevel: data.riskLevel || "low",
        });
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load lift plan");
        setLoading(false);
      });
  }, [params.id]);

  const update = (field: keyof EditData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || null,
        liftType: form.liftType,
        status: form.status,
        scheduledDate: form.scheduledDate || null,
        location: form.location || null,
        loadDescription: form.loadDescription || null,
        loadWeight: form.loadWeight ? parseFloat(form.loadWeight) : null,
        loadLength: form.loadLength ? parseFloat(form.loadLength) : null,
        loadWidth: form.loadWidth ? parseFloat(form.loadWidth) : null,
        loadHeight: form.loadHeight ? parseFloat(form.loadHeight) : null,
        cogX: form.cogX ? parseFloat(form.cogX) : null,
        cogY: form.cogY ? parseFloat(form.cogY) : null,
        cogZ: form.cogZ ? parseFloat(form.cogZ) : null,
        totalLoad: form.totalLoad ? parseFloat(form.totalLoad) : null,
        liftRadius: form.liftRadius ? parseFloat(form.liftRadius) : null,
        boomLength: form.boomLength ? parseFloat(form.boomLength) : null,
        boomAngle: form.boomAngle ? parseFloat(form.boomAngle) : null,
        craneCapacityAtRadius: form.craneCapacityAtRadius ? parseFloat(form.craneCapacityAtRadius) : null,
        utilizationPct: form.utilizationPct ? parseFloat(form.utilizationPct) : null,
        slingLegs: form.slingLegs ? parseInt(form.slingLegs) : null,
        slingAngle: form.slingAngle ? parseFloat(form.slingAngle) : null,
        slingTension: form.slingTension ? parseFloat(form.slingTension) : null,
        slingWllRequired: form.slingWllRequired ? parseFloat(form.slingWllRequired) : null,
        slingSizeSelected: form.slingSizeSelected || null,
        shackleSizeSelected: form.shackleSizeSelected || null,
        groundType: form.groundType || null,
        groundBearingCapacity: form.groundBearingCapacity ? parseFloat(form.groundBearingCapacity) : null,
        slope: form.slope ? parseFloat(form.slope) : null,
        windSpeed: form.windSpeed ? parseFloat(form.windSpeed) : null,
        overheadClearance: form.overheadClearance ? parseFloat(form.overheadClearance) : null,
        nearestObstacle: form.nearestObstacle ? parseFloat(form.nearestObstacle) : null,
        riskScore: form.riskScore ? parseFloat(form.riskScore) : null,
        riskLevel: form.riskLevel || null,
      };

      const res = await fetch(`/api/lift-plans/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
      } else {
        toast.success("Lift plan updated successfully!");
        router.push(`/lift-plans/${params.id}`);
      }
    } catch {
      toast.error("Network error");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" className="gap-2" onClick={() => router.push(`/lift-plans/${params.id}`)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Detail
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="font-mono">{planNumber}</Badge>
          <h1 className="text-2xl font-bold">Edit Lift Plan</h1>
        </div>
        <p className="text-sm text-muted-foreground">Update lift plan information</p>
      </motion.div>

      {/* General Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Basic lift plan details</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => update("description", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Lift Type</Label>
              <Select value={form.liftType} onValueChange={(v) => update("liftType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Scheduled Date</Label>
              <Input type="date" value={form.scheduledDate} onChange={(e) => update("scheduledDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => update("location", e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Load Analysis */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader><CardTitle>Load Analysis</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Load Description</Label>
              <Input value={form.loadDescription} onChange={(e) => update("loadDescription", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Weight (kg)</Label>
              <Input type="number" value={form.loadWeight} onChange={(e) => update("loadWeight", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Total Load (kg)</Label>
              <Input type="number" value={form.totalLoad} onChange={(e) => update("totalLoad", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Length (m)</Label>
              <Input type="number" value={form.loadLength} onChange={(e) => update("loadLength", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Width (m)</Label>
              <Input type="number" value={form.loadWidth} onChange={(e) => update("loadWidth", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Height (m)</Label>
              <Input type="number" value={form.loadHeight} onChange={(e) => update("loadHeight", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>CoG X (m)</Label>
              <Input type="number" value={form.cogX} onChange={(e) => update("cogX", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>CoG Y (m)</Label>
              <Input type="number" value={form.cogY} onChange={(e) => update("cogY", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>CoG Z (m)</Label>
              <Input type="number" value={form.cogZ} onChange={(e) => update("cogZ", e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Crane & Rigging */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader><CardTitle>Crane & Rigging</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Lift Radius (m)</Label>
              <Input type="number" value={form.liftRadius} onChange={(e) => update("liftRadius", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Boom Length (m)</Label>
              <Input type="number" value={form.boomLength} onChange={(e) => update("boomLength", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Boom Angle (°)</Label>
              <Input type="number" value={form.boomAngle} onChange={(e) => update("boomAngle", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Capacity at Radius (kg)</Label>
              <Input type="number" value={form.craneCapacityAtRadius} onChange={(e) => update("craneCapacityAtRadius", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Utilization (%)</Label>
              <Input type="number" value={form.utilizationPct} onChange={(e) => update("utilizationPct", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sling Legs</Label>
              <Input type="number" value={form.slingLegs} onChange={(e) => update("slingLegs", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sling Angle (°)</Label>
              <Input type="number" value={form.slingAngle} onChange={(e) => update("slingAngle", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sling Tension (kg)</Label>
              <Input type="number" value={form.slingTension} onChange={(e) => update("slingTension", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>WLL Required (kg)</Label>
              <Input type="number" value={form.slingWllRequired} onChange={(e) => update("slingWllRequired", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sling Selected</Label>
              <Input value={form.slingSizeSelected} onChange={(e) => update("slingSizeSelected", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Shackle Selected</Label>
              <Input value={form.shackleSizeSelected} onChange={(e) => update("shackleSizeSelected", e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Site Assessment & Risk */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader><CardTitle>Site Assessment & Risk</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Ground Type</Label>
              <Input value={form.groundType} onChange={(e) => update("groundType", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Bearing Capacity (kPa)</Label>
              <Input type="number" value={form.groundBearingCapacity} onChange={(e) => update("groundBearingCapacity", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Slope (°)</Label>
              <Input type="number" value={form.slope} onChange={(e) => update("slope", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Wind Speed (km/h)</Label>
              <Input type="number" value={form.windSpeed} onChange={(e) => update("windSpeed", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Overhead Clearance (m)</Label>
              <Input type="number" value={form.overheadClearance} onChange={(e) => update("overheadClearance", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nearest Obstacle (m)</Label>
              <Input type="number" value={form.nearestObstacle} onChange={(e) => update("nearestObstacle", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Risk Score</Label>
              <Input type="number" value={form.riskScore} onChange={(e) => update("riskScore", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Risk Level</Label>
              <Select value={form.riskLevel} onValueChange={(v) => update("riskLevel", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Separator className="mb-4" />
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push(`/lift-plans/${params.id}`)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.title} className="bg-cat-yellow text-cat-black hover:bg-cat-yellow/90 gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
