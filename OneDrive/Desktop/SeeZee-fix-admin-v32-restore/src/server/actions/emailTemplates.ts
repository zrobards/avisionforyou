"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EmailCategory } from "@prisma/client";

export async function createEmailTemplate(data: {
  name: string;
  category: EmailCategory;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  active?: boolean;
}) {
  try {
    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        category: data.category,
        subject: data.subject,
        htmlContent: data.htmlContent,
        textContent: data.textContent || null,
        variables: data.variables,
        active: data.active ?? true,
      },
    });

    revalidatePath("/admin/marketing/templates");
    return { success: true, template };
  } catch (error: any) {
    console.error("Error creating email template:", error);
    return {
      success: false,
      error: error.message || "Failed to create email template",
    };
  }
}

export async function updateEmailTemplate(
  id: string,
  data: {
    name?: string;
    category?: EmailCategory;
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    variables?: string[];
    active?: boolean;
  }
) {
  try {
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category }),
        ...(data.subject && { subject: data.subject }),
        ...(data.htmlContent !== undefined && { htmlContent: data.htmlContent }),
        ...(data.textContent !== undefined && { textContent: data.textContent || null }),
        ...(data.variables && { variables: data.variables }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });

    revalidatePath("/admin/marketing/templates");
    revalidatePath(`/admin/marketing/templates/${id}`);
    return { success: true, template };
  } catch (error: any) {
    console.error("Error updating email template:", error);
    return {
      success: false,
      error: error.message || "Failed to update email template",
    };
  }
}

export async function deleteEmailTemplate(id: string) {
  try {
    await prisma.emailTemplate.delete({
      where: { id },
    });

    revalidatePath("/admin/marketing/templates");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting email template:", error);
    return {
      success: false,
      error: error.message || "Failed to delete email template",
    };
  }
}









