"use server";

/**
 * Server actions for Database Browser
 * Lightweight admin data browser for inspecting database tables
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/permissions";

/**
 * List all available database models
 * All models from Prisma schema converted to camelCase for client access
 */
export async function listModels() {
  await requireRole("CFO"); // CEO role is higher than ADMIN, so CEO can access
  
  return {
    success: true,
    models: [
      "account",
      "session",
      "user",
      "verificationToken",
      "organization",
      "organizationMember",
      "lead",
      "project",
      "projectMilestone",
      "invoice",
      "invoiceItem",
      "payment",
      "maintenancePlan",
      "pricingRule",
      "quote",
      "file",
      "signature",
      "notification",
      "webhookEvent",
      "channel",
      "channelMember",
      "chatMessage",
      "todo",
      "systemLog",
      "staffInviteCode",
      "message",
      "questionnaire",
      "subscription",
      "request",
      "changeRequest",
      "projectRequest",
      "activity",
      "maintenanceSchedule",
      "learningResource",
      "tool",
      "link",
      "automation",
      "training",
      "resource",
      "toolEntry",
      "assignment",
      "completion",
      "feedEvent",
      "messageThread",
      "threadMessage",
      "briefQuestionnaire",
      "clientTask",
      "projectQuestionnaire",
      "revenueSplit",
      "aiSuggestion",
      "userProfile",
      "twoFactorAuth",
      "userSession",
      "notificationPreferences",
      "userPreferences",
      "tosAcceptance",
      "loginHistory",
      "timeLog",
      "maintenanceLog",
      "financeTransaction",
      "maintenanceSubscription",
      "emailTemplate",
      "emailCampaign",
      "calendarEvent",
      "aiConversation",
      "aiMessage",
      "recording",
    ],
  };
}

/**
 * Query a specific database model
 * @param model - The name of the Prisma model to query
 * @param limit - Maximum number of records to return
 */
export async function query(model: string, limit = 50) {
  await requireRole("CFO");
  
  try {
    // Type-safe model access - all models from Prisma schema
    const validModels = [
      "account",
      "session",
      "user",
      "verificationToken",
      "organization",
      "organizationMember",
      "lead",
      "project",
      "projectMilestone",
      "invoice",
      "invoiceItem",
      "payment",
      "maintenancePlan",
      "pricingRule",
      "quote",
      "file",
      "signature",
      "notification",
      "webhookEvent",
      "channel",
      "channelMember",
      "chatMessage",
      "todo",
      "systemLog",
      "staffInviteCode",
      "message",
      "questionnaire",
      "subscription",
      "request",
      "changeRequest",
      "projectRequest",
      "activity",
      "maintenanceSchedule",
      "learningResource",
      "tool",
      "link",
      "automation",
      "training",
      "resource",
      "toolEntry",
      "assignment",
      "completion",
      "feedEvent",
      "messageThread",
      "threadMessage",
      "briefQuestionnaire",
      "clientTask",
      "projectQuestionnaire",
      "revenueSplit",
      "aiSuggestion",
      "userProfile",
      "twoFactorAuth",
      "userSession",
      "notificationPreferences",
      "userPreferences",
      "tosAcceptance",
      "loginHistory",
      "timeLog",
      "maintenanceLog",
      "financeTransaction",
      "maintenanceSubscription",
      "emailTemplate",
      "emailCampaign",
      "calendarEvent",
      "aiConversation",
      "aiMessage",
      "recording",
    ];
    
    if (!validModels.includes(model)) {
      return { success: false, error: "Invalid model", data: [] };
    }
    
    // Dynamic model access - cast to any to avoid index signature issues
    const prismaModel = (db as any)[model];
    // Try to order by createdAt first (most models have it), fallback to id
    let data;
    try {
      data = await prismaModel.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    } catch {
      // If createdAt doesn't exist (e.g., VerificationToken), use id
      data = await prismaModel.findMany({
        take: limit,
        orderBy: { id: "desc" },
      });
    }
    
    return { success: true, data };
  } catch (error) {
    console.error(`Failed to query ${model}:`, error);
    return { success: false, error: `Failed to query ${model}`, data: [] };
  }
}

/**
 * Get count of records in a model
 * @param model - The name of the Prisma model
 */
export async function getModelCount(model: string) {
  await requireRole("CFO");
  
  try {
    // Dynamic model access - cast to any to avoid index signature issues
    const prismaModel = (db as any)[model];
    const count = await prismaModel.count();
    return { success: true, count };
  } catch (error) {
    console.error(`Failed to count ${model}:`, error);
    return { success: false, count: 0 };
  }
}
