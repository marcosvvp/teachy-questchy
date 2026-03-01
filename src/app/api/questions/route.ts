import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: "desc" }
    });
    
    const formatted = questions.map(q => ({
      ...q,
      image: q.image ? q.image.toString("utf-8") : null
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, type, options, code, correctAnswers, image } = await req.json();

    const imageBuffer = image ? Buffer.from(image, "utf-8") : null;

    const question = await (prisma.question as any).create({
      data: {
        title,
        type,
        options: options || [],
        correctAnswers: correctAnswers || [],
        code,
        image: imageBuffer
      }
    });

    const responseData = {
      ...question,
      image: question.image ? question.image.toString("utf-8") : null
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create question " + error }, { status: 500 });
  }
}
