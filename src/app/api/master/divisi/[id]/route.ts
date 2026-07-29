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
    const divisi = await prisma.divisi.update({
      where: { id: parsedId },
      data: {
        name: body.name,
        code: body.code,
        description: body.description || null,
      },
    });
    return NextResponse.json(divisi);
  } catch (error) {
    console.error("Update divisi error:", error);
    return NextResponse.json({ error: "Failed to update divisi" }, { status: 500 });
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

    await prisma.divisi.delete({ where: { id: parsedId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete divisi error:", error);
    return NextResponse.json({ error: "Failed to delete divisi — may have associated lift plans" }, { status: 500 });
  }
}
