'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { useAuth } from '@/hooks'
import type { CoinPackage } from '@/app/api/coin/packages/route'

export default function CoinPage() {
  const router = useRouter()
  const { user, loading: authLoading, isConfigured } = useAuth()
  const [packages, setPackages] = useState<CoinPackage[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user && isConfigured) {
      router.push('/auth/login?redirect=/coin')
    }
  }, [authLoading, user, isConfigured, router])

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
    if (!selectedPackage || !user) return

    try {
      // 1. 결제 초기화 API 호출
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: selectedPackage }),
      })

      const data = await response.json()

      if (!data.success) {
        alert(data.error?.message || '결제 초기화에 실패했습니다.')
        return
      }

      const { orderId, amount, orderName } = data.data

      // 2. 토스페이먼츠 결제창 호출
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY

      if (!clientKey) {
        // 테스트 모드: 결제 성공 페이지로 직접 이동
        alert('테스트 모드: 실제 결제 없이 충전됩니다.')
        window.location.href = `/payment/success?paymentKey=test_${Date.now()}&orderId=${orderId}&amount=${amount}`
        return
      }

      // 토스페이먼츠 SDK 동적 로드
      const { loadTossPayments } = await import('@tosspayments/payment-sdk')
      const tossPayments = await loadTossPayments(clientKey)

      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        customerEmail: user.email,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      })
    } catch (error) {
      console.error('Payment error:', error)
      alert('결제 중 오류가 발생했습니다.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐱</div>
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
            <li>• 결과 공유하면 1 코인 적립 (월 1회)</li>
            <li>• 충전한 코인은 환불되지 않아요</li>
          </ul>
        </div>

        {/* 패키지 선택 */}
        <div>
          <h3 className="text-subheading font-semibold text-text mb-4">
            충전 패키지 선택
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg, index) => (
                <button
                  key={pkg.id}
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

        {/* 결제 버튼 */}
        <div className="sticky bottom-4">
          <Button
            fullWidth
            size="lg"
            disabled={!selectedPackage}
            onClick={handlePurchase}
          >
            {selectedPackage
              ? `${formatPrice(packages.find(p => p.id === selectedPackage)?.price || 0)}원 결제하기`
              : '패키지를 선택해주세요'
            }
          </Button>
        </div>

        {/* 결제 수단 안내 */}
        <p className="text-center text-caption text-text-light">
          카드, 카카오페이, 토스페이 결제 가능
        </p>
      </main>
    </div>
  )
}
