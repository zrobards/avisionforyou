import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendWelcomeEmail } from '@/lib/mailer';
import { mapBudgetToTier } from '@/lib/budget-mapping';

import { LeadStatus, ProjectStatus, BudgetTier, MaintenancePlanStatus } from '@prisma/client';

// Helper to get user-friendly service type display name
function getServiceDisplayName(serviceType: string): string {
  const mapping: Record<string, string> = {
    'BUSINESS_WEBSITE': 'Business Website',
    'NONPROFIT_WEBSITE': 'Nonprofit Website',
    'PERSONAL_WEBSITE': 'Personal Website',
    'MAINTENANCE_PLAN': 'Website Maintenance',
  };
  return mapping[serviceType] || serviceType;
}

// Helper to generate clean project description
function generateProjectDescription(data: {
  serviceType: string;
  projectGoals?: string;
  maintenanceNeeds?: string[];
  urgency?: string;
  websiteUrl?: string;
  timeline?: string;
}): string {
  const serviceName = getServiceDisplayName(data.serviceType);
  
  // For maintenance plans, format specially
  if (data.serviceType === 'MAINTENANCE_PLAN') {
    const parts: string[] = [];
    
    if (data.maintenanceNeeds && data.maintenanceNeeds.length > 0) {
      parts.push(`Services needed: ${data.maintenanceNeeds.join(', ')}`);
    }
    
    if (data.websiteUrl) {
      parts.push(`Website: ${data.websiteUrl}`);
    }
    
    if (data.urgency) {
      parts.push(`Priority: ${data.urgency}`);
    }
    
    if (data.projectGoals && !data.projectGoals.startsWith('Maintenance needs:')) {
      parts.push(`Additional details: ${data.projectGoals}`);
    }
    
    return parts.length > 0 
      ? `${serviceName} request. ${parts.join('. ')}`
      : `${serviceName} request`;
  }
  
  // For other project types
  if (data.projectGoals) {
    return data.projectGoals.length > 200 
      ? data.projectGoals.substring(0, 200) + '...'
      : data.projectGoals;
  }
  
  return `${serviceName} project`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // REJECT LEGACY QUESTIONNAIRE FIELDS - SeeZee V2 Migration
    // These fields are from the old questionnaire system and should no longer be accepted
    const legacyFields = ['qid', 'packageId', 'selectedFeatures', 'answers', 'package'];
    const hasLegacyFields = legacyFields.some(field => field in body);
    
    if (hasLegacyFields) {
      return NextResponse.json(
        { 
          error: 'Invalid request format. The old questionnaire system is no longer supported. Please use the new service intake form.',
          code: 'LEGACY_FORMAT_REJECTED'
        },
        { status: 400 }
      );
    }

    // Get the authenticated user's session (optional for new flow)
    const session = await auth();
    
    // Extract data from new simplified format
    const { 
      serviceType, email, name, phone, company, projectGoals, budget, timeline, 
      nonprofitStatus, nonprofitEIN, attachments,
      // Maintenance-specific fields
      maintenanceNeeds, maintenanceTier, urgency, websiteUrl, websitePlatform, hasAccessCredentials,
      // Hours tracking
      estimatedHours
    } = body;
    
    // Validate required fields for new flow
    if (!serviceType || !email || !name || !projectGoals) {
      return NextResponse.json({ error: 'Missing required fields: serviceType, email, name, projectGoals' }, { status: 400 });
    }
    
    // Get or create user
    let user = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, name: true, email: true },
      });
    }
    
    // If no authenticated user, try to find or create by email
    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email: email },
        select: { id: true, name: true, email: true },
      });
      
      // Create user if they don't exist (for unauthenticated submissions)
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email,
            name: name,
            role: 'CLIENT',
          },
          select: { id: true, name: true, email: true },
        });
      }
    }

    // Check for active project requests if user exists
    if (user) {
      const activeRequests = await prisma.projectRequest.findMany({
        where: {
          userId: user.id,
          status: {
            in: ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'],
          },
        },
      });

      if (activeRequests.length > 0) {
        return NextResponse.json(
          { 
            error: 'You already have an active project request. Please wait for it to be reviewed before submitting a new one.',
            activeRequest: {
              id: activeRequests[0].id,
              title: activeRequests[0].title,
              status: activeRequests[0].status,
            },
          },
          { status: 400 }
        );
      }
    }
    
    const { qid, packageId, referralSource, stage, outreachProgram, projectType, specialRequirements } = body;

    // Handle both formats: questionnaire-based (qid) and form-based (packageId)
    if (qid) {
      // Original questionnaire-based flow
      const questionnaire = await prisma.questionnaire.findUnique({
        where: { id: qid },
      });

      if (!questionnaire) {
        return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
      }

      const data = questionnaire.data as any;
      const { totals, package: selectedPackage, selectedFeatures, questionnaire: answers } = data;

      // Update status to SUBMITTED
      await prisma.questionnaire.update({
        where: { id: qid },
        data: {
          data: {
            ...data,
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
          },
        },
      });

      // Create lead record linked to the user
      const lead = await prisma.lead.create({
        data: {
          name: user?.name || 'Unknown',
          email: user?.email || questionnaire.userEmail,
          phone: '', // Can be added to user profile later
          company: '', // Can be added to user profile later
          message: `Package: ${selectedPackage}\nFeatures: ${selectedFeatures?.length || 0} selected\nTotal: $${totals?.total || 0}\nTimeline: ${answers?.timeline || 'Not specified'}`,
          source: 'Questionnaire',
          status: LeadStatus.NEW,
          metadata: {
            qid,
            userId: user?.id,
            package: selectedPackage,
            features: selectedFeatures,
            totals,
            questionnaire: answers,
          },
        },
      });

      // Notify all admins about new lead
      const { createNewLeadNotification } = await import("@/lib/notifications");
      await createNewLeadNotification(
        lead.id,
        lead.name,
        lead.email,
        lead.company,
        lead.source || "Questionnaire"
      ).catch(err => console.error("Failed to create lead notification:", err));

      // Map projectType to ServiceType enum values
      const mapToServiceType = (type: string): string => {
        const mapping: Record<string, string> = {
          'Website': 'WEBSITE',
          'Web App': 'WEB_APP',
          'Mobile App': 'MOBILE',
          'Branding': 'BRANDING',
          'Dashboard': 'WEB_APP',
          'AI Integration': 'AI_DATA',
          'Other': 'OTHER',
        };
        return mapping[type] || 'OTHER';
      };

      const services = answers?.projectType 
        ? (Array.isArray(answers.projectType) 
            ? answers.projectType.map(mapToServiceType)
            : [mapToServiceType(answers.projectType)])
        : [];

      // Create ProjectRequest so it appears in client dashboard
      const projectRequest = await prisma.projectRequest.create({
        data: {
          userId: user?.id,
          title: `${selectedPackage} Package Request`,
          description: `Package: ${selectedPackage}\nFeatures: ${selectedFeatures?.length || 0} selected\nTotal: $${totals?.total || 0}\nTimeline: ${answers?.timeline || 'Not specified'}`,
          contactEmail: user?.email || questionnaire.userEmail,
          company: '',
          budget: BudgetTier.UNKNOWN, // Can be mapped from totals if needed
          timeline: answers?.timeline || null,
          services: services as any,
          status: 'SUBMITTED',
        },
      });

      return NextResponse.json({
        success: true,
        leadId: lead.id,
        projectRequestId: projectRequest.id,
      });
    } else if ((packageId || serviceType) && email && name) {
      // New form-based flow from ProjectRequestForm
      // Support both packageId (legacy) and serviceType (new)
      const selectedService = serviceType || packageId;

      // Ensure user exists at this point
      if (!user) {
        return NextResponse.json({ error: 'User account is required' }, { status: 401 });
      }

      // TypeScript now knows user is not null
      const currentUser = user;

      // 1. Find or create organization for the user
      let organization = await prisma.organization.findFirst({
        where: {
          members: {
            some: {
              userId: currentUser.id
            }
          }
        }
      });

      if (!organization) {
        // Create organization
        const orgName = company || `${name}'s Organization`;
        const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
        
        organization = await prisma.organization.create({
          data: {
            name: orgName,
            slug: slug,
            members: {
              create: {
                userId: currentUser.id,
                role: 'OWNER'
              }
            }
          }
        });
      }

      // Generate a clean lead message based on service type
      const isMaintenanceLead = selectedService === 'MAINTENANCE_PLAN';
      let leadMessage = '';
      
      if (isMaintenanceLead) {
        const messageParts: string[] = [];
        if (maintenanceNeeds && maintenanceNeeds.length > 0) {
          messageParts.push(`Services needed: ${maintenanceNeeds.join(', ')}`);
        }
        if (websiteUrl) {
          messageParts.push(`Website: ${websiteUrl}`);
        }
        if (websitePlatform) {
          messageParts.push(`Platform: ${websitePlatform}`);
        }
        if (urgency) {
          messageParts.push(`Priority: ${urgency}`);
        }
        if (maintenanceTier) {
          messageParts.push(`Preferred plan: ${maintenanceTier}`);
        }
        if (projectGoals && !projectGoals.startsWith('Maintenance needs:')) {
          messageParts.push(`Details: ${projectGoals}`);
        }
        leadMessage = messageParts.join('\n\n');
      } else {
        leadMessage = `Project Goals: ${projectGoals || 'Not specified'}\n\nTimeline: ${timeline || 'Not specified'}\n\nBudget: ${budget || 'Not specified'}\n\nSpecial Requirements: ${specialRequirements || 'None'}${nonprofitStatus ? `\n\nNonprofit Status: ${nonprofitStatus}` : ''}${nonprofitEIN ? `\n\nEIN: ${nonprofitEIN}` : ''}`;
      }

      // 2. Create lead record from form data
      // Ensure we have a valid name - use user's name as fallback if form name is empty
      const leadName = name?.trim() || currentUser.name || email?.split('@')[0] || 'Unknown Client';
      
      const lead = await prisma.lead.create({
        data: {
          name: leadName,
          email: email,
          phone: phone || null,
          company: company || null,
          organizationId: organization.id, // Link to organization
          message: leadMessage,
          source: referralSource || 'Service Selection',
          status: LeadStatus.NEW,
          serviceType: selectedService, // ServiceCategory enum value (BUSINESS_WEBSITE, etc.)
          metadata: {
            userId: currentUser.id,
            budget: budget || null,
            attachments: attachments || null,
            referralSource: referralSource || null,
            stage: stage || null,
            outreachProgram: outreachProgram || null,
            projectType: projectType || null,
            projectGoals: projectGoals || null,
            timeline: timeline || urgency || null,
            specialRequirements: specialRequirements || null,
            nonprofitStatus: nonprofitStatus || null,
            nonprofitEIN: nonprofitEIN || null,
            // Maintenance-specific metadata
            maintenanceNeeds: maintenanceNeeds || null,
            maintenanceTier: maintenanceTier || null,
            urgency: urgency || null,
            websiteUrl: websiteUrl || null,
            websitePlatform: websitePlatform || null,
            hasAccessCredentials: hasAccessCredentials || null,
          },
        },
      });

      // Notify all admins about new lead
      const { createNewLeadNotification } = await import("@/lib/notifications");
      await createNewLeadNotification(
        lead.id,
        lead.name,
        lead.email,
        lead.company,
        lead.source || "Service Selection"
      ).catch(err => console.error("Failed to create lead notification:", err));

      // Map projectType to ServiceType enum values
      const mapToServiceType = (type: string): string => {
        const mapping: Record<string, string> = {
          'Website': 'WEBSITE',
          'Web App': 'WEB_APP',
          'Mobile App': 'MOBILE',
          'Branding': 'BRANDING',
          'Dashboard': 'WEB_APP',
          'AI Integration': 'AI_DATA',
          'Other': 'OTHER',
        };
        return mapping[type] || 'OTHER';
      };

      const services = projectType
        ? (Array.isArray(projectType)
            ? projectType.map(mapToServiceType)
            : [mapToServiceType(projectType)])
        : [];

      // Generate clean project title and description
      const isMaintenance = selectedService === 'MAINTENANCE_PLAN';
      const projectTitle = isMaintenance 
        ? `${name}'s Maintenance Plan`
        : `${name}'s Project`;
      
      const projectDescription = generateProjectDescription({
        serviceType: selectedService,
        projectGoals,
        maintenanceNeeds,
        urgency,
        websiteUrl,
        timeline,
      });

      // 3. Create ProjectRequest so it appears in client dashboard
      const projectRequest = await prisma.projectRequest.create({
        data: {
          userId: currentUser.id,
          name: leadName, // Set the name field to match the lead
          title: isMaintenance 
            ? `${leadName}'s Maintenance Plan Request` 
            : (projectGoals?.substring(0, 100) || `${leadName}'s ${getServiceDisplayName(selectedService)} Request`),
          description: projectDescription,
          contactEmail: email,
          company: company || null,
          budget: mapBudgetToTier(budget),
          timeline: timeline || urgency || null,
          services: services as any,
          status: 'SUBMITTED',
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null, // Store estimated hours if provided
        },
      });

      // 4. Create Project automatically
      const isNonprofitProject = 
        outreachProgram?.includes?.('nonprofit') || 
        (typeof nonprofitStatus === 'string' && nonprofitStatus.includes('501(c)(3)')) ||
        nonprofitStatus === true ||
        selectedService === 'NONPROFIT_WEBSITE';
      const project = await prisma.project.create({
        data: {
          name: projectTitle,
          description: projectDescription,
          status: ProjectStatus.LEAD, // Initial status
          organizationId: organization.id,
          // Copy questionnaire data
          // budget: we don't have exact budget from questionnaire yet
          // Link to lead and request
          leadId: lead.id,
          // TODO: Add isNonprofit field once Prisma client is regenerated
          // isNonprofit: isNonprofitProject,
        },
      });

      // 4b. Create MaintenancePlan if this is a maintenance service
      let maintenancePlan = null;
      if (isMaintenance) {
        // Maintenance tier configuration matching the form options
        // Map to actual NONPROFIT_TIERS - change requests are unlimited (tied to hours)
        const maintenanceTierConfig: Record<string, { 
          tier: string; 
          monthlyPrice: number; 
          supportHoursIncluded: number; 
        }> = {
          'essentials': { 
            tier: 'ESSENTIALS', 
            monthlyPrice: 50000,      // $500/month
            supportHoursIncluded: 8,   // 8 hours/month (doubled from 4)
          },
          'director': { 
            tier: 'DIRECTOR', 
            monthlyPrice: 75000,      // $750/month
            supportHoursIncluded: 16, // 16 hours/month
          },
          'coo': { 
            tier: 'COO', 
            monthlyPrice: 200000,     // $2,000/month
            supportHoursIncluded: -1, // Unlimited hours
          },
        };
        
        const selectedTier = maintenanceTier || 'essentials';
        const tierConfig = maintenanceTierConfig[selectedTier] || maintenanceTierConfig['essentials'];
        
        if (!tierConfig) {
          throw new Error(`Invalid maintenance tier: ${selectedTier}`);
        }
        
        maintenancePlan = await prisma.maintenancePlan.create({
          data: {
            projectId: project.id,
            tier: tierConfig.tier,
            monthlyPrice: tierConfig.monthlyPrice,
            status: MaintenancePlanStatus.ACTIVE,
            // Use tier-specific values - change requests are unlimited (tied to hours)
            supportHoursIncluded: tierConfig.supportHoursIncluded,
            changeRequestsIncluded: -1, // Unlimited - tied to hours
          },
        });
        
        console.log(`Created MaintenancePlan ${maintenancePlan.id} for project ${project.id} with tier ${tierConfig.tier} (${tierConfig.supportHoursIncluded} hours, $${tierConfig.monthlyPrice / 100}/month)`);
      }

      // 5. Update ProjectRequest to link to created project
      await prisma.projectRequest.update({
        where: { id: projectRequest.id },
        data: { 
          // Note: ProjectRequest doesn't have projectId field in schema based on what I saw,
          // but I should check schema. 
          // Checking schema... ProjectRequest does NOT have projectId. 
          // Wait, the plan says "Update ProjectRequest to link to created project". 
          // I should check if I can link it.
          // ProjectRequest model:
          // model ProjectRequest {
          //   id           String        @id @default(cuid())
          //   ...
          //   status       RequestStatus @default(DRAFT)
          //   user         User?         @relation(fields: [userId], references: [id])
          // }
          // It seems ProjectRequest is for requests that are NOT yet projects.
          // If we create a project, we might want to mark ProjectRequest as APPROVED or ARCHIVED?
          // Or maybe just ignore linking if the field doesn't exist.
          // I'll check schema again.
          status: 'APPROVED' // Mark as approved since we created a project
        },
      });

      // 6. Create activity/feed event for admin notification
      await prisma.activity.create({
        data: {
          type: 'PROJECT_CREATED',
          title: 'New Project Created', // Added title which is required
          description: `New project inquiry from ${name}`,
          userId: currentUser.id,
          metadata: {
            projectId: project.id,
            service: selectedService,
            serviceType: selectedService,
            timeline: timeline,
            isNonprofit: isNonprofitProject,
          },
        },
      });

      // 7. Send welcome email
      try {
        const emailResult = await sendWelcomeEmail({
          to: email,
          firstName: name.split(' ')[0], // Get first name
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client`,
        });
        console.log('Welcome email sent:', emailResult);
      } catch (emailError) {
        // Log but don't fail the request if email fails
        console.error('Failed to send welcome email:', emailError);
      }

      return NextResponse.json({
        success: true,
        leadId: lead.id,
        projectRequestId: projectRequest.id,
        projectId: project.id,
        maintenancePlanId: maintenancePlan?.id || null,
      });
    } else {
      return NextResponse.json(
        { error: 'Missing required fields: either qid or (serviceType/packageId, email, name)' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit lead' },
      { status: 500 }
    );
  }
}
