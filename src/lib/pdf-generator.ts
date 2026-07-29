import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface LiftPlanPDFData {
  planNumber: string;
  title: string;
  description: string | null;
  liftType: string;
  status: string;
  scheduledDate: string | null;
  location: string | null;
  divisi: { name: string; code: string };
  loadType: { name: string; category: string } | null;
  loadDescription: string | null;
  loadWeight: number | null;
  loadLength: number | null;
  loadWidth: number | null;
  loadHeight: number | null;
  cogX: number | null;
  cogY: number | null;
  cogZ: number | null;
  totalLoad: number | null;
  crane: {
    model: string;
    craneClass: string;
    maxCapacity: number;
    loadChart: Array<{ radius: number; capacity: number }>;
  } | null;
  liftRadius: number | null;
  boomLength: number | null;
  boomAngle: number | null;
  craneCapacityAtRadius: number | null;
  utilizationPct: number | null;
  slingLegs: number | null;
  slingAngle: number | null;
  slingTension: number | null;
  slingWllRequired: number | null;
  slingSizeSelected: string | null;
  shackleSizeSelected: string | null;
  groundType: string | null;
  groundBearingCapacity: number | null;
  slope: number | null;
  windSpeed: number | null;
  overheadClearance: number | null;
  nearestObstacle: number | null;
  riskScore: number | null;
  riskLevel: string | null;
  hazardsIdentified: string[];
  mitigations: string[];
  createdBy: string | null;
  createdAt: string;
  approvals: Array<{
    approverRole: string;
    approverName: string;
    status: string;
    comment: string | null;
    approvedAt: string | null;
    orderSequence: number;
  }>;
}

const CAT_YELLOW: [number, number, number] = [255, 205, 17];
const CAT_BLACK: [number, number, number] = [26, 26, 26];
const GREY_DARK: [number, number, number] = [64, 64, 64];
const GREY_MED: [number, number, number] = [128, 128, 128];
const GREY_LIGHT: [number, number, number] = [240, 240, 240];
const RED: [number, number, number] = [220, 38, 38];
const GREEN: [number, number, number] = [34, 197, 94];
const ORANGE: [number, number, number] = [249, 115, 22];

const roleLabels: Record<string, string> = {
  rigger: "Rigger",
  supervisor: "Supervisor",
  safety_officer: "Safety Officer",
  manager: "Manager",
};

function fmtDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtNum(val: number | null, suffix = ""): string {
  if (val == null) return "-";
  return `${val.toLocaleString()}${suffix}`;
}

function fmtTon(val: number | null): string {
  if (val == null) return "-";
  return `${(val / 1000).toFixed(1)} t`;
}

function statusColor(status: string): [number, number, number] {
  if (status === "approved") return GREEN;
  if (status === "rejected") return RED;
  if (status === "submitted") return [59, 130, 246];
  return GREY_MED;
}

