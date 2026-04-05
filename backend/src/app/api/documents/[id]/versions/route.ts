import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

type CreateVersionBody = {
  fields: Record<string, string>;
  editedByName: string;
  editedByRole: string;
};

export async function POST(req: Request, { params }: Props) {
  try {
    const role = req.headers.get("role");
    if (role !== "editor" && role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }

    const { id } = await params;
    const body: CreateVersionBody = await req.json();
    const { fields, editedByName, editedByRole } = body;

    if (!fields || !editedByName || !editedByRole) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Check document exists and is not finalized
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    // commented out to let the admin add a new version after been finalized

    // if (document.status === "FINALIZED") {
    //   return NextResponse.json(
    //     { error: "Document is finalized and cannot be edited" },
    //     { status: 403 },
    //   );
    // }

    // Server calculates the version number
    const existingVersions = await prisma.version.count({
      where: { documentId: id },
    });
    const newVersionNumber = existingVersions + 1;

    const version = await prisma.version.create({
      data: {
        documentId: id,
        versionNumber: newVersionNumber,
        fields,
        editedByName,
        editedByRole,
      },
    });

    await prisma.document.update({
      where: { id },
      data: {
        status: "EDITED",
      },
    });

    await prisma.timelineEntry.create({
      data: {
        documentId: id,
        action: "EDITED",
        userName: editedByName,
        userRole: editedByRole,
        versionNumber: newVersionNumber,
      },
    });

    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 },
    );
  }
}
