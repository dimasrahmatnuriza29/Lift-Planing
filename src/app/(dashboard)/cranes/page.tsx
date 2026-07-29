"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Construction, Eye, Weight, Ruler, Maximize, GitCompare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function CranesPage() {
  const [cranes, setCranes] = useState<Crane[]>([]);
  const [filtered, setFiltered] = useState<Crane[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/cranes")
      .then((res) => res.json())
      .then((data) => {
        setCranes(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(cranes);
    } else {
      const lower = search.toLowerCase();
      setFiltered(
        cranes.filter(
          (c) =>
            c.model.toLowerCase().includes(lower) ||
            c.craneClass.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, cranes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crane Database</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Database crane Caterpillar dengan load chart
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="cat" className="text-sm px-3 py-1.5">
            {cranes.length} Cranes Available
          </Badge>
          <Link href="/cranes/compare">
            <Button variant="outline" className="gap-2">
              <GitCompare className="h-4 w-4" />
              Compare
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by model or class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Crane Cards (Grid view for mobile/tablet) */}
      <div className="grid gap-4 md:hidden sm:grid-cols-2">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
            ))
          : filtered.map((crane, i) => (
              <motion.div
                key={crane.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/cranes/${crane.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cat-yellow/10">
                          <Construction className="h-5 w-5 text-cat-black" />
                        </div>
                        <Badge variant="cat">{crane.craneClass}</Badge>
                      </div>
                      <h3 className="font-bold text-lg">{crane.model}</h3>
                      <div className="mt-3 space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Capacity</span>
                          <span className="font-medium">
                            {(crane.maxCapacity / 1000).toFixed(0)} ton
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Boom Length</span>
                          <span className="font-medium">{crane.maxBoomLength}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Radius</span>
                          <span className="font-medium">{crane.maxRadius}m</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
      </div>

      {/* Crane Table (Desktop view) */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Crane Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Max Capacity</TableHead>
                  <TableHead className="text-right">Boom Length</TableHead>
                  <TableHead className="text-right">Max Radius</TableHead>
                  <TableHead className="text-right">Outrigger Load</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((crane, i) => (
                  <motion.tr
                    key={crane.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cat-yellow/10">
                          <Construction className="h-4 w-4 text-cat-black" />
                        </div>
                        {crane.model}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="cat">{crane.craneClass}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(crane.maxCapacity / 1000).toFixed(0)} ton
                    </TableCell>
                    <TableCell className="text-right">{crane.maxBoomLength}m</TableCell>
                    <TableCell className="text-right">{crane.maxRadius}m</TableCell>
                    <TableCell className="text-right">
                      {crane.outriggerLoad
                        ? `${(crane.outriggerLoad / 1000).toFixed(0)} ton`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Link href={`/cranes/${crane.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          Detail
                        </Button>
                      </Link>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cat-blue/10">
              <Weight className="h-6 w-6 text-cat-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Heaviest Capacity</p>
              <p className="text-xl font-bold">
                {cranes.length > 0
                  ? `${(Math.max(...cranes.map((c) => c.maxCapacity)) / 1000).toFixed(0)} ton`
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-success/10">
              <Ruler className="h-6 w-6 text-status-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longest Boom</p>
              <p className="text-xl font-bold">
                {cranes.length > 0
                  ? `${Math.max(...cranes.map((c) => c.maxBoomLength))}m`
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-info/10">
              <Maximize className="h-6 w-6 text-status-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Reach Radius</p>
              <p className="text-xl font-bold">
                {cranes.length > 0
                  ? `${Math.max(...cranes.map((c) => c.maxRadius))}m`
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
