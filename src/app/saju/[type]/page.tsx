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
  yearly: { title: '신년운세', icon: '🌅', needsTwoPeople: false },
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
  const [completedPersonIds, setCompletedPersonIds] = useState<Set<string>>(new Set())
  const [processingPersonIds, setProcessingPersonIds] = useState<Set<string>>(new Set())

  // 궁합용 선택된 인물
  const [selectedPerson1, setSelectedPerson1] = useState<Person | null>(null)
  const [selectedPerson2, setSelectedPerson2] = useState<Person | null>(null)
  const [selectingFor, setSelectingFor] = useState<1 | 2 | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    relationship: 'self',
    birthDate: '', // YYYYMMDD 형식으로 저장
    birthTime: '', // HHMM 형식으로 저장 (빈 문자열 = 모름)
    isLunar: false,
    gender: '' as 'male' | 'female' | '',
    saveInfo: true, // 정보 저장 여부
  })

  // 해당 월의 최대 일수 계산
  const getMaxDaysInMonth = (year: number, month: number): number => {
    if (!year || !month) return 31
    return new Date(year, month, 0).getDate()
  }

  // 생년월일 유효성 검사
  const validateBirthDate = (digits: string): boolean => {
    if (digits.length <= 4) return true // 년도만 입력 중

    // 월 검사 (5-6자리)
    if (digits.length >= 5) {
      const month = parseInt(digits.slice(4, 6))
      if (digits.length === 5) {
        // 첫 자리가 0 또는 1만 허용
        if (month > 1 && month < 10) return true // 단일 숫자 월 (1-9)
        if (parseInt(digits[4]) > 1) return false
      }
      if (digits.length >= 6 && (month < 1 || month > 12)) return false
    }

    // 일 검사 (7-8자리)
    if (digits.length >= 7) {
      const year = parseInt(digits.slice(0, 4))
      const month = parseInt(digits.slice(4, 6))
      const maxDays = getMaxDaysInMonth(year, month)
      const day = parseInt(digits.slice(6, 8))

      if (digits.length === 7) {
        // 첫 자리가 최대 일수의 십의 자리보다 크면 안됨
        const firstDigit = parseInt(digits[6])
        const maxFirstDigit = Math.floor(maxDays / 10)
        if (firstDigit > maxFirstDigit && firstDigit > 3) return false
      }
      if (digits.length === 8 && (day < 1 || day > maxDays)) return false
    }

    return true
  }

  // 생년월일 포맷팅 (YYYYMMDD → YYYY-MM-DD)
  const formatBirthDate = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    if (digits.length <= 4) return digits
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
  }

  // 생년월일에서 년/월/일 추출
  const parseBirthDate = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length < 8) return { year: '', month: '', day: '' }
    return {
      year: digits.slice(0, 4),
      month: digits.slice(4, 6),
      day: digits.slice(6, 8),
    }
  }

  // 태어난 시간 포맷팅 (HHMM → HH:MM)
  const formatBirthTime = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}:${digits.slice(2)}`
  }

  // 태어난 시간에서 시/분 추출
  const parseBirthTime = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 0) return { hour: '', minute: '' }
    if (digits.length <= 2) return { hour: digits, minute: '' }
    return {
      hour: digits.slice(0, 2),
      minute: digits.slice(2, 4),
    }
  }

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

  // 해당 type의 분석 완료된 person 목록 조회
  useEffect(() => {
    const fetchCompletedPersons = async () => {
      if (!isConfigured || !user || !type) return

      try {
        const response = await fetch(`/api/saju/completed-persons?type=${type}`)
        const data = await response.json()

        if (data.success && data.data) {
          setCompletedPersonIds(new Set(data.data.completedPersonIds || []))
          setProcessingPersonIds(new Set(data.data.processingPersonIds || []))
        }
      } catch {
        // 에러 시 무시 (뱃지만 안 보임)
      }
    }

    if (!authLoading && user) {
      fetchCompletedPersons()
    }
  }, [user, authLoading, isConfigured, type])

  const { year: birthYear, month: birthMonth, day: birthDay } = parseBirthDate(formData.birthDate)

  const isFormValid =
    birthYear.length === 4 &&
    birthMonth.length === 2 &&
    birthDay.length === 2 &&
    parseInt(birthMonth) >= 1 && parseInt(birthMonth) <= 12 &&
    parseInt(birthDay) >= 1 && parseInt(birthDay) <= 31 &&
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
  const formToParams = () => {
    const { year, month, day } = parseBirthDate(formData.birthDate)
    const { hour } = parseBirthTime(formData.birthTime)
    return {
      year,
      month,
      day,
      hour: hour || '-1',
      lunar: formData.isLunar ? '1' : '0',
      gender: formData.gender,
    }
  }

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
      const searchParams = new URLSearchParams({ ...params, type, name1: person.name })
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
        const { year, month, day } = parseBirthDate(formData.birthDate)
        const { hour } = parseBirthTime(formData.birthTime)
        const response = await fetch('/api/persons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            relationship: formData.relationship,
            birthYear: parseInt(year),
            birthMonth: parseInt(month),
            birthDay: parseInt(day),
            birthHour: hour === '' ? null : parseInt(hour),
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
        const searchParams = new URLSearchParams({
          ...params,
          type,
          ...(formData.name && { name1: formData.name }),
        })
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
      birthDate: '',
      birthTime: '',
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
                required
              />
            </div>
          )}
        </Card>
      )}

      {/* 생년월일 */}
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-2">
          생년월일 <span className="text-accent-rose">*</span>
        </h3>
        <p className="text-small text-text-muted mb-3">
          8자리로 입력하세요
        </p>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="2026-01-01"
          value={formatBirthDate(formData.birthDate)}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
            if (validateBirthDate(digits)) {
              setFormData({ ...formData, birthDate: digits })
            }
          }}
          className="w-full h-12 px-4 border border-gray-200 rounded-lg text-center text-lg tracking-wider bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        />

        {/* 음력/양력 */}
        <div className="flex gap-4 mt-4 justify-center">
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
        <p className="text-small text-text-muted mb-1">
          4자리로 입력하세요 (ex. 0930, 1700)
        </p>
        <p className="text-small text-text-muted mb-3">
          시간을 모르면 비워두세요
        </p>
        <div className="relative">
          <input
            type="tel"
            inputMode="numeric"
            placeholder="14:30"
            value={formatBirthTime(formData.birthTime)}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
              if (digits.length === 0) {
                setFormData({ ...formData, birthTime: '' })
                return
              }
              const hour = parseInt(digits.slice(0, 2))
              const minute = digits.length > 2 ? parseInt(digits.slice(2)) : 0
              if (hour <= 23 && minute <= 59) {
                setFormData({ ...formData, birthTime: digits })
              }
            }}
            className="w-full h-12 px-4 border border-gray-200 rounded-lg text-center text-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {formData.birthTime !== '' && (() => {
            const { hour } = parseBirthTime(formData.birthTime)
            const hourNum = parseInt(hour)
            return !isNaN(hourNum) ? (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                {getHourLabel(hourNum)}
              </span>
            ) : null
          })()}
        </div>
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
                <div className="flex items-center gap-2">
                  {completedPersonIds.has(person.id) && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                      분석 완료
                    </span>
                  )}
                  {processingPersonIds.has(person.id) && !completedPersonIds.has(person.id) && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      분석 중
                    </span>
                  )}
                  <span className={`text-2xl ${person.gender === 'male' ? 'text-blue-500' : 'text-red-500'}`}>
                    {person.gender === 'male' ? '♂' : '♀'}
                  </span>
                </div>
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
