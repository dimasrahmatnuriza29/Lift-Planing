import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const hazard = await prisma.hazardTemplate.create({
      data: {
        name: body.name,
        category: body.category || "environmental",
        description: body.description || null,
        defaultMitigation: body.defaultMitigation || null,
        riskWeight: body.riskWeight ? parseFloat(body.riskWeight) : 1.0,
      },
    });
    return NextResponse.json(hazard);
  } catch (error) {
    console.error("Create hazard error:", error);
    return NextResponse.json({ error: "Failed to create hazard" }, { status: 500 });
  }
}
