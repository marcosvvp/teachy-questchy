import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, type, options, code, correctAnswers } = await req.json();

    const question = await (prisma.question as any).create({
      data: {
        title,
        type,
        options: options || [],
        correctAnswers: correctAnswers || [],
        code
      }
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create question " + error }, { status: 500 });
  }
}
