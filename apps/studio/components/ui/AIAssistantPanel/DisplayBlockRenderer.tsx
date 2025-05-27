import React, { useState, useMemo, DragEvent, PropsWithChildren } from 'react'
import { useRouter } from 'next/router'

import { QueryBlock, DEFAULT_CHART_CONFIG } from '../QueryBlock/QueryBlock'
import { ChartConfig } from 'components/interfaces/SQLEditor/UtilityPanel/ChartConfig'
import { useAiAssistantStateSnapshot } from 'state/ai-assistant-state'
import { findResultForManualId } from './Message.utils'
import { useCheckPermissions } from 'hooks/misc/useCheckPermissions'
import { useProfile } from 'lib/profile'
import { useSendEventMutation } from 'data/telemetry/send-event-mutation'
import { PermissionAction } from '@supabase/shared-types/out/constants'
import { identifyQueryType } from './AIAssistant.utils'
import { useParams } from 'common/hooks'
import { useSelectedOrganization } from 'hooks/misc/useSelectedOrganization'
import { Message } from 'ai/react'
import { Badge } from 'ui'

interface DisplayBlockRendererProps {
  messageId: string
  toolCallId: string
  manualId?: string
  initialArgs: {
    sql: string
    label?: string
    view?: 'table' | 'chart'
    xAxis?: string
    yAxis?: string
    runQuery?: boolean
  }
  messageParts: Readonly<Message['parts']> | undefined
  isLoading: boolean
  onResults: (args: { messageId: string; resultId?: string; results: any[] }) => void
}

export const DisplayBlockRenderer = ({
  messageId,
  toolCallId,
  manualId,
  initialArgs,
  messageParts,
  isLoading,
  onResults,
}: PropsWithChildren<DisplayBlockRendererProps>) => {
  // --- Hooks ---
  const snap = useAiAssistantStateSnapshot()
  const router = useRouter()
  const { profile } = useProfile()
  const { mutate: sendEvent } = useSendEventMutation()
  const canCreateSQLSnippet = useCheckPermissions(PermissionAction.CREATE, 'user_content', {
    resource: { type: 'sql', owner_id: profile?.id },
    subject: { id: profile?.id },
  })
  const { ref } = useParams()
  const org = useSelectedOrganization()

  console.log('initialArgs', initialArgs)

  const [chartConfig, setChartConfig] = useState<ChartConfig>(() => ({
    ...DEFAULT_CHART_CONFIG,
    view: initialArgs.view === 'chart' ? 'chart' : 'table',
    xKey: initialArgs.xAxis ?? '',
    yKey: initialArgs.yAxis ?? '',
  }))

  const isChart = initialArgs.view === 'chart'
  const resultId = manualId || toolCallId
  const liveResultData = useMemo(
    () => (manualId ? findResultForManualId(messageParts, manualId) : undefined),
    [messageParts, manualId]
  )
  const cachedResults = useMemo(
    () => snap.getCachedSQLResults({ messageId, snippetId: resultId }),
    [snap, messageId, resultId]
  )
  const displayData = liveResultData ?? cachedResults
  const isDraggableToReports = canCreateSQLSnippet && router.pathname.endsWith('/reports/[id]')
  const label = initialArgs.label || 'SQL Results'
  const sqlQuery = initialArgs.sql

  // --- Handlers ---
  const handleRunQuery = (queryType: 'select' | 'mutation') => {
    sendEvent({
      action: 'assistant_suggestion_run_query_clicked',
      properties: {
        queryType,
        ...(queryType === 'mutation' ? { category: identifyQueryType(sqlQuery) ?? 'unknown' } : {}),
      },
      groups: {
        project: ref ?? 'Unknown',
        organization: org?.slug ?? 'Unknown',
      },
    })
  }

  const handleUpdateChartConfig = ({
    chartConfig: updatedValues,
  }: {
    chartConfig: Partial<ChartConfig>
  }) => {
    setChartConfig((prev) => ({ ...prev, ...updatedValues }))
  }

  const handleDragStart = (e: DragEvent<Element>) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ label, sql: sqlQuery, config: chartConfig })
    )
  }

  return (
    <div className="w-auto -ml-[36px] overflow-x-hidden">
      <QueryBlock
        label={label}
        sql={sqlQuery}
        lockColumns={true}
        showSql={!isChart}
        results={displayData}
        chartConfig={chartConfig}
        isChart={isChart}
        showRunButtonIfNotReadOnly={true}
        isLoading={isLoading}
        draggable={isDraggableToReports}
        runQuery={initialArgs.runQuery === true && !displayData && !manualId}
        tooltip={
          isDraggableToReports ? (
            <div className="flex items-center gap-x-2">
              <Badge variant="success" className="text-xs rounded px-1">
                NEW
              </Badge>
              <p>Drag to add this chart into your custom report</p>
            </div>
          ) : undefined
        }
        onResults={(results) => onResults({ messageId, resultId, results })}
        onRunQuery={handleRunQuery}
        onUpdateChartConfig={handleUpdateChartConfig}
        onDragStart={handleDragStart}
      />
    </div>
  )
}
