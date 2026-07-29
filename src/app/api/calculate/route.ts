import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case "rigging": {
        const { load, legs, angle } = data;
        if (!load || !legs || !angle) {
          return NextResponse.json(
            { error: "Missing required fields: load, legs, angle" },
            { status: 400 }
          );
        }
        const angleRad = (angle * Math.PI) / 180;
        const slingTension = load / (legs * Math.sin(angleRad));
        const safetyFactor = 6;
        const wllRequired = slingTension * safetyFactor;
        return NextResponse.json({
          slingTension: Math.round(slingTension * 100) / 100,
          wllRequired: Math.round(wllRequired * 100) / 100,
          safetyFactor,
        });
      }

      case "load": {
        const { weight } = data;
        const riggingEstimate = weight * 0.05;
        const totalLoad = weight + riggingEstimate;
        return NextResponse.json({
          riggingEstimate: Math.round(riggingEstimate * 100) / 100,
          totalLoad: Math.round(totalLoad * 100) / 100,
        });
      }

      case "ground-pressure": {
        const { totalLoad, padArea } = data;
        if (!totalLoad || !padArea) {
          return NextResponse.json(
            { error: "Missing required fields: totalLoad, padArea" },
            { status: 400 }
          );
        }
        const pressure = (totalLoad * 9.81) / padArea;
        return NextResponse.json({
          groundPressure: Math.round(pressure * 100) / 100,
        });
      }

      case "risk-score": {
        const { hazards, utilization, windSpeed, slope } = data;
        let score = 0;
        if (hazards && Array.isArray(hazards)) {
          for (const h of hazards) {
            score += h.riskWeight || 1;
          }
        }
        if (utilization > 75) score += 15;
        else if (utilization > 50) score += 8;
        if (windSpeed > 30) score += 20;
        else if (windSpeed > 20) score += 10;
        if (slope > 5) score += 10;
        score = Math.min(score, 100);
        let level = "low";
        if (score > 60) level = "high";
        else if (score > 30) level = "medium";
        return NextResponse.json({ riskScore: score, riskLevel: level });
      }

      default:
        return NextResponse.json(
          { error: "Invalid calculation type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Calculate API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate" },
      { status: 500 }
    );
  }
}
