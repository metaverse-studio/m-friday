'use client'

import type { ComponentType } from 'react'
import type { IntentId } from '@/lib/intents/types'
import { useSession } from '@/lib/session'

import { CashFlowWidget } from './CashFlowWidget'
import { ObligationWidget } from './ObligationWidget'
import { PeriodCompareWidget } from './PeriodCompareWidget'
import { TxnHistoryWidget } from './TxnHistoryWidget'

import { ApprovalWidget } from './ApprovalWidget'
import { FraudAlertWidget } from './FraudAlertWidget'
import { RecentActionsWidget } from './RecentActionsWidget'
import { TradeFinanceWidget } from './TradeFinanceWidget'

import { CctgWidget } from './CctgWidget'
import { FxForwardWidget } from './FxForwardWidget'
import { LoanWidget } from './LoanWidget'

import { HotlineWidget } from './HotlineWidget'
import { SessionSummaryWidget } from './SessionSummaryWidget'
import { UnknownWidget } from './UnknownWidget'

type WidgetIntentId = Exclude<IntentId, 'FIDO_LOGIN' | 'GREETING'>

const WIDGETS: Record<WidgetIntentId, ComponentType<{ intent?: IntentId }>> = {
  CASH_FLOW: CashFlowWidget,
  OBLIGATION_CALENDAR: ObligationWidget,
  PERIOD_COMPARE: PeriodCompareWidget,
  TXN_HISTORY: TxnHistoryWidget,
  RECENT_ACTIONS: RecentActionsWidget,
  TRADE_FINANCE: TradeFinanceWidget,
  FRAUD_ALERT: FraudAlertWidget,
  APPROVE_FIDO: ApprovalWidget,
  REJECT_ORDER: ApprovalWidget,
  SUGGEST_CCTG: CctgWidget,
  FX_FORWARD: FxForwardWidget,
  LOAN_BALANCE: LoanWidget,
  CALL_HOTLINE: HotlineWidget,
  SESSION_SUMMARY: SessionSummaryWidget,
  UNKNOWN: UnknownWidget,
}

export function WidgetHost() {
  const activeIntent = useSession((s) => s.activeIntent)
  if (!activeIntent || activeIntent === 'GREETING' || activeIntent === 'FIDO_LOGIN') {
    return null
  }

  const Widget = WIDGETS[activeIntent]
  return <Widget intent={activeIntent} />
}
