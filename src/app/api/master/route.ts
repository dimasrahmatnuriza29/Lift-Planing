import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [divisi, loadTypes, hazards, cranes] = await Promise.all([
      prisma.divisi.findMany({ orderBy: { name: "asc" } }),
      prisma.loadType.findMany({ orderBy: { name: "asc" } }),
      prisma.hazardTemplate.findMany({ orderBy: { name: "asc" } }),
      prisma.crane.findMany({
        orderBy: { maxCapacity: "asc" },
        select: {
          id: true,
          model: true,
          craneClass: true,
          maxCapacity: true,
          maxBoomLength: true,
          maxRadius: true,
          outriggerLoad: true,
          loadChart: true,
        },
      }),
    ]);

    return NextResponse.json({
      divisi: divisi.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description,
      })),
      loadTypes: loadTypes.map((lt) => ({
        id: lt.id,
        name: lt.name,
        category: lt.category,
        defaultWeight: lt.defaultWeight,
      })),
      hazards: hazards.map((h) => ({
        id: h.id,
        name: h.name,
        category: h.category,
        description: h.description,
        defaultMitigation: h.defaultMitigation,
        riskWeight: h.riskWeight,
      })),
      cranes: cranes.map((c) => ({
        id: c.id,
        model: c.model,
        craneClass: c.craneClass,
        maxCapacity: c.maxCapacity,
        maxBoomLength: c.maxBoomLength,
        maxRadius: c.maxRadius,
        outriggerLoad: c.outriggerLoad,
        loadChart: JSON.parse(c.loadChart),
      })),
    });
  } catch (error) {
    console.error("Master data API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch master data" },
      { status: 500 }
    );
  }
}
