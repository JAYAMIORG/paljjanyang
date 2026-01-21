'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout'
import { Button, Card, AlertDialog } from '@/components/ui'
import { useAuth } from '@/hooks'
import type { CoinPackage } from '@/app/api/coin/packages/route'

function PaymentFailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isConfigured } = useAuth()
  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message')
  const reason = searchParams.get('reason')
  const packageId = searchParams.get('packageId')

  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  // 패키지 정보 조회
  useEffect(() => {
    if (!packageId) return

    const fetchPackage = async () => {
      try {
        const response = await fetch('/api/coin/packages')
        const data = await response.json()
        if (data.success) {
          const pkg = data.data.packages.find((p: CoinPackage) => p.id === packageId)
          if (pkg) {
            setSelectedPackage(pkg)
          }
        }
      } catch {
        // 패키지 정보 조회 실패 시 무시
      }
    }

    fetchPackage()
  }, [packageId])

  const getErrorDescription = () => {
    // 카카오페이 취소/실패 처리
    if (reason === 'cancel') {
      return '결제가 취소되었어요.'
    }
    if (reason === 'fail') {
      return '결제가 실패했어요. 다시 시도해주세요.'
    }

    // 토스페이먼츠 에러 코드 처리
    switch (errorCode) {
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

  // 같은 패키지로 재시도
  const handleRetry = () => {
    if (!packageId) {
      router.push('/coin')
      return
    }
    // 패키지 ID를 쿼리 파라미터로 전달하여 코인 페이지로 이동
    router.push(`/coin?selected=${packageId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack backHref="/coin" title="결제 실패" />
      <main className="px-4 py-8 max-w-lg mx-auto text-center space-y-6">
        <div>
          <div className="text-6xl mb-4">😿</div>
          <h2 className="text-heading font-semibold text-text mb-2">
            결제에 실패했어요
          </h2>
          <p className="text-body text-text-muted">
            {getErrorDescription()}
          </p>
        </div>

        {/* 선택했던 패키지 정보 표시 */}
        {selectedPackage && (
          <Card variant="highlighted" className="text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-text-muted">선택한 패키지</p>
                <p className="text-body font-semibold text-text">
                  {selectedPackage.name}
                </p>
                <p className="text-small text-primary">
                  {selectedPackage.coins}코인 / {selectedPackage.price.toLocaleString()}원
                </p>
              </div>
              <span className="text-3xl" aria-hidden="true">🪙</span>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {packageId && user && isConfigured ? (
            <>
              <Button
                fullWidth
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? '처리 중...' : '다시 결제하기'}
              </Button>
              <Link href="/coin">
                <Button variant="secondary" fullWidth>다른 패키지 선택</Button>
              </Link>
            </>
          ) : (
            <Link href="/coin">
              <Button fullWidth>다시 충전하기</Button>
            </Link>
          )}
          <Link href="/home">
            <Button variant="ghost" fullWidth>홈으로</Button>
          </Link>
        </div>

        {/* 도움말 */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-small text-text-light">
            결제 문제가 계속되면 다른 결제 수단을 시도해보세요.
          </p>
        </div>
      </main>

      <AlertDialog
        isOpen={!!alertMessage}
        onClose={() => setAlertMessage(null)}
        title="알림"
        message={alertMessage || ''}
        variant="error"
      />
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
