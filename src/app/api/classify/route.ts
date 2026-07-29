import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { utilization, windSpeed, overheadClearance, nearestObstacle, loadWeight, slope } = body;

    const reasons: string[] = [];
    let isCritical = false;

    if (utilization > 75) {
      isCritical = true;
      reasons.push("Utilization di atas 75% kapasitas crane");
    }
    if (windSpeed > 20) {
      isCritical = true;
      reasons.push("Wind speed di atas 20 km/h");
    }
    if (overheadClearance < 3) {
      isCritical = true;
      reasons.push("Overhead clearance kurang dari 3m");
    }
    if (nearestObstacle < 2) {
      isCritical = true;
      reasons.push("Obstacle terlalu dekat (kurang dari 2m)");
    }
    if (loadWeight > 20000) {
      isCritical = true;
      reasons.push("Beban di atas 20 ton");
    }
    if (slope > 5) {
      isCritical = true;
      reasons.push("Slope di atas 5 derajat");
    }

    return NextResponse.json({
      liftType: isCritical ? "critical" : "routine",
      isCritical,
      reasons,
    });
  } catch (error) {
    console.error("Classify API error:", error);
    return NextResponse.json(
      { error: "Failed to classify" },
      { status: 500 }
    );
  }
}
