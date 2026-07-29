import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { divisi: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(
      users.map((u: typeof users[number]) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        divisiId: u.divisiId,
        divisi: u.divisi ? { id: u.divisi.id, name: u.divisi.name, code: u.divisi.code, description: u.divisi.description } : null,
        email: u.email,
      }))
    );
  } catch (error) {
    console.error("Users API error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await prisma.user.create({
      data: {
        name: body.name,
        role: body.role || "rigger",
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
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
