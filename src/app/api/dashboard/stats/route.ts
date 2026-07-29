import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalPlans, approvedPlans, pendingPlans, criticalPlans, recentPlans, allPlans, divisiCounts, craneCounts] =
      await Promise.all([
        prisma.liftPlan.count(),
        prisma.liftPlan.count({ where: { status: "approved" } }),
        prisma.liftPlan.count({ where: { status: "submitted" } }),
        prisma.liftPlan.count({ where: { liftType: "critical" } }),
        prisma.liftPlan.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { divisi: true },
        }),
        prisma.liftPlan.findMany({
          select: { status: true, liftType: true, riskLevel: true, createdAt: true, utilizationPct: true, craneId: true },
        }),
        prisma.divisi.findMany({ include: { _count: { select: { liftPlans: true } } } }),
        prisma.crane.findMany({ select: { id: true, model: true, _count: { select: { liftPlans: true } } } }),
      ]);

    // Status distribution
    const statusDist = [
      { name: "Draft", value: allPlans.filter((p: typeof allPlans[number]) => p.status === "draft").length, color: "#a1a1aa" },
      { name: "Submitted", value: allPlans.filter((p: typeof allPlans[number]) => p.status === "submitted").length, color: "#3b82f6" },
      { name: "Approved", value: allPlans.filter((p: typeof allPlans[number]) => p.status === "approved").length, color: "#22c55e" },
      { name: "Rejected", value: allPlans.filter((p: typeof allPlans[number]) => p.status === "rejected").length, color: "#ef4444" },
      { name: "Completed", value: allPlans.filter((p: typeof allPlans[number]) => p.status === "completed").length, color: "#8b5cf6" },
    ].filter((s) => s.value > 0);

    // Risk distribution
    const riskDist = [
      { name: "Low", value: allPlans.filter((p: typeof allPlans[number]) => p.riskLevel === "low").length, color: "#22c55e" },
      { name: "Medium", value: allPlans.filter((p: typeof allPlans[number]) => p.riskLevel === "medium").length, color: "#f59e0b" },
      { name: "High", value: allPlans.filter((p: typeof allPlans[number]) => p.riskLevel === "high").length, color: "#ef4444" },
    ].filter((r) => r.value > 0);

    // Divisi breakdown
    const divisiBreakdown = divisiCounts.map((d: typeof divisiCounts[number]) => ({
      name: d.name,
      plans: d._count.liftPlans,
    }));

    // Monthly trends (last 6 months)
    const now = new Date();
    const monthlyTrends: Array<{ month: string; plans: number; critical: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthPlans = allPlans.filter((p: typeof allPlans[number]) => {
        const d = new Date(p.createdAt);
        return d >= monthStart && d <= monthEnd;
      });
      monthlyTrends.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        plans: monthPlans.length,
        critical: monthPlans.filter((p: typeof allPlans[number]) => p.liftType === "critical").length,
      });
    }

    // Crane usage
    const craneUsage = craneCounts
      .map((c: typeof craneCounts[number]) => ({ name: c.model, plans: c._count.liftPlans }))
      .filter((c: { name: string; plans: number }) => c.plans > 0);

    // Utilization stats
    const utilData = allPlans.filter((p: typeof allPlans[number]) => p.utilizationPct != null);
    const avgUtilization = utilData.length > 0 ? utilData.reduce((sum: number, p: typeof allPlans[number]) => sum + (p.utilizationPct || 0), 0) / utilData.length : 0;
    const highUtilCount = utilData.filter((p: typeof allPlans[number]) => (p.utilizationPct || 0) > 75).length;

    return NextResponse.json({
      totalPlans,
      approvedPlans,
      pendingPlans,
      criticalPlans,
      avgUtilization: Math.round(avgUtilization),
      highUtilCount,
      recentPlans: recentPlans.map((plan: typeof recentPlans[number]) => ({
        id: plan.id,
        planNumber: plan.planNumber,
        title: plan.title,
        status: plan.status,
        liftType: plan.liftType,
        divisi: plan.divisi.name,
        scheduledDate: plan.scheduledDate?.toISOString() ?? null,
      })),
      statusDist,
      riskDist,
      divisiBreakdown,
      monthlyTrends,
      craneUsage,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
