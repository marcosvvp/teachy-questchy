import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, context: { params: Promise<{ code: string }> }) {
    try {
        const { code } = await context.params;
        const body = await req.json();
        
        if (typeof body.isActive !== 'boolean') {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const dataToUpdate: any = { isActive: body.isActive };
        if (typeof body.studentsCount === 'number') {
            dataToUpdate.studentsCount = body.studentsCount;
        }

        const question = await prisma.question.update({
            where: { code },
            data: dataToUpdate,
        });

        return NextResponse.json(question);
    } catch (error) {
        console.error("Error updating question status:", error);
        return NextResponse.json({ error: "Failed to update question status" }, { status: 500 });
    }
}
