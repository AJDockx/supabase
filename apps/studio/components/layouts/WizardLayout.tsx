import { useParams } from 'react-router'
import Link from 'next/link'
import { PropsWithChildren } from 'react'

import { useOrganizationsQuery } from 'data/organizations/organizations-query'
import { withAuth } from 'hooks/misc/withAuth'
import { BASE_PATH } from 'lib/constants'
import { ChevronRight } from 'lucide-react'
import type { Organization } from 'types'
import { FeedbackDropdown } from './ProjectLayout/LayoutHeader/FeedbackDropdown'
import HelpPopover from './ProjectLayout/LayoutHeader/HelpPopover'

const WizardLayout = ({ children }: PropsWithChildren<{}>) => {
  const { slug } = useParams()

  const { data: organizations } = useOrganizationsQuery()
  const organization = organizations?.find((o) => o.slug === slug)

  return (
    <div className="flex w-full flex-col">
      <Header organization={organization} />
      <div className="overflow-auto">
        <section className="has-slide-in slide-in relative mx-auto my-10 max-w-2xl">
          {children}
        </section>
      </div>
    </div>
  )
}

export default withAuth(WizardLayout)

export const WizardLayoutWithoutAuth = WizardLayout

interface HeaderProps {
  organization?: Organization
}

const Header = ({ organization }: HeaderProps) => {
  let stepNumber = organization ? 1 : 0
  return (
    <div className="border-b p-3 border-default">
      <div className="PageHeader">
        <div className="Breadcrumbs flex justify-between">
          <div className="flex items-center text-sm">
            <div className="flex items-center space-x-2">
              <Link href="/projects">
                <img
                  src={`${BASE_PATH}/img/supabase-logo.svg`}
                  alt="Supabase"
                  className="rounded border p-1 hover:border-white border-default"
                  style={{ height: 24 }}
                />
              </Link>
              <ChevronRight size="18" className="text-foreground-light" strokeWidth={1} />
              <p className="text-sm">
                {organization ? `Organization: ${organization.name}` : 'Create an organization'}
              </p>
              <ChevronRight size="18" className="text-foreground-light" strokeWidth={1} />
              <p className={`text-sm ${stepNumber < 1 ? 'text-foreground-light' : ''}`}>
                Create a new project
              </p>
              <ChevronRight size="18" className="text-foreground-light" strokeWidth={1} />
              <p className={`text-sm ${stepNumber < 2 ? 'text-foreground-light' : ''}`}>
                Extend your database
              </p>
            </div>
          </div>
          <div className="flex">{/* The End */}</div>
          <div className="flex items-center space-x-2">
            <HelpPopover />
            <FeedbackDropdown />
          </div>
        </div>
      </div>
    </div>
  )
}
