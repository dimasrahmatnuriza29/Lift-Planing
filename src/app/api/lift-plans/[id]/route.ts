import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { error: "Invalid lift plan ID" },
        { status: 400 }
      );
    }
    const plan = await prisma.liftPlan.findUnique({
      where: { id: parsedId },
      include: {
        divisi: true,
        crane: true,
        loadType: true,
        approvals: {
          orderBy: { orderSequence: "asc" },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Lift plan not found" },
        { status: 404 }
      );
    }

    let parsedCrane = null;
    if (plan.crane) {
      parsedCrane = {
        ...plan.crane,
        loadChart: JSON.parse(plan.crane.loadChart),
      };
    }

    return NextResponse.json({
      ...plan,
      crane: parsedCrane,
      hazardsIdentified: plan.hazardsIdentified ? JSON.parse(plan.hazardsIdentified) : [],
      mitigations: plan.mitigations ? JSON.parse(plan.mitigations) : [],
      scheduledDate: plan.scheduledDate?.toISOString() ?? null,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Lift plan detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lift plan" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid lift plan ID" }, { status: 400 });
    }

    const body = await request.json();

    const updated = await prisma.liftPlan.update({
      where: { id: parsedId },
      data: {
        title: body.title,
        description: body.description || null,
        liftType: body.liftType,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        location: body.location || null,
        loadDescription: body.loadDescription || null,
        loadWeight: body.loadWeight || null,
        loadLength: body.loadLength || null,
        loadWidth: body.loadWidth || null,
        loadHeight: body.loadHeight || null,
        cogX: body.cogX || null,
        cogY: body.cogY || null,
        cogZ: body.cogZ || null,
        totalLoad: body.totalLoad || null,
        craneId: body.craneId || null,
        liftRadius: body.liftRadius || null,
        boomLength: body.boomLength || null,
        boomAngle: body.boomAngle || null,
        craneCapacityAtRadius: body.craneCapacityAtRadius || null,
        utilizationPct: body.utilizationPct || null,
        slingLegs: body.slingLegs || null,
        slingAngle: body.slingAngle || null,
        slingTension: body.slingTension || null,
        slingWllRequired: body.slingWllRequired || null,
        slingSizeSelected: body.slingSizeSelected || null,
        shackleSizeSelected: body.shackleSizeSelected || null,
        groundType: body.groundType || null,
        groundBearingCapacity: body.groundBearingCapacity || null,
        slope: body.slope ?? null,
        windSpeed: body.windSpeed ?? null,
        overheadClearance: body.overheadClearance || null,
        nearestObstacle: body.nearestObstacle || null,
        riskScore: body.riskScore || null,
        riskLevel: body.riskLevel || null,
        hazardsIdentified: body.hazardsIdentified ? JSON.stringify(body.hazardsIdentified) : null,
        mitigations: body.mitigations ? JSON.stringify(body.mitigations) : null,
        status: body.status || undefined,
      },
    });

    return NextResponse.json({ id: updated.id, success: true });
  } catch (error) {
    console.error("Update lift plan error:", error);
    return NextResponse.json({ error: "Failed to update lift plan" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid lift plan ID" }, { status: 400 });
    }

    // Delete associated approvals first
    await prisma.liftApproval.deleteMany({
      where: { liftPlanId: parsedId },
    });

    await prisma.liftPlan.delete({
      where: { id: parsedId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete lift plan error:", error);
    return NextResponse.json(
      { error: "Failed to delete lift plan" },
      { status: 500 }
    );
  }
}
