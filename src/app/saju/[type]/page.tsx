'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button, Card, Select } from '@/components/ui'

const sajuTypeInfo: Record<string, { title: string; icon: string }> = {
  personal: { title: '개인 사주', icon: '🔮' },
  yearly: { title: '신년운세', icon: '📅' },
  compatibility: { title: '궁합', icon: '💕' },
  love: { title: '연애운', icon: '💝' },
}

const currentYear = new Date().getFullYear()

const yearOptions = Array.from({ length: 100 }, (_, i) => ({
  value: currentYear - i,
  label: `${currentYear - i}년`,
}))

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}월`,
}))

const dayOptions = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}일`,
}))

const hourOptions = [
  { value: -1, label: '모르겠어요' },
  ...Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i.toString().padStart(2, '0')}시 (${getHourLabel(i)})`,
  })),
]

function getHourLabel(hour: number): string {
  const labels = [
    '자시', '자시', '축시', '축시', '인시', '인시',
    '묘시', '묘시', '진시', '진시', '사시', '사시',
    '오시', '오시', '미시', '미시', '신시', '신시',
    '유시', '유시', '술시', '술시', '해시', '해시',
  ]
  return labels[hour]
}

export default function SajuInputPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as string
  const info = sajuTypeInfo[type] || sajuTypeInfo.personal

  const [formData, setFormData] = useState({
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthHour: '-1',
    isLunar: false,
    gender: '' as 'male' | 'female' | '',
  })

  const [isLoading, setIsLoading] = useState(false)

  const isFormValid =
    formData.birthYear &&
    formData.birthMonth &&
    formData.birthDay &&
    formData.gender

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)

    // URL 파라미터로 전달
    const searchParams = new URLSearchParams({
      year: formData.birthYear,
      month: formData.birthMonth,
      day: formData.birthDay,
      hour: formData.birthHour,
      lunar: formData.isLunar ? '1' : '0',
      gender: formData.gender,
      type,
    })

    router.push(`/saju/preview?${searchParams.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack backHref="/home" title={info.title} />

      <main className="px-4 py-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 생년월일 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              생년월일 <span className="text-accent-rose">*</span>
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Select
                options={yearOptions}
                placeholder="년도"
                value={formData.birthYear}
                onChange={(e) =>
                  setFormData({ ...formData, birthYear: e.target.value })
                }
                required
              />
              <Select
                options={monthOptions}
                placeholder="월"
                value={formData.birthMonth}
                onChange={(e) =>
                  setFormData({ ...formData, birthMonth: e.target.value })
                }
                required
              />
              <Select
                options={dayOptions}
                placeholder="일"
                value={formData.birthDay}
                onChange={(e) =>
                  setFormData({ ...formData, birthDay: e.target.value })
                }
                required
              />
            </div>

            {/* 음력/양력 */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="calendar"
                  checked={!formData.isLunar}
                  onChange={() => setFormData({ ...formData, isLunar: false })}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-body text-text">양력</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="calendar"
                  checked={formData.isLunar}
                  onChange={() => setFormData({ ...formData, isLunar: true })}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-body text-text">음력</span>
              </label>
            </div>
          </Card>

          {/* 태어난 시간 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-2">
              태어난 시간
            </h3>
            <p className="text-small text-text-muted mb-4">
              시간을 모르면 &apos;모르겠어요&apos;를 선택하세요
            </p>
            <Select
              options={hourOptions}
              value={formData.birthHour}
              onChange={(e) =>
                setFormData({ ...formData, birthHour: e.target.value })
              }
            />
          </Card>

          {/* 성별 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              성별 <span className="text-accent-rose">*</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: 'male' })}
                className={`
                  h-12 rounded-button border-2 font-semibold
                  transition-all duration-200
                  ${
                    formData.gender === 'male'
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white text-text hover:border-primary-light'
                  }
                `}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: 'female' })}
                className={`
                  h-12 rounded-button border-2 font-semibold
                  transition-all duration-200
                  ${
                    formData.gender === 'female'
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white text-text hover:border-primary-light'
                  }
                `}
              >
                여성
              </button>
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={!isFormValid}
            isLoading={isLoading}
          >
            {info.icon} 내 만세력 확인하기
          </Button>
        </form>
      </main>
    </div>
  )
}
