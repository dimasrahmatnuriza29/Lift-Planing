import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const cranes = await prisma.crane.findMany({
      where: search
        ? {
            OR: [
              { model: { contains: search } },
              { craneClass: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { maxCapacity: "asc" },
    });

    return NextResponse.json(
      cranes.map((crane) => ({
        id: crane.id,
        model: crane.model,
        craneClass: crane.craneClass,
        maxCapacity: crane.maxCapacity,
        maxBoomLength: crane.maxBoomLength,
        maxRadius: crane.maxRadius,
        outriggerLoad: crane.outriggerLoad,
        loadChart: JSON.parse(crane.loadChart),
      }))
    );
  } catch (error) {
    console.error("Cranes API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cranes" },
      { status: 500 }
    );
  }
}
