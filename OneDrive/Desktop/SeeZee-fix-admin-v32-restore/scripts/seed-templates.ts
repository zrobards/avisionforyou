import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_TEMPLATES = [
  {
    name: 'Nonprofit Outreach',
    category: 'CLIENT_OUTREACH',
    subject: 'Helping {{organizationName}} reach more people online',
    content: `<p>Hi {{clientName}},</p>

<p>I came across {{organizationName}} and was impressed by your work in {{category}}.</p>

<p>I noticed your organization doesn't currently have a website. As a Louisville-based web agency specializing in nonprofit platforms, we'd love to help you reach more people who need your services.</p>

<p>We recently built platforms for A Vision For You (AVFY) and Big Red Bus here in Louisville, helping them increase their online reach significantly.</p>

<p><strong>We offer 40% nonprofit discounts and can get you online in 2-3 weeks.</strong></p>

<p>Would you have 15 minutes this week for a quick call?</p>

<p>Best,<br>
{{teamMember}}<br>
SeeZee Studio<br>
Louisville, KY<br>
{{email}}<br>
{{phone}}</p>`,
    variables: ['organizationName', 'clientName', 'category', 'teamMember', 'email', 'phone']
  },
  {
    name: 'Welcome Email',
    category: 'WELCOME',
    subject: 'Welcome to SeeZee Studio! Your project has started 🚀',
    content: `<p>Hi {{clientName}},</p>

<p>Thanks for choosing SeeZee Studio for {{projectName}}! We're excited to build something great for {{organizationName}}.</p>

<h3>What's Next:</h3>
<ul>
<li>We'll reach out within 24 hours to gather project details</li>
<li>Track your progress anytime at <a href="{{dashboardUrl}}">your project dashboard</a></li>
<li>Estimated completion: {{estimatedDate}}</li>
</ul>

<p><strong>Your deposit of ${'{{amount}}'} has been received.</strong></p>

<p>Balance due upon completion: ${'{{balanceDue}}'}</p>

<p>Questions? Just reply to this email or call us at (502) 435-2986.</p>

<p>Best,<br>
{{teamMember}}<br>
SeeZee Studio</p>`,
    variables: ['clientName', 'projectName', 'organizationName', 'dashboardUrl', 'estimatedDate', 'amount', 'balanceDue', 'teamMember']
  },
  {
    name: 'Invoice Sent',
    category: 'INVOICE',
    subject: 'Invoice #{{invoiceNumber}} from SeeZee Studio',
    content: `<p>Hi {{clientName}},</p>

<p>Your invoice for {{projectName}} is ready!</p>

<h3>Invoice Details:</h3>
<ul>
<li>Invoice Number: #{{invoiceNumber}}</li>
<li>Amount Due: ${'{{amount}}'}</li>
<li>Due Date: {{dueDate}}</li>
</ul>

<p><a href="{{invoiceUrl}}" style="display: inline-block; background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View & Pay Invoice</a></p>

<p>We accept credit cards, bank transfers, and checks.</p>

<p>Questions about your invoice? Reply to this email.</p>

<p>Thank you!<br>
SeeZee Studio<br>
Louisville, KY</p>`,
    variables: ['clientName', 'projectName', 'invoiceNumber', 'amount', 'dueDate', 'invoiceUrl']
  },
  {
    name: 'Project Update',
    category: 'PROJECT_UPDATE',
    subject: '{{projectName}} Update: {{milestone}} Complete ✅',
    content: `<p>Hi {{clientName}},</p>

<p>Great news! We've completed <strong>{{milestone}}</strong> for {{projectName}}.</p>

<h3>What We Did:</h3>
{{updateDetails}}

<h3>Next Steps:</h3>
<ul>
<li>{{nextStep1}}</li>
<li>{{nextStep2}}</li>
</ul>

<p>Current Progress: <strong>{{progress}}% complete</strong></p>

<p>View the latest updates in <a href="{{dashboardUrl}}">your project dashboard</a>.</p>

<p>Questions or feedback? We're here!</p>

<p>Best,<br>
{{teamMember}}<br>
SeeZee Studio</p>`,
    variables: ['clientName', 'projectName', 'milestone', 'updateDetails', 'nextStep1', 'nextStep2', 'progress', 'dashboardUrl', 'teamMember']
  },
  {
    name: 'Proposal Sent',
    category: 'PROPOSAL',
    subject: 'Your Custom Proposal from SeeZee Studio',
    content: `<p>Hi {{clientName}},</p>

<p>Thanks for meeting with us about {{projectName}}! We're excited about the opportunity to work with {{organizationName}}.</p>

<p>Based on our conversation, we've prepared a custom proposal:</p>

<h3>Project Scope:</h3>
{{scopeSummary}}

<h3>Investment:</h3>
<ul>
<li>Development: ${'{{developmentCost}}'}</li>
<li>Timeline: {'{{timeline}}'}</li>
<li>Maintenance (optional): ${'{{maintenanceCost}}'}/month</li>
</ul>

<p><a href="{{proposalUrl}}" style="display: inline-block; background: #22d3ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Full Proposal</a></p>

<p>Ready to get started? Just reply to this email!</p>

<p>Best,<br>
{{teamMember}}<br>
SeeZee Studio<br>
(502) 435-2986</p>`,
    variables: ['clientName', 'projectName', 'organizationName', 'scopeSummary', 'developmentCost', 'timeline', 'maintenanceCost', 'proposalUrl', 'teamMember']
  },
  {
    name: 'Follow-Up',
    category: 'FOLLOW_UP',
    subject: 'Following up: {{projectName}}',
    content: `<p>Hi {{clientName}},</p>

<p>I wanted to follow up on our conversation about {{projectName}} for {{organizationName}}.</p>

<p>I know things get busy, so I wanted to check in:</p>
<ul>
<li>Do you have any questions about our proposal?</li>
<li>Is there anything we can clarify or adjust?</li>
<li>What's your timeline for moving forward?</li>
</ul>

<p>No pressure at all – just want to make sure you have everything you need to make a decision.</p>

<p>Happy to jump on a quick call if that's helpful!</p>

<p>Best,<br>
{{teamMember}}<br>
SeeZee Studio<br>
{{email}}<br>
{{phone}}</p>`,
    variables: ['clientName', 'projectName', 'organizationName', 'teamMember', 'email', 'phone']
  },
  {
    name: 'Thank You',
    category: 'FOLLOW_UP',
    subject: 'Thank you from SeeZee Studio! 🎉',
    content: `<p>Hi {{clientName}},</p>

<p><strong>Your website is live!</strong> 🚀</p>

<p>It was a pleasure building {{projectName}} for {{organizationName}}. We're proud of what we created together.</p>

<h3>Your Site:</h3>
<p><a href="{{websiteUrl}}">{{websiteUrl}}</a></p>

<h3>What's Included:</h3>
<ul>
<li>30 days of free support (any questions or small changes)</li>
<li>All login credentials sent separately</li>
<li>Domain and hosting details</li>
</ul>

<h3>Want Ongoing Maintenance?</h3>
<p>Our maintenance plans start at $79/month and include hosting, security updates, and monthly change requests.</p>

<p><a href="{{maintenanceUrl}}">Learn about maintenance plans →</a></p>

<p>Thanks again for trusting us with your web presence!</p>

<p>Best,<br>
{{teamMember}}<br>
SeeZee Studio</p>`,
    variables: ['clientName', 'projectName', 'organizationName', 'websiteUrl', 'maintenanceUrl', 'teamMember']
  },
  {
    name: 'Monthly Maintenance Report',
    category: 'MAINTENANCE',
    subject: '{{organizationName}} - Monthly Maintenance Report',
    content: `<p>Hi {{clientName}},</p>

<p>Here's your monthly maintenance report for {{websiteUrl}}.</p>

<h3>This Month's Activity:</h3>
<ul>
<li>Security updates: {{securityUpdates}}</li>
<li>Uptime: {{uptime}}%</li>
<li>Hours used: {{hoursUsed}} / {{hoursIncluded}}</li>
<li>Tasks completed: {{tasksCompleted}}</li>
</ul>

<h3>Changes Made:</h3>
{{changesSummary}}

<h3>Next Month:</h3>
{{nextMonthPlan}}

<p>Your site is secure, fast, and running smoothly. ✅</p>

<p>Need something updated? Just reply to this email!</p>

<p>Best,<br>
SeeZee Studio Maintenance Team</p>`,
    variables: ['clientName', 'organizationName', 'websiteUrl', 'securityUpdates', 'uptime', 'hoursUsed', 'hoursIncluded', 'tasksCompleted', 'changesSummary', 'nextMonthPlan']
  }
];

async function seedTemplates() {
  console.log('🌱 Seeding email templates...');

  for (const template of DEFAULT_TEMPLATES) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      update: {
        name: template.name,
        subject: template.subject,
        htmlContent: template.content,
        variables: template.variables,
        category: template.category as any
      },
      create: {
        name: template.name,
        category: template.category as any,
        subject: template.subject,
        htmlContent: template.content,
        variables: template.variables
      }
    });
    console.log(`✓ Created template: ${template.name}`);
  }

  console.log('✅ All templates seeded!');
}

seedTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
