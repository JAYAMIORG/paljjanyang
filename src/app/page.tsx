'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-12 text-center">
        {/* 배경 이미지 */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{ backgroundImage: "url('/images/main-bg-4.png')" }}
        />
        <div className="relative max-w-[500px] mx-auto">
          {/* 로고 */}
          <div className="mb-8 w-full flex justify-center">
            <Image
              src="/images/logo.png"
              alt="팔자냥"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto"
              priority
            />
          </div>
          <div className="mb-2 w-full flex justify-center pl-[20px]">
            <Image
              src="/images/main-desc-1.png"
              alt="요즘 다들 이걸로 사주 본대"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto"
            />
          </div>
          <p className="text-body text-text-muted mb-8">
            만세력 기반 정통 사주 분석
          </p>

          {/* CTA 버튼 */}
          <Link href="/home" className="block w-full">
            <Button variant="cartoon" size="lg" fullWidth>
              🔮 내 사주 보러가기
            </Button>
          </Link>
        </div>
      </section>

      {/* 소셜 프루프 */}
      <section className="py-8 px-6 bg-primary/5">
        <div className="max-w-[500px] mx-auto text-center">
          <p className="text-body text-text-muted">
            벌써 <span className="font-bold text-primary">10,000+</span>명이 함께했어요
          </p>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-12 px-6">
        <div className="max-w-[500px] mx-auto">
          <h2 className="text-heading font-semibold text-text text-center mb-8">
            왜 팔자냥일까요?
          </h2>

          <div className="space-y-6">
            <FeatureCard
              icon="📚"
              title="만세력 기반 정통 분석"
              description="전통 명리학에 기반한 정확한 사주팔자 계산"
            />
            <FeatureCard
              icon="👨‍🏫"
              title="전문가 맞춤 해석"
              description="당신만을 위한 개인화된 상세 해석 제공"
            />
            <FeatureCard
              icon="🎯"
              title="쉽고 명확한 결과"
              description="어려운 사주 용어 없이 누구나 이해할 수 있는 설명"
            />
            <FeatureCard
              icon="💕"
              title="다양한 운세"
              description="개인 사주, 신년운세, 궁합, 연애운까지"
            />
          </div>
        </div>
      </section>

      {/* 서비스 미리보기 */}
      <section className="py-12 px-6 bg-background-cream">
        <div className="max-w-[500px] mx-auto text-center">
          <h2 className="text-heading font-semibold text-text mb-4">
            이런 것들을 알 수 있어요
          </h2>
          <p className="text-body text-text-muted mb-8">
            사주팔자로 나의 타고난 기질과 운명의 흐름을 확인하세요
          </p>

          <div className="grid grid-cols-2 gap-4 text-left">
            <ServiceItem icon="🌟" text="성격과 기질" />
            <ServiceItem icon="💎" text="타고난 재능" />
            <ServiceItem icon="📈" text="대운 흐름" />
            <ServiceItem icon="💼" text="적성과 진로" />
            <ServiceItem icon="💑" text="연애와 결혼" />
            <ServiceItem icon="🍀" text="올해의 운세" />
          </div>
        </div>
      </section>

      {/* 후기 섹션 */}
      <section className="py-12 px-6">
        <div className="max-w-[500px] mx-auto">
          <h2 className="text-heading font-semibold text-text text-center mb-8">
            이용 후기
          </h2>

          <div className="space-y-4">
            <ReviewCard
              text="신기하게 제 성격이랑 너무 맞아서 소름돋았어요"
              author="김**"
              rating={5}
            />
            <ReviewCard
              text="대운 흐름 보고 올해 계획 세우는데 도움이 됐어요"
              author="이**"
              rating={5}
            />
            <ReviewCard
              text="친구들이랑 궁합 보면서 재밌게 놀았어요 ㅋㅋ"
              author="박**"
              rating={4}
            />
          </div>
        </div>
      </section>

      {/* 최종 CTA */}
      <section className="py-16 px-6 bg-gradient-to-b from-primary/5 to-primary/10">
        <div className="max-w-[500px] mx-auto text-center">
          <span className="text-5xl mb-4 block">🐱✨</span>
          <h2 className="text-heading font-semibold text-text mb-2">
            지금 바로 시작하세요
          </h2>
          <p className="text-body text-text-muted mb-8">
            나의 사주팔자가 궁금하다면
          </p>

          <Link href="/home" className="block w-full">
            <Button variant="cartoon" size="lg" fullWidth>
              🔮 내 사주 보러가기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-[500px] mx-auto">
          <div className="text-caption text-text-light space-y-1 mb-4">
            <p className="font-medium text-text-muted">ChartIQ</p>
            <p>대표자: 박재호 | 사업자등록번호: 794-29-01712</p>
            <p>주소: 경기도 화성시 동탄지성로 295</p>
            <p>전화: 010-5148-4187</p>
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Link href="/terms" className="text-caption text-text-light hover:text-text-muted transition-colors">이용약관</Link>
            <Link href="/privacy" className="text-caption text-text-light hover:text-text-muted transition-colors">개인정보처리방침</Link>
            <Link href="/refund" className="text-caption text-text-light hover:text-text-muted transition-colors">환불정책</Link>
          </div>
          <p className="text-caption text-text-light mt-4">
            © {new Date().getFullYear()} ChartIQ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-card shadow-card">
      <span className="text-3xl flex-shrink-0">{icon}</span>
      <div>
        <h3 className="text-body font-semibold text-text mb-1">{title}</h3>
        <p className="text-small text-text-muted">{description}</p>
      </div>
    </div>
  )
}

function ServiceItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
      <span className="text-xl">{icon}</span>
      <span className="text-small text-text">{text}</span>
    </div>
  )
}

function ReviewCard({
  text,
  author,
  rating,
}: {
  text: string
  author: string
  rating: number
}) {
  return (
    <div className="p-4 bg-white rounded-card shadow-card">
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < rating ? 'text-accent' : 'text-gray-200'}>
            ★
          </span>
        ))}
      </div>
      <p className="text-body text-text mb-2">&ldquo;{text}&rdquo;</p>
      <p className="text-small text-text-muted">{author}</p>
    </div>
  )
}
