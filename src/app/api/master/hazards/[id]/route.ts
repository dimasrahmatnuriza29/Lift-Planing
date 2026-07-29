import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const hazard = await prisma.hazardTemplate.update({
      where: { id: parsedId },
      data: {
        name: body.name,
        category: body.category,
        description: body.description || null,
        defaultMitigation: body.defaultMitigation || null,
        riskWeight: parseFloat(body.riskWeight) || 1.0,
      },
    });
    return NextResponse.json(hazard);
  } catch (error) {
    console.error("Update hazard error:", error);
    return NextResponse.json({ error: "Failed to update hazard" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await prisma.hazardTemplate.delete({ where: { id: parsedId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete hazard error:", error);
    return NextResponse.json({ error: "Failed to delete hazard" }, { status: 500 });
  }
}
