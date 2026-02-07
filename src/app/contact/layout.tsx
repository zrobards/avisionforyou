import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with A Vision For You. Located at 1675 Story Ave, Louisville, KY 40206. Call (502) 749-6344 or email info@avisionforyourecovery.org.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
