import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendWelcomeEmail } from '@/lib/mailer';
import { mapBudgetToTier } from '@/lib/budget-mapping';

import { LeadStatus, ProjectStatus, BudgetTier } from '@prisma/client';

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
    const { serviceType, email, name, phone, company, projectGoals, budget, timeline, nonprofitStatus, nonprofitEIN, attachments } = body;
    
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
          userId: user.id,
          title: `${selectedPackage} Package Request`,
          description: `Package: ${selectedPackage}\nFeatures: ${selectedFeatures?.length || 0} selected\nTotal: $${totals?.total || 0}\nTimeline: ${answers?.timeline || 'Not specified'}`,
          contactEmail: user.email!,
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

      // 1. Find or create organization for the user
      let organization = await prisma.organization.findFirst({
        where: {
          members: {
            some: {
              userId: user.id
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
                userId: user.id,
                role: 'OWNER'
              }
            }
          }
        });
      }

      // 2. Create lead record from form data
      const lead = await prisma.lead.create({
        data: {
          name: name,
          email: email,
          phone: phone || null,
          company: company || null,
          organizationId: organization.id, // Link to organization
          message: `Project Goals: ${projectGoals || 'Not specified'}\n\nTimeline: ${timeline || 'Not specified'}\n\nBudget: ${budget || 'Not specified'}\n\nSpecial Requirements: ${specialRequirements || 'None'}${nonprofitStatus ? `\n\nNonprofit Status: ${nonprofitStatus}` : ''}${nonprofitEIN ? `\n\nEIN: ${nonprofitEIN}` : ''}`,
          source: referralSource || 'Service Selection',
          status: LeadStatus.NEW,
          serviceType: selectedService, // ServiceCategory enum value (BUSINESS_WEBSITE, etc.)
          metadata: {
            userId: user?.id,
            budget: budget || null,
            attachments: attachments || null,
            referralSource: referralSource || null,
            stage: stage || null,
            outreachProgram: outreachProgram || null,
            projectType: projectType || null,
            projectGoals: projectGoals || null,
            timeline: timeline || null,
            specialRequirements: specialRequirements || null,
            nonprofitStatus: nonprofitStatus || null,
            nonprofitEIN: nonprofitEIN || null,
          },
        },
      });

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

      // 3. Create ProjectRequest so it appears in client dashboard
      const projectRequest = await prisma.projectRequest.create({
        data: {
          userId: user!.id, // user is guaranteed to exist by this point
          title: projectGoals || `${selectedService} Service Request`,
          description: `Project Goals: ${projectGoals || 'Not specified'}\n\nTimeline: ${timeline || 'Not specified'}\n\nBudget: ${budget || 'Not specified'}\n\nSpecial Requirements: ${specialRequirements || 'None'}${nonprofitStatus ? `\n\nNonprofit Status: ${nonprofitStatus}` : ''}${nonprofitEIN ? `\n\nEIN: ${nonprofitEIN}` : ''}`,
          contactEmail: email,
          company: company || null,
          budget: mapBudgetToTier(budget),
          timeline: timeline || null,
          services: services as any,
          status: 'SUBMITTED',
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
          name: `${name}'s Project`,
          description: `${selectedService} service project. Goals: ${projectGoals || 'Not specified'}`,
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
      if (user) {
        await prisma.activity.create({
          data: {
            type: 'PROJECT_CREATED',
            title: 'New Project Created', // Added title which is required
            description: `New project inquiry from ${name}`,
            userId: user.id,
            metadata: {
              projectId: project.id,
              service: selectedService,
              serviceType: selectedService,
              timeline: timeline,
              isNonprofit: isNonprofitProject,
            },
          },
        });
      }

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
        projectId: project.id
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
