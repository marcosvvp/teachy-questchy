import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { questionId, value, authorName } = await req.json();

    // Verify session is active before accepting answers
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question || !question.isActive) {
      return NextResponse.json({ error: "Sessão inativa ou questão não encontrada" }, { status: 400 });
    }

    const answer = await prisma.answer.create({
      data: {
        questionId,
        value,
        authorName: authorName || "Anônimo"
      }
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json({ error: "questionId parameter is required" }, { status: 400 });
    }

    const answers = await prisma.answer.findMany({
      where: { questionId }
    });

    return NextResponse.json(answers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 });
  }
}
