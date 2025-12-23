/**
 * Usage Warning Email System
 * 
 * Sends notifications to clients at key usage thresholds:
 * - 80% of hours used
 * - 2 hours remaining
 * - At limit
 * - First overage
 * - Expiring rollover/pack hours
 */

import { db } from '@/server/db';
import { getHoursBalance } from './tracker';
import { 
  formatPrice, 
  formatHours, 
  getTier, 
  HOUR_PACKS, 
  ON_DEMAND_SETTINGS,
  EXTENSION_OPTIONS,
} from '@/lib/config/tiers';

// =============================================================================
// TYPES
// =============================================================================

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

type WarningType = 
  | 'AT_80_PERCENT'
  | 'AT_2_HOURS'
  | 'AT_LIMIT'
  | 'FIRST_OVERAGE'
  | 'ROLLOVER_EXPIRING'
  | 'PACK_EXPIRING';

// =============================================================================
// CHECK & SEND WARNINGS
// =============================================================================

/**
 * Check and send any needed usage warnings for a plan
 */
export async function checkAndSendWarnings(planId: string): Promise<WarningType[]> {
  const balance = await getHoursBalance(planId);
  if (!balance || balance.isUnlimited) return [];
  
  const plan = await db.maintenancePlan.findUnique({
    where: { id: planId },
    include: {
      project: {
        include: {
          organization: {
            include: {
              members: {
                include: { user: true },
                where: { role: 'OWNER' },
              },
            },
          },
        },
      },
    },
  });
  
  if (!plan?.project?.organization) return [];
  
  const owner = plan.project.organization.members[0]?.user;
  if (!owner?.email) return [];
  
  const warnings: WarningType[] = [];
  const periodStart = plan.currentPeriodStart ?? new Date();
  
  // Check usage thresholds
  const usagePercent = balance.monthlyIncluded > 0 
    ? balance.monthlyUsed / balance.monthlyIncluded 
    : 0;
  
  // 80% warning
  if (usagePercent >= 0.8 && usagePercent < 1) {
    const sent = await sendWarningIfNotAlreadySent(
      planId,
      'AT_80_PERCENT',
      periodStart,
      owner.email,
      () => generate80PercentWarning(balance, plan, owner)
    );
    if (sent) warnings.push('AT_80_PERCENT');
  }
  
  // 2 hours remaining
  if (balance.monthlyRemaining <= 2 && balance.monthlyRemaining > 0) {
    const sent = await sendWarningIfNotAlreadySent(
      planId,
      'AT_2_HOURS',
      periodStart,
      owner.email,
      () => generate2HoursWarning(balance, plan, owner)
    );
    if (sent) warnings.push('AT_2_HOURS');
  }
  
  // At limit
  if (balance.atLimit && !balance.isOverage) {
    const sent = await sendWarningIfNotAlreadySent(
      planId,
      'AT_LIMIT',
      periodStart,
      owner.email,
      () => generateAtLimitWarning(balance, plan, owner)
    );
    if (sent) warnings.push('AT_LIMIT');
  }
  
  // First overage
  if (balance.isOverage && balance.overageHours > 0) {
    const sent = await sendWarningIfNotAlreadySent(
      planId,
      'FIRST_OVERAGE',
      periodStart,
      owner.email,
      () => generateOverageWarning(balance, plan, owner)
    );
    if (sent) warnings.push('FIRST_OVERAGE');
  }
  
  // Expiring rollover
  for (const rollover of balance.rolloverExpiringSoon) {
    if (rollover.daysUntilExpiry <= 7) {
      const sent = await sendWarningIfNotAlreadySent(
        planId,
        'ROLLOVER_EXPIRING',
        rollover.expiresAt,
        owner.email,
        () => generateRolloverExpiryWarning(rollover, plan, owner),
        rollover.hours
      );
      if (sent) warnings.push('ROLLOVER_EXPIRING');
    }
  }
  
  // Expiring packs
  for (const pack of balance.packHoursExpiringSoon) {
    if (pack.daysUntilExpiry && pack.daysUntilExpiry <= 7) {
      const sent = await sendWarningIfNotAlreadySent(
        planId,
        'PACK_EXPIRING',
        pack.expiresAt ?? new Date(),
        owner.email,
        () => generatePackExpiryWarning(pack, plan, owner),
        pack.hours
      );
      if (sent) warnings.push('PACK_EXPIRING');
    }
  }
  
  return warnings;
}

