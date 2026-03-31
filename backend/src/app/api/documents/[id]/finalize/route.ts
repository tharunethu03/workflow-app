import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

type FinalizeDocumentBody = {
  finalizedByName: string;
  versionId: string;
};

export async function PATCH(req: Request, { params }: Props) {
  try {
    const role = req.headers.get("role");
    if (role !== "reviewer" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body: FinalizeDocumentBody = await req.json();
    const { finalizedByName, versionId } = body;

    if (!finalizedByName || !versionId) {
      return new Response("Missing required fields", { status: 400 });
    }

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    if (document.status === "FINALIZED") {
      return NextResponse.json({ error: "Document is already finalized" }, { status: 403 });
    }

    // Make sure the version belongs to this document
    const version = await prisma.version.findFirst({
      where: { id: versionId, documentId: id },
    });
    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    await prisma.document.update({
      where: { id },
      data: {
        status: "FINALIZED",
        finalizedVersionId: versionId,
      },
    });

    await prisma.timelineEntry.create({
      data: {
        documentId: id,
        action: "FINALIZED",
        userName: finalizedByName,
        userRole: role,
        versionNumber: version.versionNumber,
      },
    });

    return NextResponse.json({ message: "Document finalized successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to finalize document" }, { status: 500 });
  }
}