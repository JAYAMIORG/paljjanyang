'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header, Footer } from '@/components/layout'
import { Card, Button, LoadingScreen, LoadingCard, ErrorCard, EmptyState, ConfirmDialog, AlertDialog, TrashIcon, ChevronRightIcon } from '@/components/ui'
import { useAuth } from '@/hooks'
import type { ReadingHistoryItem } from '@/app/api/saju/history/route'

const TYPE_LABELS: Record<string, string> = {
  personal: '개인 사주',
  yearly: '신년운세',
  compatibility: '궁합',
  love: '연애운',
  daily: '오늘의 운세',
}

const TYPE_ICONS: Record<string, string> = {
  personal: '🔮',
  yearly: '🌅',
  compatibility: '💕',
  love: '💝',
  daily: '☀️',
}

const STATUS_LABELS: Record<string, string> = {
  processing: '분석 중',
  completed: '완료',
  failed: '실패',
}

export default function MyPage() {
  const router = useRouter()
  const { user, loading: authLoading, isConfigured } = useAuth()
  const [readings, setReadings] = useState<ReadingHistoryItem[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 모달 상태
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  // 삭제 확인 모달 열기
  const openDeleteConfirm = (id: string) => {
    setDeleteConfirmId(id)
  }

  // 기록 삭제 실행
  const handleDelete = async () => {
    if (!deleteConfirmId) return

    const id = deleteConfirmId
    setDeleteConfirmId(null)
    setDeletingId(id)

    try {
      const response = await fetch(`/api/saju/history/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        setReadings(readings.filter(r => r.id !== id))
      } else {
        setAlertMessage(data.error?.message || '삭제에 실패했습니다.')
      }
    } catch {
      setAlertMessage('서버 연결에 실패했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    if (!authLoading && !user && isConfigured) {
      router.push('/auth/login?redirect=/mypage')
    }
  }, [authLoading, user, isConfigured, router])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // 기록과 잔액을 병렬로 조회
        const [historyRes, balanceRes] = await Promise.all([
          fetch('/api/saju/history'),
          fetch('/api/coin/balance'),
        ])

        const [historyData, balanceData] = await Promise.all([
          historyRes.json(),
          balanceRes.json(),
        ])

        if (historyData.success) {
          setReadings(historyData.data.readings)
        } else {
          setError(historyData.error?.message || '기록을 불러올 수 없습니다.')
        }

        if (balanceData.success) {
          setBalance(balanceData.data.balance)
        }
      } catch {
        setError('서버 연결에 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (authLoading || (!user && isConfigured)) {
    return <LoadingScreen message="로딩 중..." />
  }

  // Supabase 미설정 시
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack useHistoryBack title="마이페이지" hideMyPageLink />
        <main className="px-4 py-8 max-w-lg mx-auto text-center">
          <div className="text-6xl mb-4" aria-hidden="true">🔧</div>
          <h2 className="text-heading font-semibold text-text mb-2">
            서비스 준비 중
          </h2>
          <p className="text-body text-text-muted">
            곧 마이페이지 기능이 제공될 예정이에요.
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showBack useHistoryBack title="마이페이지" hideMyPageLink />

      <main className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-6 flex-1 w-full">
        {/* 프로필 섹션 */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <Image
                src="/images/brand-character.webp"
                alt=""
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <div>
              <h2 className="text-subheading font-semibold text-text">
                {user?.email?.split('@')[0] || '팔자냥 회원'}
              </h2>
              <p className="text-small text-text-muted">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* 코인 잔액 */}
        <Card variant="highlighted">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-small text-text-muted">보유 코인</p>
              <p className="text-heading font-bold text-primary">
                {balance !== null ? balance : '-'} 코인
              </p>
            </div>
            <Link href="/coin">
              <Button size="sm">충전하기</Button>
            </Link>
          </div>
        </Card>

        {/* 사주 기록 */}
        <div>
          <h3 className="text-subheading font-semibold text-text mb-4">
            내 사주 기록
          </h3>

          {isLoading ? (
            <LoadingCard message="기록을 불러오는 중..." />
          ) : error ? (
            <ErrorCard message={error} />
          ) : readings.length === 0 ? (
            <EmptyState
              message="아직 저장된 사주가 없어요"
              action={
                <Link href="/home">
                  <Button size="sm">사주 보러가기</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {readings.map((reading) => {
                const isProcessing = reading.status === 'processing'
                const isFailed = reading.status === 'failed'
                // 완료된 분석은 공유 페이지로, processing/failed는 result 페이지로
                const readingUrl = (isProcessing || isFailed)
                  ? `/saju/result?id=${reading.id}&type=${reading.type}`
                  : `/saju/shared/${reading.id}`

                return (
                  <Card
                    key={reading.id}
                    className={`hover:shadow-card-hover transition-shadow ${
                      isProcessing ? 'border-l-4 border-l-amber-400 bg-amber-50/30' :
                      isFailed ? 'border-l-4 border-l-red-400 bg-red-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Link
                        href={readingUrl}
                        className="flex items-start gap-3 flex-1 min-w-0"
                      >
                        <span className="text-2xl" aria-hidden="true">{TYPE_ICONS[reading.type]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-caption bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {TYPE_LABELS[reading.type]}
                            </span>
                            {isProcessing && (
                              <span className="text-caption bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                {STATUS_LABELS.processing}
                              </span>
                            )}
                            {isFailed && (
                              <span className="text-caption bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                {STATUS_LABELS.failed}
                              </span>
                            )}
                            <span className="text-caption text-text-light">
                              {new Date(reading.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <p className="text-body font-medium text-text">
                            {reading.personName} - {reading.birthDate}
                          </p>
                          <p className="text-caption text-text-muted mt-1">
                            {isProcessing ? '탭하여 분석 계속하기' :
                             isFailed ? '탭하여 다시 시도' : '탭하여 상세 보기'}
                          </p>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          openDeleteConfirm(reading.id)
                        }}
                        disabled={deletingId === reading.id}
                        aria-label={`${reading.personName} 기록 삭제`}
                        aria-busy={deletingId === reading.id}
                        className="p-2 text-text-light hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {deletingId === reading.id ? (
                          <span className="text-sm" role="status">삭제 중...</span>
                        ) : (
                          <TrashIcon />
                        )}
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* 메뉴 */}
        <div className="space-y-2">
          <Link href="/terms" className="w-full flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors">
            <span className="text-body text-text">이용약관</span>
            <ChevronRightIcon />
          </Link>
          <Link href="/privacy" className="w-full flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors">
            <span className="text-body text-text">개인정보처리방침</span>
            <ChevronRightIcon />
          </Link>
          <Link href="/refund" className="w-full flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors">
            <span className="text-body text-text">환불 정책</span>
            <ChevronRightIcon />
          </Link>
          <a
            href="mailto:palzza.official@gmail.com?subject=[팔자냥] 문의하기"
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors"
          >
            <span className="text-body text-text">문의하기</span>
            <ChevronRightIcon />
          </a>
        </div>

      </main>

      <Footer />

      {/* 삭제 확인 모달 */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="기록 삭제"
        message="이 기록을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
      />

      {/* 알림 모달 */}
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