/**
 * Send warning if not already sent for this period
 */
async function sendWarningIfNotAlreadySent(
  planId: string,
  warningLevel: WarningType,
  periodStart: Date,
  emailTo: string,
  generateEmail: () => EmailPayload,
  hoursExpiring?: number,
): Promise<boolean> {
  // Check if already sent
  const existing = await db.overageNotification.findFirst({
    where: {
      planId,
      warningLevel: warningLevel as any,
      periodStart,
    },
  });
  
  if (existing) return false;
  
  // Generate and send email
  const email = generateEmail();
  await sendEmail(email);
  
  // Record that we sent it
  await db.overageNotification.create({
    data: {
      planId,
      warningLevel: warningLevel as any,
      periodStart,
      emailTo,
      hoursExpiring,
    },
  });
  
  return true;
}

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

function generate80PercentWarning(
  balance: Awaited<ReturnType<typeof getHoursBalance>>,
  plan: any,
  owner: any,
): EmailPayload {
  const projectName = plan.project?.name ?? 'Your Project';
  const remaining = balance?.monthlyRemaining ?? 0;
  
  return {
    to: owner.email,
    subject: `⏰ You've used 80% of your monthly hours - ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're at 80% of your monthly hours</h2>
        <p>Hi ${owner.name ?? 'there'},</p>
        <p>You've used 80% of your included support hours for <strong>${projectName}</strong> this month.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Hours Used:</strong> ${formatHours(balance?.monthlyUsed ?? 0)}</p>
          <p><strong>Hours Remaining:</strong> ${formatHours(remaining)}</p>
        </div>
        
        <h3>Ways to ensure you don't run out:</h3>
        <ul>
          <li><strong>Enable On-Demand Billing</strong> - Automatically charge overage at ${formatPrice(ON_DEMAND_SETTINGS.hourlyRate)}/hour</li>
          <li><strong>Purchase an Hour Pack</strong> - Get extra hours at a discount</li>
          <li><strong>Upgrade Your Plan</strong> - Get more included hours each month</li>
        </ul>
        
        <a href="${process.env.NEXTAUTH_URL}/client/settings/billing" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px;">
          Manage Billing Settings
        </a>
        
        <p style="margin-top: 30px; color: #666;">
          - The SeeZee Studios Team
        </p>
      </div>
    `,
    text: `You've used 80% of your monthly hours for ${projectName}. ${formatHours(remaining)} remaining.`,
  };
}

function generate2HoursWarning(
  balance: Awaited<ReturnType<typeof getHoursBalance>>,
  plan: any,
  owner: any,
): EmailPayload {
  const projectName = plan.project?.name ?? 'Your Project';
  
  return {
    to: owner.email,
    subject: `⚠️ Only 2 hours remaining - ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">⚠️ Only 2 hours left this month</h2>
        <p>Hi ${owner.name ?? 'there'},</p>
        <p>You only have <strong>2 hours remaining</strong> for <strong>${projectName}</strong> this month.</p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f59e0b;">
          <p style="margin: 0;"><strong>⏱️ Hours Remaining:</strong> ${formatHours(balance?.monthlyRemaining ?? 0)}</p>
        </div>
        
        <h3>Recommended Actions:</h3>
        <ol>
          <li><strong>Purchase a Quick Boost Pack</strong> - 5 hours for ${formatPrice(HOUR_PACKS.SMALL.cost)}</li>
          <li><strong>Enable On-Demand</strong> - Never get blocked, pay ${formatPrice(ON_DEMAND_SETTINGS.hourlyRate)}/hour for overage</li>
        </ol>
        
        <a href="${process.env.NEXTAUTH_URL}/client/hours" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px;">
          Purchase Hours
        </a>
        
        <p style="margin-top: 30px; color: #666;">
          - The SeeZee Studios Team
        </p>
      </div>
    `,
    text: `Only 2 hours remaining for ${projectName}. Consider purchasing additional hours.`,
  };
}

