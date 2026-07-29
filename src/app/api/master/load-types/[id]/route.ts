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
    const loadType = await prisma.loadType.update({
      where: { id: parsedId },
      data: {
        name: body.name,
        category: body.category,
        defaultWeight: body.defaultWeight || null,
      },
    });
    return NextResponse.json(loadType);
  } catch (error) {
    console.error("Update load type error:", error);
    return NextResponse.json({ error: "Failed to update load type" }, { status: 500 });
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

    await prisma.loadType.delete({ where: { id: parsedId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete load type error:", error);
    return NextResponse.json({ error: "Failed to delete load type — may have associated lift plans" }, { status: 500 });
  }
}