export function generateLiftPlanPDF(plan: LiftPlanPDFData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ============ HEADER ============
  doc.setFillColor(...CAT_BLACK);
  doc.rect(0, 0, pageW, 35, "F");
  doc.setFillColor(...CAT_YELLOW);
  doc.rect(0, 35, pageW, 2, "F");

  // CAT logo box
  doc.setFillColor(...CAT_YELLOW);
  doc.roundedRect(margin, 8, 18, 18, 2, 2, "F");
  doc.setTextColor(...CAT_BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CAT", margin + 9, 19, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("LIFT PLAN REPORT", margin + 24, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(plan.planNumber, margin + 24, 24);
  doc.text(`${plan.divisi.name} Division · Trakindo`, margin + 24, 29);

  // Status badge
  const sCol = statusColor(plan.status);
  doc.setFillColor(...sCol);
  doc.roundedRect(pageW - margin - 35, 12, 35, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(plan.status.toUpperCase(), pageW - margin - 17.5, 18.5, { align: "center" });

  if (plan.liftType === "critical") {
    doc.setFillColor(...RED);
    doc.roundedRect(pageW - margin - 35, 24, 35, 8, 2, 2, "F");
    doc.text("CRITICAL LIFT", pageW - margin - 17.5, 29.5, { align: "center" });
  }

  y = 45;

  // ============ TITLE SECTION ============
  doc.setTextColor(...CAT_BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(plan.title, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 2;

  if (plan.description) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GREY_DARK);
    const descLines = doc.splitTextToSize(plan.description, contentW);
    doc.text(descLines, margin, y);
    y += descLines.length * 5 + 3;
  }

  // Info bar
  doc.setFillColor(...GREY_LIGHT);
  doc.roundedRect(margin, y, contentW, 14, 1, 1, "F");
  doc.setFontSize(8);
  doc.setTextColor(...GREY_DARK);
  const infoItems = [
    `Date: ${fmtDate(plan.scheduledDate)}`,
    `Location: ${plan.location || "-"}`,
    `Crane: ${plan.crane?.model || "-"}`,
    `Total Load: ${fmtTon(plan.totalLoad)}`,
    `Risk: ${(plan.riskLevel || "-").toUpperCase()}`,
  ];
  const colW = contentW / infoItems.length;
  infoItems.forEach((info, i) => {
    doc.text(info, margin + i * colW + 2, y + 9);
  });
  y += 20;

  // ============ SECTION: LOAD ANALYSIS ============
  y = addSectionHeader(doc, "LOAD ANALYSIS", margin, y, contentW);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: GREY_LIGHT, textColor: GREY_DARK, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: CAT_BLACK },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    head: [["Parameter", "Value", "Parameter", "Value"]],
    body: [
      ["Load Type", plan.loadType?.name || "-", "Weight", fmtNum(plan.loadWeight, " kg")],
      ["Description", plan.loadDescription || "-", "Total Load", fmtNum(plan.totalLoad, " kg")],
      ["Length", fmtNum(plan.loadLength, " m"), "Width", fmtNum(plan.loadWidth, " m")],
      ["Height", fmtNum(plan.loadHeight, " m"), "CoG (X/Y/Z)", plan.cogX != null ? `${plan.cogX} / ${plan.cogY} / ${plan.cogZ} m` : "-"],
    ],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ============ SECTION: CRANE & UTILIZATION ============
  y = addSectionHeader(doc, "CRANE & UTILIZATION", margin, y, contentW);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: GREY_LIGHT, textColor: GREY_DARK, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: CAT_BLACK },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    head: [["Parameter", "Value", "Parameter", "Value"]],
    body: [
      ["Crane Model", plan.crane?.model || "-", "Crane Class", plan.crane?.craneClass || "-"],
      ["Lift Radius", fmtNum(plan.liftRadius, " m"), "Boom Length", fmtNum(plan.boomLength, " m")],
      ["Boom Angle", fmtNum(plan.boomAngle, "°"), "Capacity at Radius", fmtNum(plan.craneCapacityAtRadius, " kg")],
      ["Max Capacity", fmtNum(plan.crane?.maxCapacity || null, " kg"), "Utilization", plan.utilizationPct != null ? `${plan.utilizationPct.toFixed(0)}%` : "-"],
    ],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Utilization warning
  if (plan.utilizationPct != null && plan.utilizationPct > 75) {
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(margin, y, contentW, 8, 1, 1, "F");
    doc.setTextColor(...RED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`WARNING: Utilization ${plan.utilizationPct.toFixed(0)}% exceeds 75% critical threshold!`, margin + 3, y + 5.5);
    y += 12;
  }

  // ============ SECTION: RIGGING PLAN ============
  y = addSectionHeader(doc, "RIGGING PLAN", margin, y, contentW);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: GREY_LIGHT, textColor: GREY_DARK, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: CAT_BLACK },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    head: [["Parameter", "Value", "Parameter", "Value"]],
    body: [
      ["Sling Legs", plan.slingLegs ? String(plan.slingLegs) : "-", "Sling Angle", fmtNum(plan.slingAngle, "°")],
      ["Sling Tension", fmtNum(plan.slingTension, " kg"), "WLL Required (6:1)", fmtNum(plan.slingWllRequired, " kg")],
      ["Sling Selected", plan.slingSizeSelected || "-", "Shackle Selected", plan.shackleSizeSelected || "-"],
    ],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ============ SECTION: SITE ASSESSMENT ============
  y = addSectionHeader(doc, "SITE ASSESSMENT", margin, y, contentW);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: GREY_LIGHT, textColor: GREY_DARK, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: CAT_BLACK },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    head: [["Parameter", "Value", "Parameter", "Value"]],
    body: [
      ["Ground Type", plan.groundType || "-", "Bearing Capacity", fmtNum(plan.groundBearingCapacity, " kPa")],
      ["Slope", fmtNum(plan.slope, "°"), "Wind Speed", fmtNum(plan.windSpeed, " km/h")],
      ["Overhead Clearance", fmtNum(plan.overheadClearance, " m"), "Nearest Obstacle", fmtNum(plan.nearestObstacle, " m")],
    ],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Wind warning
  if (plan.windSpeed != null && plan.windSpeed > 20) {
    doc.setFillColor(254, 226, 224);
    doc.roundedRect(margin, y, contentW, 8, 1, 1, "F");
    doc.setTextColor(...RED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`WARNING: Wind speed ${plan.windSpeed} km/h exceeds safe threshold (20 km/h)!`, margin + 3, y + 5.5);
    y += 12;
  }

  // ============ SECTION: RISK ASSESSMENT ============
  if (y > pageH - 60) { doc.addPage(); y = margin; }

  y = addSectionHeader(doc, "RISK ASSESSMENT", margin, y, contentW);

  const riskCol: [number, number, number] = plan.riskLevel === "high" ? RED : plan.riskLevel === "medium" ? ORANGE : GREEN;
  doc.setFillColor(...riskCol);
  doc.roundedRect(margin, y, 25, 10, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`${plan.riskScore?.toFixed(0) || "0"}`, margin + 12.5, y + 7, { align: "center" });
  doc.setTextColor(...CAT_BLACK);
  doc.setFontSize(8);
  doc.text(`Risk Score — ${(plan.riskLevel || "low").toUpperCase()}`, margin + 28, y + 7);
  y += 16;

  if (plan.hazardsIdentified.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GREY_DARK);
    doc.text("Hazards Identified:", margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    plan.hazardsIdentified.forEach((h) => {
      doc.text(`  • ${h}`, margin + 2, y);
      y += 4.5;
    });
    y += 3;
  }

  if (plan.mitigations.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GREY_DARK);
    doc.text("Mitigations:", margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    plan.mitigations.forEach((m) => {
      const lines = doc.splitTextToSize(`  ✓ ${m}`, contentW - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 4.5;
    });
    y += 3;
  }

  // ============ SECTION: APPROVAL WORKFLOW ============
  if (y > pageH - 50) { doc.addPage(); y = margin; }

  y = addSectionHeader(doc, "APPROVAL WORKFLOW", margin, y, contentW);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: GREY_LIGHT, textColor: GREY_DARK, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: CAT_BLACK },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    head: [["Step", "Role", "Name", "Status", "Date"]],
    body: plan.approvals.map((a) => [
      String(a.orderSequence),
      roleLabels[a.approverRole] || a.approverRole,
      a.approverName,
      a.status.toUpperCase(),
      fmtDate(a.approvedAt),
    ]),
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 3) {
        const status = String(data.cell.raw);
        if (status === "APPROVED") data.cell.styles.textColor = GREEN;
        else if (status === "REJECTED") data.cell.styles.textColor = RED;
        else data.cell.styles.textColor = ORANGE;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ============ FOOTER (all pages) ============
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...CAT_BLACK);
    doc.rect(0, pageH - 15, pageW, 15, "F");
    doc.setFillColor(...CAT_YELLOW);
    doc.rect(0, pageH - 15, pageW, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`Trakindo · CAT® Lift Planning System — ${plan.planNumber}`, margin, pageH - 7);
    doc.text(`Generated: ${new Date().toLocaleDateString("id-ID")}  |  Page ${i} of ${pageCount}`, pageW - margin, pageH - 7, { align: "right" });
  }

  return doc;
}

function addSectionHeader(doc: jsPDF, title: string, x: number, y: number, w: number): number {
  doc.setFillColor(...CAT_YELLOW);
  doc.rect(x, y, 3, 6, "F");
  doc.setTextColor(...CAT_BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, x + 5, y + 5);
  doc.setDrawColor(...GREY_LIGHT);
  doc.setLineWidth(0.3);
  doc.line(x, y + 7, x + w, y + 7);
  return y + 10;
}