function generateAtLimitWarning(
  balance: Awaited<ReturnType<typeof getHoursBalance>>,
  plan: any,
  owner: any,
): EmailPayload {
  const projectName = plan.project?.name ?? 'Your Project';
  
  return {
    to: owner.email,
    subject: `🚨 Monthly hours limit reached - ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">🚨 You've reached your monthly limit</h2>
        <p>Hi ${owner.name ?? 'there'},</p>
        <p>You've used all ${formatHours(balance?.monthlyIncluded ?? 0)} of included support hours for <strong>${projectName}</strong> this month.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ef4444;">
          <p style="margin: 0;"><strong>Current Request:</strong> Will complete normally</p>
          <p style="margin: 10px 0 0 0;"><strong>New Requests:</strong> Require additional hours or on-demand billing</p>
        </div>
        
        <h3>Your Options:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">
              <strong>Quick Boost Pack</strong><br>
              5 hours for ${formatPrice(HOUR_PACKS.SMALL.cost)}
            </td>
            <td style="padding: 10px; border: 1px solid #ddd;">
              <strong>Power Pack</strong><br>
              10 hours for ${formatPrice(HOUR_PACKS.MEDIUM.cost)} ⭐ Best Value
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">
              <strong>Enable On-Demand</strong><br>
              ${formatPrice(ON_DEMAND_SETTINGS.hourlyRate)}/hour, never get blocked
            </td>
            <td style="padding: 10px; border: 1px solid #ddd;">
              <strong>Wait Until Reset</strong><br>
              Your plan renews on the 1st
            </td>
          </tr>
        </table>
        
        <a href="${process.env.NEXTAUTH_URL}/client/hours" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          Purchase Hours Now
        </a>
        
        <p style="margin-top: 30px; color: #666;">
          - The SeeZee Studios Team
        </p>
      </div>
    `,
    text: `You've reached your monthly limit for ${projectName}. Purchase additional hours or enable on-demand billing.`,
  };
}

