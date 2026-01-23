'use client'

import { useMemo } from 'react'

interface WuXingRadarChartProps {
  wuXing: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  size?: number
}

const WUXING_COLORS: Record<string, string> = {
  wood: '#7FB069',
  fire: '#FF6B6B',
  earth: '#FFB366',
  metal: '#A8A8A8',
  water: '#4ECDC4',
}

const WUXING_LABELS: Record<string, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
}

// 오행 순서: 목(위) → 화(오른쪽위) → 토(오른쪽아래) → 금(왼쪽아래) → 수(왼쪽위)
const ELEMENTS_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'] as const

export function WuXingRadarChart({ wuXing, size = 200 }: WuXingRadarChartProps) {
  const center = size / 2
  const maxRadius = size * 0.38 // 최대 반경
  const labelRadius = size * 0.48 // 라벨 위치

  // 5개 중 최댓값 계산
  const maxValue = useMemo(() => {
    return Math.max(...ELEMENTS_ORDER.map((el) => wuXing[el]))
  }, [wuXing])

  // 각도 계산 (5개 꼭지점, -90도에서 시작하여 위쪽이 첫 번째)
  const getAngle = (index: number) => {
    return (index * 72 - 90) * (Math.PI / 180)
  }

  // 좌표 계산 (maxValue 기준으로 정규화)
  const getPoint = (index: number, value: number, useMaxValue = true) => {
    const angle = getAngle(index)
    const normalizedValue = useMaxValue ? value / maxValue : value / 100
    const radius = normalizedValue * maxRadius
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }

  // 라벨 좌표 계산
  const getLabelPoint = (index: number) => {
    const angle = getAngle(index)
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    }
  }

  // 배경 오각형 그리드 (5단계)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]

  const gridPaths = useMemo(() => {
    return gridLevels.map((level) => {
      const points = ELEMENTS_ORDER.map((_, i) => {
        const point = getPoint(i, level * 100, false)
        return `${point.x},${point.y}`
      })
      return `M ${points.join(' L ')} Z`
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size])

  // 데이터 영역 경로
  const dataPath = useMemo(() => {
    const points = ELEMENTS_ORDER.map((element, i) => {
      const point = getPoint(i, wuXing[element], true)
      return `${point.x},${point.y}`
    })
    return `M ${points.join(' L ')} Z`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wuXing, size, maxValue])

  // 축 선
  const axisLines = useMemo(() => {
    return ELEMENTS_ORDER.map((_, i) => {
      const point = getPoint(i, 100, false)
      return { x1: center, y1: center, x2: point.x, y2: point.y }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* 배경 그리드 */}
        {gridPaths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={1}
            opacity={0.5}
          />
        ))}

        {/* 축 선 */}
        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#E5E7EB"
            strokeWidth={1}
            opacity={0.5}
          />
        ))}

        {/* 데이터 영역 - 그라데이션 채우기 */}
        <defs>
          <linearGradient id="wuxingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#EC4899" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <path
          d={dataPath}
          fill="url(#wuxingGradient)"
          stroke="#8B5CF6"
          strokeWidth={2}
          opacity={0.8}
        />

        {/* 데이터 포인트 */}
        {ELEMENTS_ORDER.map((element, i) => {
          const point = getPoint(i, wuXing[element], true)
          return (
            <circle
              key={element}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={WUXING_COLORS[element]}
              stroke="white"
              strokeWidth={2}
            />
          )
        })}
      </svg>

      {/* 라벨 */}
      {ELEMENTS_ORDER.map((element, i) => {
        const labelPoint = getLabelPoint(i)
        return (
          <div
            key={element}
            className="absolute flex flex-col items-center"
            style={{
              left: labelPoint.x,
              top: labelPoint.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span
              className="text-caption font-bold"
              style={{ color: WUXING_COLORS[element] }}
            >
              {WUXING_LABELS[element]}
            </span>
            <span className="text-caption text-text-muted">
              {wuXing[element]}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
