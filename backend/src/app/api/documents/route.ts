import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

type CreateDocumentBody = {
  title: string;
  status: string;
  createdByName: string;
  createdAt: Date;
  templateFields: string[];
  templateBody: string;
};

export async function POST(req: Request) {
  try {
    const role = req.headers.get("role");
    if (role !== "creator" && role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }

    const body: CreateDocumentBody = await req.json();
    const { title, createdByName, templateFields, templateBody } = body;

    if (!title || !createdByName || !templateFields || !templateBody) {
      return new Response("Missing required fields", { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        title,
        createdByName,
        templateFields,
        templateBody,
      },
    });

    await prisma.timelineEntry.create({
      data: {
        documentId: document.id,
        action: "CREATED",
        userName: createdByName,
        userRole: role,
        versionNumber: null,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = documents.map((d) => {
      return {
        id: d.id,
        title: d.title,
        status: d.status,
        createdByName: d.createdByName,
        createdAt: d.createdAt.toISOString(),
      };
    });
    return NextResponse.json({ documents: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}