function generateOverageWarning(
  balance: Awaited<ReturnType<typeof getHoursBalance>>,
  plan: any,
  owner: any,
): EmailPayload {
  const projectName = plan.project?.name ?? 'Your Project';
  const overageCost = (balance?.overageHours ?? 0) * ON_DEMAND_SETTINGS.hourlyRate;
  
  return {
    to: owner.email,
    subject: `📊 Overage hours used - ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>We finished your request (with a small overage)</h2>
        <p>Hi ${owner.name ?? 'there'},</p>
        <p>Good news! We completed your request for <strong>${projectName}</strong>.</p>
        <p>Since you were at your monthly limit, this request used some overage hours:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Overage Hours:</strong> ${formatHours(balance?.overageHours ?? 0)}</p>
          <p><strong>One-Time Grace:</strong> ${!plan.onDemandEnabled ? 'Applied (no charge)' : 'N/A'}</p>
          ${plan.onDemandEnabled ? `<p><strong>Overage Cost:</strong> ${formatPrice(overageCost)}</p>` : ''}
        </div>
        
        ${!plan.onDemandEnabled ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Note:</strong> This was your one-time grace period. Future requests beyond your limit will require on-demand billing or an hour pack purchase.</p>
          </div>
        ` : ''}
        
        <a href="${process.env.NEXTAUTH_URL}/client/settings/billing" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px;">
          Manage Billing Settings
        </a>
        
        <p style="margin-top: 30px; color: #666;">
          - The SeeZee Studios Team
        </p>
      </div>
    `,
    text: `We completed your request with ${formatHours(balance?.overageHours ?? 0)} overage hours.`,
  };
}

function generateRolloverExpiryWarning(
  rollover: { hours: number; expiresAt: Date; daysUntilExpiry: number },
  plan: any,
  owner: any,
): EmailPayload {
  const projectName = plan.project?.name ?? 'Your Project';
  const value = rollover.hours * ON_DEMAND_SETTINGS.hourlyRate;
  
  return {
    to: owner.email,
    subject: `🚨 ${formatHours(rollover.hours)} expiring in ${rollover.daysUntilExpiry} days - ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">🚨 Your rollover hours are expiring!</h2>
        <p>Hi ${owner.name ?? 'there'},</p>
        <p>You have <strong>${formatHours(rollover.hours)}</strong> of rollover hours that will expire on <strong>${rollover.expiresAt.toLocaleDateString()}</strong> (${rollover.daysUntilExpiry} days).</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ef4444;">
          <p><strong>Hours Expiring:</strong> ${formatHours(rollover.hours)}</p>
          <p><strong>Value:</strong> ${formatPrice(value)}</p>
          <p><strong>Expires:</strong> ${rollover.expiresAt.toLocaleDateString()}</p>
        </div>
        
        <h3>Don't let these hours go to waste!</h3>
        <ul>
          <li>Submit a change request</li>
          <li>Schedule a training session</li>
          <li>Request a content audit</li>
          <li>Get SEO optimization</li>
        </ul>
        
        <a href="${process.env.NEXTAUTH_URL}/client/requests/new" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px;">
          Submit a Request
        </a>
        
        <p style="margin-top: 30px; color: #666;">
          - The SeeZee Studios Team
        </p>
      </div>
    `,
    text: `${formatHours(rollover.hours)} rollover hours worth ${formatPrice(value)} expire on ${rollover.expiresAt.toLocaleDateString()}.`,
  };
}

function generatePackExpiryWarning(
  pack: { packId: string; packName: string; hours: number; expiresAt: Date | null; daysUntilExpiry: number | null },
  plan: any,
  owner: any,
): EmailPayload {
  const projectName = plan.project?.name ?? 'Your Project';
  const value = pack.hours * ON_DEMAND_SETTINGS.hourlyRate;
  const extendCost = EXTENSION_OPTIONS.EXTEND_30_DAYS.cost;
  const convertCost = pack.hours * EXTENSION_OPTIONS.CONVERT_TO_NEVER_EXPIRE.costPerHour;
  
  return {
    to: owner.email,
    subject: `🔴 URGENT: ${formatHours(pack.hours)} expiring in ${pack.daysUntilExpiry} days - ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">🔴 Your hour pack is expiring!</h2>
        <p>Hi ${owner.name ?? 'there'},</p>
        <p><strong>URGENT:</strong> Your ${pack.packName} pack has <strong>${formatHours(pack.hours)}</strong> remaining and expires on <strong>${pack.expiresAt?.toLocaleDateString()}</strong> (${pack.daysUntilExpiry} days).</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #ef4444;">
          <p><strong>Hours Remaining:</strong> ${formatHours(pack.hours)}</p>
          <p><strong>Value:</strong> ${formatPrice(value)}</p>
          <p><strong>Expires:</strong> ${pack.expiresAt?.toLocaleDateString()}</p>
        </div>
        
        <h3>Your Options:</h3>
        <ol>
          <li><strong>Use them now</strong> - Submit a change request</li>
          <li><strong>Extend 30 days</strong> - ${formatPrice(extendCost)}</li>
          <li><strong>Convert to never-expire</strong> - ${formatPrice(convertCost)}</li>
        </ol>
        
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <a href="${process.env.NEXTAUTH_URL}/client/requests/new" 
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Use Hours Now
          </a>
          <a href="${process.env.NEXTAUTH_URL}/client/hours?extend=${pack.packId}" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Extend Pack
          </a>
        </div>
        
        <p style="margin-top: 30px; color: #666;">
          Need help? Call us: (502) 435-2986<br>
          - The SeeZee Studios Team
        </p>
      </div>
    `,
    text: `URGENT: ${formatHours(pack.hours)} in your ${pack.packName} pack expire on ${pack.expiresAt?.toLocaleDateString()}. Use them, extend, or convert to never-expire.`,
  };
}

// =============================================================================
// EMAIL SENDING
// =============================================================================

/**
 * Send an email (implement with your email provider)
 */
async function sendEmail(payload: EmailPayload): Promise<void> {
  // TODO: Implement with your email provider (Resend, SendGrid, etc.)
  console.log('[Email] Sending:', payload.subject, 'to', payload.to);
  
  // For now, just log it
  // In production, use something like:
  // await resend.emails.send({
  //   from: 'SeeZee Studios <support@seezee.studio>',
  //   to: payload.to,
  //   subject: payload.subject,
  //   html: payload.html,
  //   text: payload.text,
  // });
}
