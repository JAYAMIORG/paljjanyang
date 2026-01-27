'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { useAuth } from '@/hooks'
import type { CoinPackage } from '@/app/api/coin/packages/route'

function CoinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, isConfigured } = useAuth()
  const [packages, setPackages] = useState<CoinPackage[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'카드' | '카카오페이' | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)

  // redirect 파라미터 가져오기 (결제 후 이동할 URL)
  const redirectUrl = searchParams.get('redirect')

  useEffect(() => {
    if (!authLoading && !user && isConfigured) {
      const currentUrl = redirectUrl ? `/coin?redirect=${encodeURIComponent(redirectUrl)}` : '/coin'
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
    }
  }, [authLoading, user, isConfigured, router, redirectUrl])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 패키지 조회
        const packagesRes = await fetch('/api/coin/packages')
        const packagesData = await packagesRes.json()
        if (packagesData.success) {
          setPackages(packagesData.data.packages)
        }

        // 잔액 조회 (로그인된 경우만)
        if (user) {
          const balanceRes = await fetch('/api/coin/balance')
          const balanceData = await balanceRes.json()
          if (balanceData.success) {
            setBalance(balanceData.data.balance)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchData()
    }
  }, [authLoading, user])

  const handlePurchase = async () => {
    if (!selectedPackage || !user || !paymentMethod || isPurchasing) return

    setIsPurchasing(true)

    try {
      // 카카오페이 결제
      if (paymentMethod === '카카오페이') {
        const response = await fetch('/api/payment/kakaopay/ready', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: selectedPackage }),
        })

        const data = await response.json()

        if (!data.success) {
          alert(data.error?.message || '카카오페이 결제 준비에 실패했습니다.')
          setIsPurchasing(false)
          return
        }

        // 카카오페이 결제 페이지로 리다이렉트
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        const kakaoRedirectUrl = isMobile
          ? data.data.next_redirect_mobile_url
          : data.data.next_redirect_pc_url

        window.location.href = kakaoRedirectUrl
        return
      }

      // 토스페이먼츠 결제 (카드, 토스페이, 휴대폰)
      // 1. 결제 초기화 API 호출
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: selectedPackage }),
      })

      const data = await response.json()

      if (!data.success) {
        alert(data.error?.message || '결제 초기화에 실패했습니다.')
        setIsPurchasing(false)
        return
      }

      const { orderId, amount, orderName } = data.data

      // 2. 토스페이먼츠 결제창 호출
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY

      if (!clientKey) {
        alert('결제 설정이 올바르지 않습니다. 관리자에게 문의해주세요.')
        setIsPurchasing(false)
        return
      }

      // 토스페이먼츠 SDK 동적 로드
      const { loadTossPayments } = await import('@tosspayments/payment-sdk')
      const tossPayments = await loadTossPayments(clientKey)

      // redirect 파라미터 포함 URL 생성
      const successUrl = redirectUrl
        ? `${window.location.origin}/payment/success?redirect=${encodeURIComponent(redirectUrl)}`
        : `${window.location.origin}/payment/success`

      await tossPayments.requestPayment(paymentMethod, {
        amount,
        orderId,
        orderName,
        customerEmail: user.email,
        successUrl,
        failUrl: `${window.location.origin}/payment/fail`,
      })
    } catch {
      alert('결제 중 오류가 발생했습니다.')
      setIsPurchasing(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (authLoading) {
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
          <p className="text-body text-text-muted">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack backHref="/home" title="코인 충전" />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* 현재 잔액 */}
        <Card variant="highlighted">
          <div className="text-center">
            <p className="text-small text-text-muted mb-1">현재 보유 코인</p>
            <p className="text-display font-bold text-primary">
              {isLoading ? '-' : balance} <span className="text-heading">코인</span>
            </p>
          </div>
        </Card>

        {/* 안내 */}
        <div className="bg-primary/5 rounded-xl p-4">
          <h3 className="text-body font-semibold text-primary mb-2">
            코인 사용 안내
          </h3>
          <ul className="text-small text-text-muted space-y-1">
            <li>• 사주 1회 분석 = 1 코인</li>
            <li>• 결과 공유하면 1 코인 적립 (최초 1회)</li>
            <li>• 충전한 코인은 환불되지 않아요</li>
          </ul>
        </div>

        {/* 패키지 선택 */}
        <div>
          <h3 id="package-label" className="text-subheading font-semibold text-text mb-4">
            충전 패키지 선택
          </h3>

          {isLoading ? (
            <div className="space-y-3" aria-busy="true" aria-label="패키지 목록 로딩 중">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3" role="radiogroup" aria-labelledby="package-label">
              {packages.map((pkg, index) => (
                <button
                  key={pkg.id}
                  role="radio"
                  aria-checked={selectedPackage === pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all text-left
                    ${selectedPackage === pkg.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-subheading font-bold text-text">
                          {pkg.name}
                        </span>
                        {pkg.bonusCoins > 0 && (
                          <span className="text-caption bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                            +{pkg.bonusCoins} 보너스
                          </span>
                        )}
                        {index === 1 && (
                          <span className="text-caption bg-primary text-white px-2 py-0.5 rounded-full">
                            인기
                          </span>
                        )}
                      </div>
                      {pkg.bonusCoins > 0 && (
                        <p className="text-small text-text-muted mt-1">
                          총 {pkg.totalCoins} 코인 지급
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-heading font-bold text-primary">
                        {formatPrice(pkg.price)}원
                      </p>
                      <p className="text-caption text-text-light">
                        코인당 {formatPrice(Math.round(pkg.price / pkg.totalCoins))}원
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 결제 수단 선택 */}
        <div>
          <h3 id="payment-method-label" className="text-subheading font-semibold text-text mb-4">
            결제 수단 선택
          </h3>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="payment-method-label">
            <button
              role="radio"
              aria-checked={paymentMethod === '카드'}
              onClick={() => setPaymentMethod('카드')}
              className={`
                p-4 rounded-xl border-2 transition-all text-center bg-white
                ${paymentMethod === '카드'
                  ? 'border-primary'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <span className="text-2xl block mb-1" aria-hidden="true">💳</span>
              <span className="text-small font-medium text-text">신용카드</span>
            </button>
            <button
              role="radio"
              aria-checked={paymentMethod === '카카오페이'}
              onClick={() => setPaymentMethod('카카오페이')}
              className={`
                p-4 rounded-xl border-2 transition-all text-center bg-white
                ${paymentMethod === '카카오페이'
                  ? 'border-primary'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <Image
                src="/images/kakaopay.png"
                alt="카카오페이"
                width={32}
                height={32}
                className="mx-auto mb-1"
              />
              <span className="text-small font-medium text-text">카카오페이</span>
            </button>
          </div>
        </div>

        {/* 결제 버튼 */}
        <div className="sticky bottom-4">
          <Button
            fullWidth
            size="lg"
            disabled={!selectedPackage || !paymentMethod || isPurchasing}
            isLoading={isPurchasing}
            onClick={handlePurchase}
          >
            {isPurchasing
              ? '결제 진행 중...'
              : !selectedPackage
                ? '패키지를 선택해주세요'
                : !paymentMethod
                  ? '결제 수단을 선택해주세요'
                  : `${formatPrice(packages.find(p => p.id === selectedPackage)?.price || 0)}원 결제하기`
            }
          </Button>
        </div>
      </main>
    </div>
  )
}

export default function CoinPage() {
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
      <CoinContent />
    </Suspense>
  )
}
