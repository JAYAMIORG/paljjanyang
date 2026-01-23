'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui'

function KakaoPayTestContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const itemName = searchParams.get('itemName')

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : ''

  const handlePayment = () => {
    setIsProcessing(true)
    // 실제 카카오페이처럼 잠시 로딩 후 approve로 이동
    setTimeout(() => {
      router.push(`/api/payment/kakaopay/approve?partner_order_id=${orderId}&pg_token=test_token`)
    }, 1500)
  }

  const handleCancel = () => {
    router.push(`/payment/fail?reason=cancel`)
  }

  if (!orderId || !amount) {
    return (
      <div className="min-h-screen bg-[#FEE500] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
          <p className="text-red-500">잘못된 접근입니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FEE500] flex flex-col">
      {/* Header */}
      <header className="bg-[#3C1E1E] text-white py-4 px-6">
        <div className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.72 1.63 5.12 4.12 6.58L5.5 21l4.13-2.25c.77.15 1.56.25 2.37.25 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
          </svg>
          <span className="font-bold text-lg">카카오페이</span>
          <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded">테스트</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#FEE500] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#3C1E1E">
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.72 1.63 5.12 4.12 6.58L5.5 21l4.13-2.25c.77.15 1.56.25 2.37.25 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">결제 확인</h1>
          </div>

          {/* Payment Info */}
          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500">상품명</span>
              <span className="font-medium text-gray-900">{itemName || '팔자냥 코인'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">결제 금액</span>
              <span className="text-2xl font-bold text-[#3C1E1E]">
                {Number(amount).toLocaleString()}원
              </span>
            </div>
          </div>

          {/* Test Mode Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800 text-center">
              🧪 테스트 모드입니다<br/>
              <span className="text-xs">실제 결제가 이루어지지 않습니다</span>
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] font-bold py-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  결제 처리중...
                </span>
              ) : (
                '결제하기'
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-[#3C1E1E]/60 mt-6 text-center">
          이 페이지는 개발 테스트용입니다.<br/>
          실제 카카오페이 결제 화면과 다를 수 있습니다.
        </p>
      </main>
    </div>
  )
}

export default function KakaoPayTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FEE500] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#3C1E1E] border-t-transparent rounded-full" />
      </div>
    }>
      <KakaoPayTestContent />
    </Suspense>
  )
}
