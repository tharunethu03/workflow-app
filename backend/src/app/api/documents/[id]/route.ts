import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: Props) {
  try {
    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!document)
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );

    return NextResponse.json(document);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 },
    );
  }
}
