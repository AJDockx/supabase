import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { PermissionAction } from '@supabase/shared-types/out/constants'
import type { ResponseError } from 'types'
import { useOrganizationUpdateMutation } from 'data/organizations/organization-update-mutation'
import { invalidateOrganizationsQuery } from 'data/organizations/organizations-query'
import { useSelectedOrganization } from 'hooks/misc/useSelectedOrganization'
import { useCheckPermissions } from 'hooks/misc/useCheckPermissions'
import { getAiOptInLevel } from 'hooks/misc/useOrgOptedIntoAi'
import { OPT_IN_TAGS } from 'lib/constants'

// Shared schema definition
export const AIOptInSchema = z.object({
  aiOptInLevel: z.enum(['disabled', 'schema', 'schema_and_data'], {
    required_error: 'AI Opt-in level selection is required',
  }),
})

export type AIOptInFormValues = z.infer<typeof AIOptInSchema>

/**
 * Hook to manage the AI Opt-In form state and submission logic.
 * Optionally takes an onSuccess callback (e.g., to close a modal).
 */
export const useAIOptInForm = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient()
  const selectedOrganization = useSelectedOrganization()
  const canUpdateOrganization = useCheckPermissions(PermissionAction.UPDATE, 'organizations')

  const { mutate: updateOrganization, isLoading: isUpdating } = useOrganizationUpdateMutation()

  const form = useForm<AIOptInFormValues>({
    resolver: zodResolver(AIOptInSchema),
    defaultValues: {
      aiOptInLevel: getAiOptInLevel(selectedOrganization?.opt_in_tags),
    },
  })

  const onSubmit = async (values: AIOptInFormValues) => {
    if (!canUpdateOrganization) {
      return toast.error('You do not have the required permissions to update this organization')
    }
    if (!selectedOrganization?.slug) {
      console.error('Organization slug is required')
      return toast.error('Failed to update settings: Organization not found.')
    }

    const existingOptInTags = selectedOrganization?.opt_in_tags ?? []
    let updatedOptInTags = existingOptInTags.filter(
      (tag: string) => tag !== OPT_IN_TAGS.AI_SQL && tag !== (OPT_IN_TAGS.AI_DATA ?? 'AI_DATA')
    )
    if (values.aiOptInLevel === 'schema' || values.aiOptInLevel === 'schema_and_data') {
      updatedOptInTags.push(OPT_IN_TAGS.AI_SQL)
    }
    if (values.aiOptInLevel === 'schema_and_data') {
      updatedOptInTags.push(OPT_IN_TAGS.AI_DATA ?? 'AI_DATA')
    }
    updatedOptInTags = [...new Set(updatedOptInTags)]

    updateOrganization(
      { slug: selectedOrganization.slug, opt_in_tags: updatedOptInTags },
      {
        onSuccess: () => {
          invalidateOrganizationsQuery(queryClient)
          toast.success('Successfully updated AI opt-in settings')
          onSuccessCallback?.() // Call optional callback on success
        },
        onError: (error: ResponseError) => {
          toast.error(`Failed to update settings: ${error.message}`)
        },
      }
    )
  }

  return {
    form,
    onSubmit,
    isUpdating,
    canUpdateOrganization,
    currentOptInLevel: getAiOptInLevel(selectedOrganization?.opt_in_tags),
  }
}
