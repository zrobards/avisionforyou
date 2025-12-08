import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapBudgetToTier } from "@/lib/budget-mapping";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const { 
      "what are you building?": projectType, 
      "what's your goal with it?": goal, 
      "when do you want it live?": timeline, 
      "what's your budget range?": budget, 
      "how can we reach you?": contact 
    } = data;

    // Validate required fields
    if (!projectType || !goal || !timeline || !budget || !contact) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Ensure contact has name and email
    if (!contact.name || !contact.email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" }, 
        { status: 400 }
      );
    }

    const project = await prisma.projectRequest.create({
      data: {
        name: contact.name,
        email: contact.email,
        projectType,
        goal,
        timeline,
        budget: mapBudgetToTier(budget),
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Failed to store project request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save project" }, 
      { status: 500 }
    );
  }
}