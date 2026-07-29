"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Building2,
  Package,
  AlertTriangle,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Save,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Divisi = { id: number; name: string; code: string; description: string | null };
type LoadType = { id: number; name: string; category: string; defaultWeight: number | null };
type Hazard = { id: number; name: string; category: string; description: string | null; defaultMitigation: string | null; riskWeight: number };
type User = { id: number; name: string; role: string; divisiId: number | null; email: string | null; divisi?: Divisi | null };

type TabId = "divisi" | "loadTypes" | "hazards" | "users";

const tabs: { id: TabId; label: string; icon: typeof Building2 }[] = [
  { id: "divisi", label: "Divisi", icon: Building2 },
  { id: "loadTypes", label: "Load Types", icon: Package },
  { id: "hazards", label: "Hazard Templates", icon: AlertTriangle },
  { id: "users", label: "Users", icon: Users },
];

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

const categoryColors: Record<string, string> = {
  component: "bg-blue-500/10 text-blue-600",
  container: "bg-purple-500/10 text-purple-600",
  structure: "bg-orange-500/10 text-orange-600",
  environmental: "bg-green-500/10 text-green-600",
  ground: "bg-yellow-500/10 text-yellow-600",
  weather: "bg-cyan-500/10 text-cyan-600",
  personnel: "bg-pink-500/10 text-pink-600",
  load: "bg-red-500/10 text-red-600",
  operation: "bg-indigo-500/10 text-indigo-600",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("divisi");
  const [divisi, setDivisi] = useState<Divisi[]>([]);
  const [loadTypes, setLoadTypes] = useState<LoadType[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/master");
      const data = await res.json();
      setDivisi(data.divisi || []);
      setLoadTypes(data.loadTypes || []);
      setHazards(data.hazards || []);
      // Fetch users separately
      const userRes = await fetch("/api/master/users");
      if (userRes.ok) {
        const userData = await userRes.json();
        setUsers(userData);
      }
    } catch {
      setToast({ msg: "Failed to load data", type: "error" });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSave = async (endpoint: string, method: string, data: Record<string, unknown>, id?: number) => {
    setSaveLoading(true);
    try {
      const url = id ? `${endpoint}/${id}` : endpoint;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setToast({ msg: result.error || "Save failed", type: "error" });
      } else {
        setToast({ msg: id ? "Updated successfully" : "Created successfully", type: "success" });
        setIsDialogOpen(false);
        setEditingItem(null);
        await fetchData();
      }
    } catch {
      setToast({ msg: "Network error", type: "error" });
    }
    setSaveLoading(false);
  };

  const handleDelete = async (endpoint: string, id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setToast({ msg: data.error || "Delete failed", type: "error" });
      } else {
        setToast({ msg: "Deleted successfully", type: "success" });
        await fetchData();
      }
    } catch {
      setToast({ msg: "Network error", type: "error" });
    }
  };

  const openCreate = () => {
    setEditingItem({ _new: true });
    setIsDialogOpen(true);
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditingItem({ ...item, _new: false });
    setIsDialogOpen(true);
  };

  const itemCount: Record<TabId, number> = {
    divisi: divisi.length,
    loadTypes: loadTypes.length,
    hazards: hazards.length,
    users: users.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-yellow/10">
          <Settings className="h-5 w-5 text-cat-yellow" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage master data & system configuration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-cat-yellow text-cat-black shadow"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <Badge variant="outline" className={cn("text-xs", isActive ? "border-cat-black/20" : "")}>
                {itemCount[tab.id]}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "rounded-lg p-3 text-sm font-medium",
              toast.type === "success"
                ? "bg-status-success/10 text-status-success border border-status-success/30"
                : "bg-status-danger/10 text-status-danger border border-status-danger/30"
            )}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-cat-yellow" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "divisi" && (
              <DivisiTab
                items={divisi}
                onAdd={openCreate}
                onEdit={openEdit}
                onDelete={(id) => handleDelete("/api/master/divisi", id)}
              />
            )}
            {activeTab === "loadTypes" && (
              <LoadTypesTab
                items={loadTypes}
                onAdd={openCreate}
                onEdit={openEdit}
                onDelete={(id) => handleDelete("/api/master/load-types", id)}
              />
            )}
            {activeTab === "hazards" && (
              <HazardsTab
                items={hazards}
                onAdd={openCreate}
                onEdit={openEdit}
                onDelete={(id) => handleDelete("/api/master/hazards", id)}
              />
            )}
            {activeTab === "users" && (
              <UsersTab
                items={users}
                divisiList={divisi}
                onAdd={openCreate}
                onEdit={openEdit}
                onDelete={(id) => handleDelete("/api/master/users", id)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          {editingItem && activeTab === "divisi" && (
            <DivisiForm
              item={editingItem}
              onSave={(data) => {
                const isNew = editingItem._new;
                handleSave("/api/master/divisi", isNew ? "POST" : "PUT", data, isNew ? undefined : Number(editingItem.id));
              }}
              onCancel={() => { setIsDialogOpen(false); setEditingItem(null); }}
              saveLoading={saveLoading}
            />
          )}
          {editingItem && activeTab === "loadTypes" && (
            <LoadTypeForm
              item={editingItem}
              onSave={(data) => {
                const isNew = editingItem._new;
                handleSave("/api/master/load-types", isNew ? "POST" : "PUT", data, isNew ? undefined : Number(editingItem.id));
              }}
              onCancel={() => { setIsDialogOpen(false); setEditingItem(null); }}
              saveLoading={saveLoading}
            />
          )}
          {editingItem && activeTab === "hazards" && (
            <HazardForm
              item={editingItem}
              onSave={(data) => {
                const isNew = editingItem._new;
                handleSave("/api/master/hazards", isNew ? "POST" : "PUT", data, isNew ? undefined : Number(editingItem.id));
              }}
              onCancel={() => { setIsDialogOpen(false); setEditingItem(null); }}
              saveLoading={saveLoading}
            />
          )}
          {editingItem && activeTab === "users" && (
            <UserForm
              item={editingItem}
              divisiList={divisi}
              onSave={(data) => {
                const isNew = editingItem._new;
                handleSave("/api/master/users", isNew ? "POST" : "PUT", data, isNew ? undefined : Number(editingItem.id));
              }}
              onCancel={() => { setIsDialogOpen(false); setEditingItem(null); }}
              saveLoading={saveLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ TAB COMPONENTS ============

function TabHeader({ title, description, onAdd }: { title: string; description: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button onClick={onAdd} size="sm" className="bg-cat-yellow text-cat-black hover:bg-cat-yellow/90">
        <Plus className="h-4 w-4 mr-1" /> Add
      </Button>
    </div>
  );
}

function DivisiTab({ items, onAdd, onEdit, onDelete }: { items: Divisi[]; onAdd: () => void; onEdit: (i: Record<string, unknown>) => void; onDelete: (id: number) => void }) {
  return (
    <Card>
      <CardHeader><TabHeader title="Divisi" description="Business divisions that create lift plans" onAdd={onAdd} /></CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-yellow/10">
                    <Building2 className="h-5 w-5 text-cat-yellow" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <Badge variant="outline" className="text-xs mt-0.5">{item.code}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item as unknown as Record<string, unknown>)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5 text-status-danger" /></Button>
                </div>
              </div>
              {item.description && <p className="text-sm text-muted-foreground mt-3">{item.description}</p>}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadTypesTab({ items, onAdd, onEdit, onDelete }: { items: LoadType[]; onAdd: () => void; onEdit: (i: Record<string, unknown>) => void; onDelete: (id: number) => void }) {
  return (
    <Card>
      <CardHeader><TabHeader title="Load Types" description="Standard load categories for lift analysis" onAdd={onAdd} /></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium text-right">Default Weight</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b last:border-0">
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3"><Badge variant="outline" className={cn("text-xs border-0", categoryColors[item.category] || "bg-muted")}>{item.category}</Badge></td>
                  <td className="py-3 text-right">{item.defaultWeight ? `${item.defaultWeight.toLocaleString()} kg` : "-"}</td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(item as unknown as Record<string, unknown>)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5 text-status-danger" /></Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function HazardsTab({ items, onAdd, onEdit, onDelete }: { items: Hazard[]; onAdd: () => void; onEdit: (i: Record<string, unknown>) => void; onDelete: (id: number) => void }) {
  return (
    <Card>
      <CardHeader><TabHeader title="Hazard Templates" description="Predefined hazards with default mitigations" onAdd={onAdd} /></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-status-danger/10 shrink-0">
                    <ShieldAlert className="h-4 w-4 text-status-danger" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{item.name}</p>
                      <Badge variant="outline" className={cn("text-xs border-0", categoryColors[item.category] || "bg-muted")}>{item.category}</Badge>
                      <Badge variant="outline" className="text-xs">Weight: {item.riskWeight}</Badge>
                    </div>
                    {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                    {item.defaultMitigation && (
                      <p className="text-xs text-muted-foreground mt-1.5 italic">Mitigation: {item.defaultMitigation}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item as unknown as Record<string, unknown>)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5 text-status-danger" /></Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UsersTab({ items, divisiList, onAdd, onEdit, onDelete }: { items: User[]; divisiList: Divisi[]; onAdd: () => void; onEdit: (i: Record<string, unknown>) => void; onDelete: (id: number) => void }) {
  return (
    <Card>
      <CardHeader><TabHeader title="Users" description="System users and their roles" onAdd={onAdd} /></CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cat-yellow/10 text-sm font-bold text-cat-yellow">
                    {item.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className={cn("text-xs border-0", roleColors[item.role] || "")}>{roleLabels[item.role] || item.role}</Badge>
                      {item.divisi && <Badge variant="outline" className="text-xs">{item.divisi.name}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item as unknown as Record<string, unknown>)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5 text-status-danger" /></Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============ FORM COMPONENTS ============

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function DivisiForm({ item, onSave, onCancel, saveLoading }: { item: Record<string, unknown>; onSave: (d: Record<string, unknown>) => void; onCancel: () => void; saveLoading: boolean }) {
  const [name, setName] = useState(String(item.name || ""));
  const [code, setCode] = useState(String(item.code || ""));
  const [description, setDescription] = useState(String(item.description || ""));
  return (
    <>
      <DialogHeader><DialogTitle>{item._new ? "Add Divisi" : "Edit Divisi"}</DialogTitle></DialogHeader>
      <div className="space-y-4 py-4">
        <FormField label="Name *"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rental" /></FormField>
        <FormField label="Code *"><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. RNT" maxLength={5} /></FormField>
        <FormField label="Description"><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Sewa Alat Berat" /></FormField>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave({ name, code, description })} disabled={saveLoading || !name || !code} className="bg-cat-yellow text-cat-black hover:bg-cat-yellow/90">
          {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save
        </Button>
      </DialogFooter>
    </>
  );
}

function LoadTypeForm({ item, onSave, onCancel, saveLoading }: { item: Record<string, unknown>; onSave: (d: Record<string, unknown>) => void; onCancel: () => void; saveLoading: boolean }) {
  const [name, setName] = useState(String(item.name || ""));
  const [category, setCategory] = useState(String(item.category || "component"));
  const [defaultWeight, setDefaultWeight] = useState(String(item.defaultWeight || ""));
  return (
    <>
      <DialogHeader><DialogTitle>{item._new ? "Add Load Type" : "Edit Load Type"}</DialogTitle></DialogHeader>
      <div className="space-y-4 py-4">
        <FormField label="Name *"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engine Assembly" /></FormField>
        <FormField label="Category *">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="component">Component</SelectItem>
              <SelectItem value="container">Container</SelectItem>
              <SelectItem value="structure">Structure</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Default Weight (kg)"><Input type="number" value={defaultWeight} onChange={(e) => setDefaultWeight(e.target.value)} placeholder="e.g. 8500" /></FormField>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave({ name, category, defaultWeight: defaultWeight ? parseFloat(defaultWeight) : null })} disabled={saveLoading || !name} className="bg-cat-yellow text-cat-black hover:bg-cat-yellow/90">
          {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save
        </Button>
      </DialogFooter>
    </>
  );
}

function HazardForm({ item, onSave, onCancel, saveLoading }: { item: Record<string, unknown>; onSave: (d: Record<string, unknown>) => void; onCancel: () => void; saveLoading: boolean }) {
  const [name, setName] = useState(String(item.name || ""));
  const [category, setCategory] = useState(String(item.category || "environmental"));
  const [description, setDescription] = useState(String(item.description || ""));
  const [defaultMitigation, setDefaultMitigation] = useState(String(item.defaultMitigation || ""));
  const [riskWeight, setRiskWeight] = useState(String(item.riskWeight || "1.0"));
  return (
    <>
      <DialogHeader><DialogTitle>{item._new ? "Add Hazard Template" : "Edit Hazard Template"}</DialogTitle></DialogHeader>
      <div className="space-y-4 py-4">
        <FormField label="Name *"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Overhead Power Line" /></FormField>
        <FormField label="Category *">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="environmental">Environmental</SelectItem>
              <SelectItem value="ground">Ground</SelectItem>
              <SelectItem value="weather">Weather</SelectItem>
              <SelectItem value="personnel">Personnel</SelectItem>
              <SelectItem value="load">Load</SelectItem>
              <SelectItem value="operation">Operation</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Description"><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Hazard description" /></FormField>
        <FormField label="Default Mitigation"><Input value={defaultMitigation} onChange={(e) => setDefaultMitigation(e.target.value)} placeholder="e.g. De-energize power line" /></FormField>
        <FormField label="Risk Weight"><Input type="number" step="0.5" value={riskWeight} onChange={(e) => setRiskWeight(e.target.value)} placeholder="e.g. 3.0" /></FormField>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave({ name, category, description, defaultMitigation, riskWeight: parseFloat(riskWeight) || 1.0 })} disabled={saveLoading || !name} className="bg-cat-yellow text-cat-black hover:bg-cat-yellow/90">
          {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save
        </Button>
      </DialogFooter>
    </>
  );
}

function UserForm({ item, divisiList, onSave, onCancel, saveLoading }: { item: Record<string, unknown>; divisiList: Divisi[]; onSave: (d: Record<string, unknown>) => void; onCancel: () => void; saveLoading: boolean }) {
  const [name, setName] = useState(String(item.name || ""));
  const [role, setRole] = useState(String(item.role || "rigger"));
  const [divisiId, setDivisiId] = useState(String(item.divisiId || ""));
  const [email, setEmail] = useState(String(item.email || ""));
  return (
    <>
      <DialogHeader><DialogTitle>{item._new ? "Add User" : "Edit User"}</DialogTitle></DialogHeader>
      <div className="space-y-4 py-4">
        <FormField label="Name *"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Budi Santoso" /></FormField>
        <FormField label="Role *">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rigger">Rigger</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="safety_officer">Safety Officer</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Divisi">
          <Select value={divisiId} onValueChange={setDivisiId}>
            <SelectTrigger><SelectValue placeholder="Select divisi" /></SelectTrigger>
            <SelectContent>
              {divisiList.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. budi.s@trakindo.com" /></FormField>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave({ name, role, divisiId: divisiId ? parseInt(divisiId) : null, email })} disabled={saveLoading || !name} className="bg-cat-yellow text-cat-black hover:bg-cat-yellow/90">
          {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save
        </Button>
      </DialogFooter>
    </>
  );
}
