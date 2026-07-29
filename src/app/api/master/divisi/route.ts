import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const divisi = await prisma.divisi.create({
      data: {
        name: body.name,
        code: body.code,
        description: body.description || null,
      },
    });
    return NextResponse.json(divisi);
  } catch (error) {
    console.error("Create divisi error:", error);
    return NextResponse.json({ error: "Failed to create divisi" }, { status: 500 });
  }
}
