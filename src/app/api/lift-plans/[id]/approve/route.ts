import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    const { action, comment, approverRole } = body as {
      action: "approve" | "reject";
      comment?: string;
      approverRole?: string;
    };

    if (!action || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ error: "Action must be 'approve' or 'reject'" }, { status: 400 });
    }

    const plan = await prisma.liftPlan.findUnique({
      where: { id: parsedId },
      include: {
        approvals: { orderBy: { orderSequence: "asc" } },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Lift plan not found" }, { status: 404 });
    }

    if (plan.status !== "submitted") {
      return NextResponse.json({ error: `Lift plan status is '${plan.status}', not 'submitted'` }, { status: 400 });
    }

    // Find the current pending approval step
    const currentStep = plan.approvals.find((a: { status: string }) => a.status === "pending");
    if (!currentStep) {
      return NextResponse.json({ error: "No pending approval step found" }, { status: 400 });
    }

    // If approverRole is provided, verify it matches
    if (approverRole && currentStep.approverRole !== approverRole) {
      return NextResponse.json({
        error: `This step requires '${currentStep.approverRole}', but you are '${approverRole}'`,
      }, { status: 403 });
    }

    // Update the current approval step
    await prisma.liftApproval.update({
      where: { id: currentStep.id },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        comment: comment || null,
        approvedAt: new Date(),
      },
    });

    if (action === "reject") {
      // Reject the entire lift plan
      await prisma.liftPlan.update({
        where: { id: parsedId },
        data: { status: "rejected" },
      });
      return NextResponse.json({
        id: parsedId,
        status: "rejected",
        message: "Lift plan rejected",
      });
    }

    // Approve: check if there are more pending steps
    const remainingApprovals = plan.approvals.filter(
      (a: { orderSequence: number; status: string }) => a.orderSequence > currentStep.orderSequence && a.status === "pending"
    );

    if (remainingApprovals.length === 0) {
      // All approvals complete
      await prisma.liftPlan.update({
        where: { id: parsedId },
        data: { status: "approved" },
      });
      return NextResponse.json({
        id: parsedId,
        status: "approved",
        message: "Lift plan fully approved — all approval steps completed",
      });
    }

    // More steps remain
    const nextStep = remainingApprovals[0];
    return NextResponse.json({
      id: parsedId,
      status: "submitted",
      message: `Approved by ${currentStep.approverRole}. Next: ${nextStep.approverRole} (${nextStep.approverName})`,
      nextApprover: nextStep.approverRole,
    });
  } catch (error) {
    console.error("Approve API error:", error);
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 });
  }
}
