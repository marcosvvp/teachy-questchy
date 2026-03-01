import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const question = await prisma.question.findUnique({
      where: { code }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const formatted = {
      ...question,
      image: question.image ? question.image.toString("utf-8") : null
    };

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
  }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const { title, type, options, correctAnswers, image } = await req.json();

        let imageBuffer = undefined;
        if (image !== undefined) {
            imageBuffer = image ? Buffer.from(image, "utf-8") : null;
        }

        const question = await prisma.question.update({
            where: { id: code },
            data: {
                title,
                type,
                options: options || [],
                correctAnswers: correctAnswers || [],
                ...(imageBuffer !== undefined && { image: imageBuffer })
            }
        });

        const formatted = {
            ...question,
            image: question.image ? question.image.toString("utf-8") : null
        };

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Failed to update question", error);
        return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
    }
}
