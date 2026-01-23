'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout'
import { Card, Button } from '@/components/ui'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [result, setResult] = useState<{
    success: boolean
    balance?: number
    coinsAdded?: number
    error?: string
  } | null>(null)

  // 결제 후 이동할 URL
  const redirectUrl = searchParams.get('redirect')

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentType = searchParams.get('paymentType')
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')

      // 카카오페이 결제: 이미 approve 단계에서 코인 충전 완료됨
      if (paymentType === 'kakaopay') {
        const coins = searchParams.get('coins')
        const balance = searchParams.get('balance')

        setResult({
          success: true,
          balance: balance ? parseInt(balance) : 0,
          coinsAdded: coins ? parseInt(coins) : 0,
        })
        setIsProcessing(false)
        return
      }

      // 토스페이먼츠 결제
      if (!paymentKey || !orderId || !amount) {
        setResult({ success: false, error: '결제 정보가 올바르지 않습니다.' })
        setIsProcessing(false)
        return
      }

      try {
        const response = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount),
          }),
        })

        const data = await response.json()

        if (data.success) {
          setResult({
            success: true,
            balance: data.data.balance,
            coinsAdded: data.data.coinsAdded,
          })
        } else {
          setResult({
            success: false,
            error: data.error?.message || '결제 처리에 실패했습니다.',
          })
        }
      } catch {
        setResult({
          success: false,
          error: '서버 연결에 실패했습니다.',
        })
      } finally {
        setIsProcessing(false)
      }
    }

    confirmPayment()
  }, [searchParams])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Image
            src="/images/brand-character.webp"
            alt=""
            width={72}
            height={72}
            className="h-[72px] w-auto mx-auto mb-4 animate-bounce"
          />
          <p className="text-body text-text-muted">결제를 처리하고 있어요...</p>
        </div>
      </div>
    )
  }

  if (!result?.success) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack backHref="/coin" title="결제 실패" />
        <main className="px-4 py-8 max-w-lg mx-auto text-center">
          <div className="text-6xl mb-4">😿</div>
          <h2 className="text-heading font-semibold text-text mb-2">
            결제에 실패했어요
          </h2>
          <p className="text-body text-text-muted mb-6">
            {result?.error || '다시 시도해주세요.'}
          </p>
          <Link href="/coin">
            <Button>다시 충전하기</Button>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-8 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-heading font-semibold text-text mb-2">
            결제가 완료되었어요!
          </h2>
        </div>

        <Card variant="highlighted" className="mb-6">
          <div className="text-center">
            <p className="text-small text-text-muted mb-2">충전된 코인</p>
            <p className="text-display font-bold text-primary mb-4">
              +{result.coinsAdded} 코인
            </p>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-small text-text-muted">현재 보유 코인</p>
              <p className="text-heading font-bold text-text">
                {result.balance} 코인
              </p>
            </div>
          </div>
        </Card>

        <div>
          {redirectUrl ? (
            <Button fullWidth onClick={() => router.push(redirectUrl)}>
              사주 결과 보러가기
            </Button>
          ) : (
            <Link href="/home" className="block">
              <Button fullWidth>사주 보러가기</Button>
            </Link>
          )}
          <Link href="/mypage" className="block mt-2">
            <Button variant="secondary" fullWidth>마이페이지</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Image
            src="/images/brand-character.webp"
            alt=""
            width={72}
            height={72}
            className="h-[72px] w-auto mx-auto mb-4 animate-bounce"
          />
            <p className="text-body text-text-muted">로딩 중...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
