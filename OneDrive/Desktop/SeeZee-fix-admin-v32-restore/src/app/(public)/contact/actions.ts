'use server'

import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  company: z.string().optional(),
  projectType: z.string().min(1, 'Please select a project type'),
  budget: z.string().min(1, 'Please select a budget range'),
  message: z.string().min(10, 'Please provide more details about your project'),
})

type LeadFormState = {
  success: boolean
  error: string
  message: string
}

export async function createLead(
  prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  try {
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string || '',
      projectType: formData.get('projectType') as string,
      budget: formData.get('budget') as string,
      message: formData.get('message') as string,
    }

    const validatedData = leadSchema.parse(data)

    // Save to database
    const lead = await prisma.lead.create({
      data: {
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.email,
        company: validatedData.company || null,
        message: `Project Type: ${validatedData.projectType}\nBudget: ${validatedData.budget}\n\n${validatedData.message}`,
        status: 'NEW'
      }
    })

    // Notify all admins about new lead
    const { createNewLeadNotification } = await import("@/lib/notifications");
    await createNewLeadNotification(
      lead.id,
      lead.name,
      lead.email,
      lead.company,
      "Contact Form"
    ).catch(err => console.error("Failed to create lead notification:", err));

    return {
      success: true,
      error: '',
      message: 'Thanks for reaching out! We\'ll get back to you within 24 hours.'
    }
  } catch (error) {
    console.error('Error creating lead:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
        message: ''
      }
    }

    return {
      success: false,
      error: 'Something went wrong. Please try again.',
      message: ''
    }
  }
}