import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const loadType = await prisma.loadType.create({
      data: {
        name: body.name,
        category: body.category || "component",
        defaultWeight: body.defaultWeight || null,
      },
    });
    return NextResponse.json(loadType);
  } catch (error) {
    console.error("Create load type error:", error);
    return NextResponse.json({ error: "Failed to create load type" }, { status: 500 });
  }
}
