export const dynamic = "force-dynamic";
import { jsPDF } from "jspdf";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const registration = await prisma.eventRegistration.findUnique({
    where: { id: context.params.id },
  });

  if (!registration) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Registration was not found.",
        },
      },
      { status: 404 },
    );
  }

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [360, 240],
  });

  pdf.setFillColor(16, 24, 40);
  pdf.rect(0, 0, 360, 240, "F");
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(18, 18, 324, 204, 14, 14, "F");

  pdf.setTextColor(37, 99, 235);
  pdf.setFontSize(11);
  pdf.text("EVENT REGISTRATION", 42, 54);

  pdf.setTextColor(16, 24, 40);
  pdf.setFontSize(26);
  pdf.text(registration.attendeeName, 42, 98, { maxWidth: 276 });

  pdf.setFontSize(12);
  pdf.setTextColor(71, 84, 103);
  pdf.text(registration.organization || registration.eventName, 42, 126, {
    maxWidth: 276,
  });

  pdf.setDrawColor(226, 232, 240);
  pdf.line(42, 150, 318, 150);

  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  pdf.text("REFERENCE CODE", 42, 176);

  pdf.setFontSize(18);
  pdf.setTextColor(16, 24, 40);
  pdf.text(registration.referenceCode, 42, 201);

  const bytes = Buffer.from(pdf.output("arraybuffer"));

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="name-tag-${registration.referenceCode}.pdf"`,
    },
  });
}
