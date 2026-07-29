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
    const user = await prisma.user.update({
      where: { id: parsedId },
      data: {
        name: body.name,
        role: body.role,
        divisiId: body.divisiId || null,
        email: body.email || null,
      },
      include: { divisi: true },
    });
    return NextResponse.json({
      id: user.id,
      name: user.name,
      role: user.role,
      divisiId: user.divisiId,
      divisi: user.divisi,
      email: user.email,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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

    await prisma.user.delete({ where: { id: parsedId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
