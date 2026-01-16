'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui'

function PaymentFailContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message')

  const getErrorDescription = (code: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '결제가 취소되었어요.'
      case 'PAY_PROCESS_ABORTED':
        return '결제가 중단되었어요.'
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 결제를 거절했어요.'
      default:
        return errorMessage || '결제 중 오류가 발생했어요.'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack backHref="/coin" title="결제 실패" />
      <main className="px-4 py-8 max-w-lg mx-auto text-center">
        <div className="text-6xl mb-4">😿</div>
        <h2 className="text-heading font-semibold text-text mb-2">
          결제에 실패했어요
        </h2>
        <p className="text-body text-text-muted mb-6">
          {getErrorDescription(errorCode)}
        </p>
        <div className="space-y-3">
          <Link href="/coin">
            <Button fullWidth>다시 충전하기</Button>
          </Link>
          <Link href="/home">
            <Button variant="secondary" fullWidth>홈으로</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🐱</div>
            <p className="text-body text-text-muted">로딩 중...</p>
          </div>
        </div>
      }
    >
      <PaymentFailContent />
    </Suspense>
  )
}
