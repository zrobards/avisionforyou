import { buildPageMetadata } from '@/lib/metadata'
import ContactClient from './ContactClient'

export const metadata = buildPageMetadata(
  'Contact Us | A Vision For You Recovery',
  'Get in touch with A Vision For You Inc. Call (502) 749-6344 or visit us at 1675 Story Ave, Louisville, KY 40206. Mon-Fri 8am-6pm.'
)

export default function ContactPage() {
  return <ContactClient />
}
