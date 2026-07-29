import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Idempotency: skip if data already exists
  const existingDivisi = await prisma.divisi.count();
  if (existingDivisi > 0) {
    console.log("Seed skipped — data already exists.");
    console.log(`Divisi: ${existingDivisi}`);
    return;
  }

  // Divisi
  const rental = await prisma.divisi.create({
    data: { name: "Rental", code: "RNT", description: "Sewa Alat Berat" },
  });
  const sales = await prisma.divisi.create({
    data: { name: "Sales", code: "SLS", description: "Jual Beli Alat Berat" },
  });
  const parts = await prisma.divisi.create({
    data: { name: "Parts", code: "PRT", description: "Jual Beli Spare Parts" },
  });
  const service = await prisma.divisi.create({
    data: { name: "Service", code: "SVC", description: "Jasa Maintenance & Repair" },
  });

  // Load Types
  const loadTypes = [
    { name: "Engine Assembly", category: "component", defaultWeight: 8500 },
    { name: "Transmission", category: "component", defaultWeight: 4500 },
    { name: "Counterweight", category: "component", defaultWeight: 12000 },
    { name: "Boom Assembly", category: "component", defaultWeight: 3200 },
    { name: "Track Assembly", category: "component", defaultWeight: 5800 },
    { name: "Hydraulic Cylinder", category: "component", defaultWeight: 1200 },
    { name: "Container - Parts", category: "container", defaultWeight: 5000 },
    { name: "Structure - Steel Beam", category: "structure", defaultWeight: 3000 },
  ];

  for (const lt of loadTypes) {
    await prisma.loadType.create({ data: lt });
  }

  // Cranes - with realistic load chart data
  const cranes = [
    {
      model: "Cat 320",
      craneClass: "50 ton",
      maxCapacity: 50000,
      maxBoomLength: 19.5,
      maxRadius: 18,
      outriggerLoad: 18000,
      loadChart: JSON.stringify([
        { radius: 3, capacity: 50000 },
        { radius: 5, capacity: 35000 },
        { radius: 7, capacity: 22000 },
        { radius: 9, capacity: 14000 },
        { radius: 11, capacity: 9000 },
        { radius: 13, capacity: 6000 },
        { radius: 15, capacity: 4000 },
        { radius: 18, capacity: 2500 },
      ]),
    },
    {
      model: "Cat 336",
      craneClass: "100 ton",
      maxCapacity: 100000,
      maxBoomLength: 28.5,
      maxRadius: 26,
      outriggerLoad: 35000,
      loadChart: JSON.stringify([
        { radius: 3, capacity: 100000 },
        { radius: 5, capacity: 75000 },
        { radius: 7, capacity: 52000 },
        { radius: 9, capacity: 38000 },
        { radius: 11, capacity: 28000 },
        { radius: 13, capacity: 21000 },
        { radius: 15, capacity: 16000 },
        { radius: 18, capacity: 11000 },
        { radius: 21, capacity: 7500 },
        { radius: 24, capacity: 5000 },
        { radius: 26, capacity: 3500 },
      ]),
    },
    {
      model: "Cat 340",
      craneClass: "150 ton",
      maxCapacity: 150000,
      maxBoomLength: 35,
      maxRadius: 32,
      outriggerLoad: 52000,
      loadChart: JSON.stringify([
        { radius: 3, capacity: 150000 },
        { radius: 5, capacity: 115000 },
        { radius: 7, capacity: 85000 },
        { radius: 9, capacity: 62000 },
        { radius: 11, capacity: 47000 },
        { radius: 13, capacity: 36000 },
        { radius: 15, capacity: 28000 },
        { radius: 18, capacity: 20000 },
        { radius: 21, capacity: 14000 },
        { radius: 24, capacity: 10000 },
        { radius: 28, capacity: 6500 },
        { radius: 32, capacity: 4000 },
      ]),
    },
    {
      model: "Cat 345",
      craneClass: "250 ton",
      maxCapacity: 250000,
      maxBoomLength: 42,
      maxRadius: 40,
      outriggerLoad: 85000,
      loadChart: JSON.stringify([
        { radius: 4, capacity: 250000 },
        { radius: 6, capacity: 195000 },
        { radius: 8, capacity: 150000 },
        { radius: 10, capacity: 115000 },
        { radius: 12, capacity: 90000 },
        { radius: 15, capacity: 65000 },
        { radius: 18, capacity: 48000 },
        { radius: 21, capacity: 36000 },
        { radius: 25, capacity: 25000 },
        { radius: 30, capacity: 16000 },
        { radius: 35, capacity: 10000 },
        { radius: 40, capacity: 6000 },
      ]),
    },
    {
      model: "Cat 365",
      craneClass: "400 ton",
      maxCapacity: 400000,
      maxBoomLength: 56,
      maxRadius: 52,
      outriggerLoad: 140000,
      loadChart: JSON.stringify([
        { radius: 5, capacity: 400000 },
        { radius: 8, capacity: 310000 },
        { radius: 10, capacity: 250000 },
        { radius: 13, capacity: 190000 },
        { radius: 16, capacity: 145000 },
        { radius: 20, capacity: 105000 },
        { radius: 25, capacity: 75000 },
        { radius: 30, capacity: 52000 },
        { radius: 35, capacity: 38000 },
        { radius: 40, capacity: 27000 },
        { radius: 45, capacity: 19000 },
        { radius: 52, capacity: 12000 },
      ]),
    },
    {
      model: "Cat 385",
      craneClass: "550 ton",
      maxCapacity: 550000,
      maxBoomLength: 70,
      maxRadius: 66,
      outriggerLoad: 200000,
      loadChart: JSON.stringify([
        { radius: 5, capacity: 550000 },
        { radius: 8, capacity: 430000 },
        { radius: 10, capacity: 350000 },
        { radius: 13, capacity: 270000 },
        { radius: 16, capacity: 210000 },
        { radius: 20, capacity: 155000 },
        { radius: 25, capacity: 110000 },
        { radius: 30, capacity: 80000 },
        { radius: 35, capacity: 58000 },
        { radius: 40, capacity: 42000 },
        { radius: 50, capacity: 25000 },
        { radius: 60, capacity: 15000 },
        { radius: 66, capacity: 10000 },
      ]),
    },
  ];

  for (const crane of cranes) {
    await prisma.crane.create({ data: crane });
  }

  // Hazard Templates
  const hazards = [
    { name: "Overhead Power Line", category: "environmental", description: "Power line dalam radius lift", defaultMitigation: "De-energize atau maintain minimum 3m clearance; gunakan spotter", riskWeight: 3.0 },
    { name: "Soft Ground", category: "ground", description: "Ground bearing capacity rendah", defaultMitigation: "Gunakan outrigger pads atau steel mats", riskWeight: 2.5 },
    { name: "High Wind Speed", category: "weather", description: "Wind speed > 20 km/h", defaultMitigation: "Monitor wind continuously; stop lift jika > 30 km/h", riskWeight: 2.0 },
    { name: "Slope > 5 degrees", category: "ground", description: "Area lift miring", defaultMitigation: "Level crane dengan pads atau pindah ke area flat", riskWeight: 2.0 },
    { name: "Personnel in Lift Zone", category: "personnel", description: "Orang dalam radius lift", defaultMitigation: "Establish exclusion zone, radius = 1.5x load height", riskWeight: 1.5 },
    { name: "Overhead Obstacle", category: "environmental", description: "Obstacle di atas area lift", defaultMitigation: "Reroute lift path atau remove obstacle", riskWeight: 2.0 },
    { name: "Limited Clearance", category: "environmental", description: "Clearance < 2m", defaultMitigation: "Use tag lines; slow lift; spotter di setiap sudut", riskWeight: 1.5 },
    { name: "Hazardous Material", category: "load", description: "Beban berbahaya", defaultMitigation: "Special PPE; emergency response plan; hazmat team standby", riskWeight: 3.5 },
    { name: "Multi-Crane Lift", category: "operation", description: "Lebih dari 1 crane", defaultMitigation: "Dedicated lift director; synchronized communication", riskWeight: 3.0 },
    { name: "Night Operation", category: "environmental", description: "Lift pada malam hari", defaultMitigation: "Adequate lighting; high-visibility PPE; extra spotter", riskWeight: 2.0 },
  ];

  for (const hazard of hazards) {
    await prisma.hazardTemplate.create({ data: hazard });
  }

  // Mock Users
  const users = [
    { name: "Budi Santoso", role: "rigger", divisiId: service.id, email: "budi.s@trakindo.com" },
    { name: "Ahmad Wijaya", role: "supervisor", divisiId: service.id, email: "ahmad.w@trakindo.com" },
    { name: "Citra Lestari", role: "safety_officer", divisiId: service.id, email: "citra.l@trakindo.com" },
    { name: "Dedi Kurniawan", role: "manager", divisiId: service.id, email: "dedi.k@trakindo.com" },
    { name: "Eka Putra", role: "rigger", divisiId: rental.id, email: "eka.p@trakindo.com" },
    { name: "Fajar Nugroho", role: "supervisor", divisiId: rental.id, email: "fajar.n@trakindo.com" },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  // Sample Lift Plans
  const samplePlans = [
    {
      planNumber: "LP-2026-001",
      divisiId: service.id,
      title: "Engine Overhaul Cat 3512 - Lift Engine",
      description: "Pengangkatan engine Cat 3512 dari trailer ke workshop untuk overhaul",
      liftType: "critical",
      scheduledDate: new Date("2026-08-05"),
      location: "Workshop Trakindo Balikpapan",
      status: "approved",
      loadDescription: "Engine Cat 3512B",
      loadWeight: 8500,
      loadLength: 3.2,
      loadWidth: 1.8,
      loadHeight: 2.1,
      cogX: 1.6,
      cogY: 0.9,
      cogZ: 1.05,
      totalLoad: 9000,
      liftRadius: 10,
      boomLength: 25,
      boomAngle: 65,
      craneCapacityAtRadius: 15000,
      utilizationPct: 60,
      slingLegs: 4,
      slingAngle: 60,
      slingTension: 2598,
      slingWllRequired: 15588,
      slingSizeSelected: "16 ton WLL",
      shackleSizeSelected: "15 ton",
      groundType: "Concrete",
      groundBearingCapacity: 200,
      slope: 2,
      windSpeed: 12,
      overheadClearance: 8,
      nearestObstacle: 5,
      riskScore: 42,
      riskLevel: "medium",
      hazardsIdentified: JSON.stringify(["Overhead Obstacle", "Personnel in Lift Zone"]),
      mitigations: JSON.stringify(["Establish exclusion zone", "Assign signalman"]),
      createdBy: "Budi Santoso",
    },
    {
      planNumber: "LP-2026-002",
      divisiId: rental.id,
      title: "Loading Excavator Cat 320 ke Trailer",
      description: "Loading unit excavator Cat 320 ke lowboy trailer untuk delivery ke site",
      liftType: "routine",
      scheduledDate: new Date("2026-08-10"),
      location: "Yard Trakindo Samarinda",
      status: "submitted",
      loadDescription: "Excavator Cat 320",
      loadWeight: 35000,
      loadLength: 9.5,
      loadWidth: 3.2,
      loadHeight: 3.0,
      totalLoad: 36500,
      liftRadius: 8,
      boomLength: 28,
      craneCapacityAtRadius: 52000,
      utilizationPct: 70,
      slingLegs: 4,
      slingAngle: 45,
      slingTension: 12940,
      slingWllRequired: 77640,
      slingSizeSelected: "80 ton WLL",
      shackleSizeSelected: "55 ton",
      groundType: "Gravel",
      groundBearingCapacity: 150,
      slope: 1,
      windSpeed: 8,
      overheadClearance: 15,
      nearestObstacle: 10,
      riskScore: 25,
      riskLevel: "low",
      hazardsIdentified: JSON.stringify([]),
      mitigations: JSON.stringify(["Standard exclusion zone"]),
      createdBy: "Eka Putra",
    },
    {
      planNumber: "LP-2026-003",
      divisiId: parts.id,
      title: "Unloading Counterweight dari Truck",
      description: "Unloading counterweight excavator Cat 336 dari delivery truck",
      liftType: "routine",
      scheduledDate: new Date("2026-08-12"),
      location: "Warehouse Trakindo Jakarta",
      status: "draft",
      loadDescription: "Counterweight Cat 336",
      loadWeight: 12000,
      loadLength: 2.5,
      loadWidth: 1.8,
      loadHeight: 1.5,
      totalLoad: 12500,
      liftRadius: 7,
      boomLength: 20,
      craneCapacityAtRadius: 52000,
      utilizationPct: 24,
      slingLegs: 2,
      slingAngle: 60,
      slingTension: 7217,
      slingWllRequired: 43302,
      slingSizeSelected: "50 ton WLL",
      shackleSizeSelected: "35 ton",
      groundType: "Concrete",
      groundBearingCapacity: 250,
      slope: 0,
      windSpeed: 5,
      overheadClearance: 12,
      nearestObstacle: 8,
      riskScore: 15,
      riskLevel: "low",
      hazardsIdentified: JSON.stringify([]),
      mitigations: JSON.stringify(["Standard procedure"]),
      createdBy: "Budi Santoso",
    },
  ];

  for (const plan of samplePlans) {
    const created = await prisma.liftPlan.create({ data: plan });
    
    // Add approvals for approved plan
    if (plan.status === "approved") {
      await prisma.liftApproval.create({
        data: {
          liftPlanId: created.id,
          approverRole: "rigger",
          approverName: "Budi Santoso",
          status: "approved",
          approvedAt: new Date(),
          orderSequence: 1,
        },
      });
      await prisma.liftApproval.create({
        data: {
          liftPlanId: created.id,
          approverRole: "supervisor",
          approverName: "Ahmad Wijaya",
          status: "approved",
          approvedAt: new Date(),
          orderSequence: 2,
        },
      });
      await prisma.liftApproval.create({
        data: {
          liftPlanId: created.id,
          approverRole: "safety_officer",
          approverName: "Citra Lestari",
          status: "approved",
          approvedAt: new Date(),
          orderSequence: 3,
        },
      });
      await prisma.liftApproval.create({
        data: {
          liftPlanId: created.id,
          approverRole: "manager",
          approverName: "Dedi Kurniawan",
          status: "approved",
          approvedAt: new Date(),
          orderSequence: 4,
        },
      });
    } else if (plan.status === "submitted") {
      await prisma.liftApproval.create({
        data: {
          liftPlanId: created.id,
          approverRole: "rigger",
          approverName: "Eka Putra",
          status: "approved",
          approvedAt: new Date(),
          orderSequence: 1,
        },
      });
      await prisma.liftApproval.create({
        data: {
          liftPlanId: created.id,
          approverRole: "supervisor",
          approverName: "Fajar Nugroho",
          status: "pending",
          orderSequence: 2,
        },
      });
    }
  }

  console.log("Seed data completed successfully!");
  console.log("Divisi: 4");
  console.log("Load Types: 12");
  console.log("Cranes: 6");
  console.log("Hazard Templates: 10");
  console.log("Users: 6");
  console.log("Lift Plans: 3 (with approvals)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
