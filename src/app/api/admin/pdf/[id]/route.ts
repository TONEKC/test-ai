import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: {
    id: string;
  };
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createNameTagPdf(registration: {
  attendeeName: string;
  organization: string | null;
  eventName: string;
  referenceCode: string;
}) {
  const title = escapePdfText(registration.attendeeName);
  const subtitle = escapePdfText(registration.organization || registration.eventName);
  const referenceCode = escapePdfText(registration.referenceCode);
  const content = [
    "q",
    "0.063 0.094 0.157 rg",
    "0 0 360 240 re f",
    "1 1 1 rg",
    "18 18 324 204 re f",
    "0.145 0.388 0.922 rg",
    "BT /F1 11 Tf 42 186 Td (EVENT REGISTRATION) Tj ET",
    "0.063 0.094 0.157 rg",
    `BT /F1 26 Tf 42 142 Td (${title}) Tj ET`,
    "0.278 0.329 0.404 rg",
    `BT /F1 12 Tf 42 114 Td (${subtitle}) Tj ET`,
    "0.886 0.91 0.941 RG",
    "42 90 m 318 90 l S",
    "0.392 0.455 0.545 rg",
    "BT /F1 10 Tf 42 64 Td (REFERENCE CODE) Tj ET",
    "0.063 0.094 0.157 rg",
    `BT /F1 18 Tf 42 39 Td (${referenceCode}) Tj ET`,
    "Q",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 360 240] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "binary");
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

  const bytes = createNameTagPdf(registration);

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="name-tag-${registration.referenceCode}.pdf"`,
    },
  });
}
