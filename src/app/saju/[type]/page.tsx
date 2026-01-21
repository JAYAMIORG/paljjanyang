'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button, Card, Select, Input, LoadingScreen, AlertDialog } from '@/components/ui'
import { useAuth } from '@/hooks'

interface Person {
  id: string
  name: string
  relationship: string
  birth_year: number
  birth_month: number
  birth_day: number
  birth_hour: number | null
  is_lunar: boolean
  gender: string
  created_at: string
}

const sajuTypeInfo: Record<string, { title: string; icon: string; needsTwoPeople: boolean; skipPreview?: boolean }> = {
  personal: { title: '개인 사주', icon: '🔮', needsTwoPeople: false },
  yearly: { title: '신년운세', icon: '📅', needsTwoPeople: false },
  compatibility: { title: '궁합', icon: '💕', needsTwoPeople: true },
  love: { title: '연애운', icon: '💝', needsTwoPeople: false },
  daily: { title: '오늘의 운세', icon: '☀️', needsTwoPeople: false, skipPreview: true },
}

const relationshipOptions = [
  { value: 'self', label: '본인' },
  { value: 'partner', label: '연인/배우자' },
  { value: 'family', label: '가족' },
  { value: 'friend', label: '친구' },
  { value: 'other', label: '기타' },
]

const currentYear = new Date().getFullYear()

const yearOptions = Array.from({ length: 100 }, (_, i) => ({
  value: currentYear - i,
  label: `${currentYear - i}년`,
}))

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}월`,
}))

// 월과 연도에 따른 최대 일수 계산
function getMaxDaysInMonth(year: number, month: number): number {
  if (!year || !month) return 31
  // month는 1-12, Date에서는 0-11 사용하므로 month를 그대로 전달하면 다음 달의 0일 = 해당 월의 마지막 날
  return new Date(year, month, 0).getDate()
}

function getDayOptions(year: number, month: number) {
  const maxDays = getMaxDaysInMonth(year, month)
  return Array.from({ length: maxDays }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}일`,
  }))
}

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

function getRelationshipLabel(value: string): string {
  const option = relationshipOptions.find(opt => opt.value === value)
  return option?.label || value
}

