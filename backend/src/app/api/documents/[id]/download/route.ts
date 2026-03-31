import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    const role = req.headers.get("role");
    const downloaderName = req.headers.get("username") ?? "Unknown";

    if (role !== "downloader" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    if (document.status !== "FINALIZED") {
      return NextResponse.json(
        { error: "Document is not finalized yet" },
        { status: 403 },
      );
    }

    const finalizedVersion = await prisma.version.findUnique({
      where: { id: document.finalizedVersionId! },
    });

    await prisma.timelineEntry.create({
      data: {
        documentId: id,
        action: "DOWNLOADED",
        userName: downloaderName,
        userRole: role,
        versionNumber: finalizedVersion?.versionNumber,
      },
    });

    return NextResponse.json({
      id: document.id,
      title: document.title,
      templateFields: document.templateFields,
      finalizedVersion: {
        id: finalizedVersion?.id,
        versionNumber: finalizedVersion?.versionNumber,
        fields: finalizedVersion?.fields,
        editedByName: finalizedVersion?.editedByName,
        createdAt: finalizedVersion?.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to download document" },
      { status: 500 },
    );
  }
}
