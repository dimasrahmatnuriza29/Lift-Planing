import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const liftType = searchParams.get("liftType");
    const divisiId = searchParams.get("divisiId");
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (liftType) where.liftType = liftType;
    if (divisiId) where.divisiId = parseInt(divisiId);
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { planNumber: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const liftPlans = await prisma.liftPlan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        divisi: true,
        crane: true,
        loadType: true,
        approvals: {
          orderBy: { orderSequence: "asc" },
        },
      },
    });

    return NextResponse.json(
      liftPlans.map((plan) => ({
        id: plan.id,
        planNumber: plan.planNumber,
        title: plan.title,
        description: plan.description,
        liftType: plan.liftType,
        status: plan.status,
        divisi: plan.divisi.name,
        divisiCode: plan.divisi.code,
        crane: plan.crane?.model || null,
        loadWeight: plan.loadWeight,
        totalLoad: plan.totalLoad,
        utilizationPct: plan.utilizationPct,
        riskLevel: plan.riskLevel,
        scheduledDate: plan.scheduledDate?.toISOString() ?? null,
        location: plan.location,
        createdAt: plan.createdAt.toISOString(),
        approvals: plan.approvals.map((a) => ({
          id: a.id,
          approverRole: a.approverRole,
          approverName: a.approverName,
          status: a.status,
          approvedAt: a.approvedAt?.toISOString() ?? null,
          orderSequence: a.orderSequence,
        })),
      }))
    );
  } catch (error) {
    console.error("Lift plans API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lift plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await prisma.liftPlan.count();
    const planNumber = `LP-2026-${String(count + 1).padStart(3, "0")}`;

    const plan = await prisma.liftPlan.create({
      data: {
        planNumber,
        divisiId: body.divisiId,
        title: body.title,
        description: body.description || null,
        liftType: body.liftType || "routine",
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        location: body.location || null,
        status: body.status || "draft",

        loadTypeId: body.loadTypeId || null,
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
        windSpeed: body.windSpeed || null,
        overheadClearance: body.overheadClearance || null,
        nearestObstacle: body.nearestObstacle || null,

        riskScore: body.riskScore || null,
        riskLevel: body.riskLevel || null,
        hazardsIdentified: body.hazardsIdentified ? JSON.stringify(body.hazardsIdentified) : null,
        mitigations: body.mitigations ? JSON.stringify(body.mitigations) : null,

        createdBy: body.createdBy || "System",
      },
    });

    if (body.status === "submitted") {
      const isCritical = body.liftType === "critical";
      const approvalSteps = isCritical
        ? [
            { role: "rigger", name: body.createdBy || "System", seq: 1 },
            { role: "supervisor", name: "Ahmad Wijaya", seq: 2 },
            { role: "safety_officer", name: "Citra Lestari", seq: 3 },
            { role: "manager", name: "Dedi Kurniawan", seq: 4 },
          ]
        : [
            { role: "rigger", name: body.createdBy || "System", seq: 1 },
            { role: "supervisor", name: "Ahmad Wijaya", seq: 2 },
          ];

      for (const step of approvalSteps) {
        await prisma.liftApproval.create({
          data: {
            liftPlanId: plan.id,
            approverRole: step.role,
            approverName: step.name,
            status: step.seq === 1 ? "approved" : "pending",
            approvedAt: step.seq === 1 ? new Date() : null,
            orderSequence: step.seq,
          },
        });
      }
    }

    return NextResponse.json({
      id: plan.id,
      planNumber: plan.planNumber,
      status: plan.status,
    });
  } catch (error) {
    console.error("Create lift plan API error:", error);
    return NextResponse.json(
      { error: "Failed to create lift plan" },
      { status: 500 }
    );
  }
}
