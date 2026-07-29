import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const crane = await prisma.crane.findUnique({
      where: { id: parseInt(id) },
    });

    if (!crane) {
      return NextResponse.json(
        { error: "Crane not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...crane,
      loadChart: JSON.parse(crane.loadChart),
    });
  } catch (error) {
    console.error("Crane detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crane" },
      { status: 500 }
    );
  }
}