export default function SajuInputPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading, isConfigured } = useAuth()
  const type = params.type as string
  const info = sajuTypeInfo[type] || sajuTypeInfo.personal

  const [persons, setPersons] = useState<Person[]>([])
  const [isLoadingPersons, setIsLoadingPersons] = useState(true)
  const [showInputForm, setShowInputForm] = useState(false)

  // 궁합용 선택된 인물
  const [selectedPerson1, setSelectedPerson1] = useState<Person | null>(null)
  const [selectedPerson2, setSelectedPerson2] = useState<Person | null>(null)
  const [selectingFor, setSelectingFor] = useState<1 | 2 | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    relationship: 'self',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthHour: '-1',
    isLunar: false,
    gender: '' as 'male' | 'female' | '',
    saveInfo: true, // 정보 저장 여부
  })

  const [isLoading, setIsLoading] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  // 저장된 인물 목록 조회
  useEffect(() => {
    const fetchPersons = async () => {
      if (!isConfigured || !user) {
        setIsLoadingPersons(false)
        setShowInputForm(true)
        return
      }

      try {
        const response = await fetch('/api/persons')
        const data = await response.json()

        if (data.success && data.data) {
          setPersons(data.data)
          // 저장된 인물이 없으면 바로 입력 폼 표시
          if (data.data.length === 0) {
            setShowInputForm(true)
          }
        } else {
          setShowInputForm(true)
        }
      } catch {
        setShowInputForm(true)
      } finally {
        setIsLoadingPersons(false)
      }
    }

    if (!authLoading) {
      fetchPersons()
    }
  }, [user, authLoading, isConfigured])

  const isFormValid =
    formData.birthYear &&
    formData.birthMonth &&
    formData.birthDay &&
    formData.gender &&
    (formData.saveInfo ? formData.name : true)

  // 인물 정보를 URL 파라미터로 변환
  const personToParams = (person: Person) => ({
    year: person.birth_year.toString(),
    month: person.birth_month.toString(),
    day: person.birth_day.toString(),
    hour: (person.birth_hour ?? -1).toString(),
    lunar: person.is_lunar ? '1' : '0',
    gender: person.gender,
  })

  // 폼 데이터를 URL 파라미터로 변환
  const formToParams = () => ({
    year: formData.birthYear,
    month: formData.birthMonth,
    day: formData.birthDay,
    hour: formData.birthHour,
    lunar: formData.isLunar ? '1' : '0',
    gender: formData.gender,
  })

  // 인물 선택 (단일 선택 - 개인사주, 신년운세, 연애운)
  const handleSelectPerson = (person: Person) => {
    if (info.needsTwoPeople) {
      // 궁합인 경우 - 이미 선택된 사람이면 선택 취소
      if (selectedPerson1?.id === person.id) {
        setSelectedPerson1(null)
        return
      }
      if (selectedPerson2?.id === person.id) {
        setSelectedPerson2(null)
        return
      }

      // 새로 선택
      if (selectingFor === 1) {
        setSelectedPerson1(person)
        setSelectingFor(null)
      } else if (selectingFor === 2) {
        setSelectedPerson2(person)
        setSelectingFor(null)
      }
    } else {
      // 단일 선택
      const params = personToParams(person)
      const searchParams = new URLSearchParams({ ...params, type })
      // 오늘의 운세는 preview 스킵하고 바로 결과 페이지로
      const targetPage = info.skipPreview ? '/saju/result' : '/saju/preview'
      router.push(`${targetPage}?${searchParams.toString()}`)
    }
  }

  // 궁합 보기
  const handleCompatibility = () => {
    if (!selectedPerson1 || !selectedPerson2) return

    const params1 = personToParams(selectedPerson1)
    const params2 = personToParams(selectedPerson2)

    const searchParams = new URLSearchParams({
      type: 'compatibility',
      // Person 1
      year: params1.year,
      month: params1.month,
      day: params1.day,
      hour: params1.hour,
      lunar: params1.lunar,
      gender: params1.gender,
      name1: selectedPerson1.name,
      // Person 2
      year2: params2.year,
      month2: params2.month,
      day2: params2.day,
      hour2: params2.hour,
      lunar2: params2.lunar,
      gender2: params2.gender,
      name2: selectedPerson2.name,
    })

    router.push(`/saju/preview?${searchParams.toString()}`)
  }

  // 폼 제출 (새 인물 입력)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)

    try {
      // 정보 저장 옵션이 켜져 있고 로그인 상태면 저장
      if (formData.saveInfo && user && formData.name) {
        const response = await fetch('/api/persons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            relationship: formData.relationship,
            birthYear: parseInt(formData.birthYear),
            birthMonth: parseInt(formData.birthMonth),
            birthDay: parseInt(formData.birthDay),
            birthHour: formData.birthHour === '-1' ? null : parseInt(formData.birthHour),
            isLunar: formData.isLunar,
            gender: formData.gender,
          }),
        })

        const data = await response.json()

        if (data.success && data.data) {
          // 궁합인 경우 선택 처리
          if (info.needsTwoPeople && selectingFor) {
            if (selectingFor === 1) {
              setSelectedPerson1(data.data)
            } else {
              setSelectedPerson2(data.data)
            }
            setPersons([data.data, ...persons])
            setShowInputForm(false)
            setSelectingFor(null)
            setIsLoading(false)
            resetForm()
            return
          }
        }
      }

      // 궁합이 아닌 경우 바로 결과 페이지로
      if (!info.needsTwoPeople) {
        const params = formToParams()
        const searchParams = new URLSearchParams({ ...params, type })
        // 오늘의 운세는 preview 스킵하고 바로 결과 페이지로
        const targetPage = info.skipPreview ? '/saju/result' : '/saju/preview'
        router.push(`${targetPage}?${searchParams.toString()}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      setAlertMessage('오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: 'self',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      birthHour: '-1',
      isLunar: false,
      gender: '',
      saveInfo: true,
    })
  }

  // 로딩 중
  if (authLoading || isLoadingPersons) {
    return <LoadingScreen message="로딩 중..." />
  }

  // 입력 폼 렌더링
  const renderInputForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 이름 및 관계 (저장 시에만) */}
      {user && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-subheading font-semibold text-text">
              정보 저장하기
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.saveInfo}
                onChange={(e) => setFormData({ ...formData, saveInfo: e.target.checked })}
                className="w-4 h-4 text-primary focus:ring-primary rounded"
              />
              <span className="text-small text-text-muted">저장</span>
            </label>
          </div>

          {formData.saveInfo && (
            <div className="space-y-3">
              <Input
                label="이름/별명"
                placeholder="예: 홍길동, 엄마, 남자친구"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={formData.saveInfo}
              />
              <Select
                label="관계"
                options={relationshipOptions}
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              />
            </div>
          )}
        </Card>
      )}

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
            onChange={(e) => {
              const newYear = e.target.value
              const maxDays = getMaxDaysInMonth(
                parseInt(newYear),
                parseInt(formData.birthMonth) || 1
              )
              // 선택된 일이 최대 일수를 초과하면 자동 조정 (윤년 처리)
              const newDay = formData.birthDay && parseInt(formData.birthDay) > maxDays
                ? maxDays.toString()
                : formData.birthDay
              setFormData({ ...formData, birthYear: newYear, birthDay: newDay })
            }}
            required
          />
          <Select
            options={monthOptions}
            placeholder="월"
            value={formData.birthMonth}
            onChange={(e) => {
              const newMonth = e.target.value
              const maxDays = getMaxDaysInMonth(
                parseInt(formData.birthYear) || currentYear,
                parseInt(newMonth)
              )
              // 선택된 일이 최대 일수를 초과하면 자동 조정
              const newDay = formData.birthDay && parseInt(formData.birthDay) > maxDays
                ? maxDays.toString()
                : formData.birthDay
              setFormData({ ...formData, birthMonth: newMonth, birthDay: newDay })
            }}
            required
          />
          <Select
            options={getDayOptions(
              parseInt(formData.birthYear) || currentYear,
              parseInt(formData.birthMonth) || 1
            )}
            placeholder="일"
            value={formData.birthDay}
            onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, birthHour: e.target.value })}
        />
      </Card>

      {/* 성별 */}
      <Card>
        <h3 id="gender-label" className="text-subheading font-semibold text-text mb-4">
          성별 <span className="text-accent-rose">*</span>
        </h3>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="gender-label" aria-required="true">
          <button
            type="button"
            role="radio"
            aria-checked={formData.gender === 'male'}
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
            role="radio"
            aria-checked={formData.gender === 'female'}
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
      <div className="space-y-3">
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={!isFormValid}
          isLoading={isLoading}
        >
          {info.needsTwoPeople && selectingFor
            ? `${selectingFor === 1 ? '첫 번째' : '두 번째'} 사람 등록하기`
            : `${info.icon} 내 만세력 확인하기`
          }
        </Button>

        {persons.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => {
              setShowInputForm(false)
              setSelectingFor(null)
              resetForm()
            }}
          >
            뒤로가기
          </Button>
        )}
      </div>
    </form>
  )

  // 인물 목록 렌더링
  const renderPersonList = () => (
    <div className="space-y-6">
      {/* 궁합인 경우 선택된 인물 표시 */}
      {info.needsTwoPeople && (
        <Card variant="highlighted">
          <h3 className="text-subheading font-semibold text-text mb-4">
            궁합 볼 두 사람을 선택하세요
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* 첫 번째 사람 */}
            <button
              onClick={() => {
                if (selectedPerson1) {
                  // 이미 선택된 경우 선택 취소
                  setSelectedPerson1(null)
                } else {
                  setSelectingFor(1)
                }
              }}
              className={`
                p-4 rounded-xl border-2 text-center transition-all
                ${selectedPerson1
                  ? 'border-primary bg-primary/5'
                  : 'border-dashed border-gray-300 hover:border-primary'
                }
              `}
            >
              {selectedPerson1 ? (
                <>
                  <span className={`text-2xl block mb-1 ${selectedPerson1.gender === 'male' ? 'text-blue-500' : 'text-red-500'}`}>{selectedPerson1.gender === 'male' ? '♂' : '♀'}</span>
                  <p className="font-semibold text-text">{selectedPerson1.name}</p>
                  <p className="text-small text-text-muted">
                    {selectedPerson1.birth_year}.{selectedPerson1.birth_month}.{selectedPerson1.birth_day}
                  </p>
                  <p className="text-xs text-text-muted mt-1">탭하여 취소</p>
                </>
              ) : (
                <>
                  <span className="text-2xl block mb-1 opacity-50">➕</span>
                  <p className="text-text-muted">첫 번째 사람</p>
                </>
              )}
            </button>

            {/* 두 번째 사람 */}
            <button
              onClick={() => {
                if (selectedPerson2) {
                  // 이미 선택된 경우 선택 취소
                  setSelectedPerson2(null)
                } else {
                  setSelectingFor(2)
                }
              }}
              className={`
                p-4 rounded-xl border-2 text-center transition-all
                ${selectedPerson2
                  ? 'border-primary bg-primary/5'
                  : 'border-dashed border-gray-300 hover:border-primary'
                }
              `}
            >
              {selectedPerson2 ? (
                <>
                  <span className={`text-2xl block mb-1 ${selectedPerson2.gender === 'male' ? 'text-blue-500' : 'text-red-500'}`}>{selectedPerson2.gender === 'male' ? '♂' : '♀'}</span>
                  <p className="font-semibold text-text">{selectedPerson2.name}</p>
                  <p className="text-small text-text-muted">
                    {selectedPerson2.birth_year}.{selectedPerson2.birth_month}.{selectedPerson2.birth_day}
                  </p>
                  <p className="text-xs text-text-muted mt-1">탭하여 취소</p>
                </>
              ) : (
                <>
                  <span className="text-2xl block mb-1 opacity-50">➕</span>
                  <p className="text-text-muted">두 번째 사람</p>
                </>
              )}
            </button>
          </div>

          {selectedPerson1 && selectedPerson2 && (
            <Button
              fullWidth
              size="lg"
              className="mt-4"
              onClick={handleCompatibility}
            >
              💕 궁합 보기
            </Button>
          )}
        </Card>
      )}

      {/* 선택 안내 (궁합에서 선택 중일 때) */}
      {info.needsTwoPeople && selectingFor && (
        <div className="text-center py-2">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-small font-medium">
            {selectingFor === 1 ? '첫 번째' : '두 번째'} 사람을 선택하세요
          </span>
        </div>
      )}

      {/* 저장된 인물 목록 */}
      <div>
        <h3 className="text-subheading font-semibold text-text mb-3">
          저장된 사주 정보
        </h3>
        <div className="space-y-3">
          {persons.map((person) => (
            <button
              key={person.id}
              onClick={() => handleSelectPerson(person)}
              className={`
                w-full p-4 rounded-xl border-2 text-left transition-all
                ${(selectedPerson1?.id === person.id || selectedPerson2?.id === person.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-100 bg-white hover:border-primary-light hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text">{person.name}</p>
                  <p className="text-small text-text-muted">
                    {getRelationshipLabel(person.relationship)} · {person.birth_year}.{person.birth_month}.{person.birth_day}
                    {person.is_lunar && ' (음력)'}
                  </p>
                </div>
                <span className={`text-2xl ${person.gender === 'male' ? 'text-blue-500' : 'text-red-500'}`}>
                  {person.gender === 'male' ? '♂' : '♀'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 새 인물 추가 버튼 */}
      <Button
        variant="secondary"
        fullWidth
        onClick={() => {
          setShowInputForm(true)
          if (info.needsTwoPeople && !selectingFor) {
            // 궁합에서 새 인물 추가 시 어디에 추가할지 선택
            setSelectingFor(selectedPerson1 ? 2 : 1)
          }
        }}
      >
        ➕ 새로운 사주 정보 입력하기
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header showBack useHistoryBack title={info.title} />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {showInputForm ? renderInputForm() : renderPersonList()}
      </main>

      {/* 에러 알림 모달 */}
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
