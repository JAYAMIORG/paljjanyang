# 팔자냥 TailwindCSS 구현 가이드

> Next.js + TailwindCSS 환경에서 디자인 시스템 적용하기

---

## 1. 프로젝트 초기 설정

### 1.1 Tailwind 설치 및 설정

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 1.2 tailwind.config.js 전체 설정

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 커스텀 폰트
      fontFamily: {
        display: ['var(--font-iru)', 'serif'], // 로고용
        sans: ['var(--font-pretendard)', 'system-ui', '-apple-system'],
        serif: ['var(--font-noto-serif-kr)', 'serif'],
      },

      // 폰트 사이즈
      fontSize: {
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0px' }],
        sm: ['13px', { lineHeight: '18px', letterSpacing: '0.3px' }],
        base: ['14px', { lineHeight: '22px', letterSpacing: '0.3px' }],
        lg: ['16px', { lineHeight: '24px', letterSpacing: '0.3px' }],
        xl: ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
        '2xl': ['20px', { lineHeight: '28px', letterSpacing: '0px' }],
        '3xl': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
        '4xl': ['28px', { lineHeight: '36px', letterSpacing: '0px' }],
        '5xl': ['32px', { lineHeight: '40px', letterSpacing: '0px' }],
        '6xl': ['40px', { lineHeight: '48px', letterSpacing: '0px' }],
      },

      // 커스텀 색상 팔레트
      colors: {
        // Primary Colors (Deep Lavender + Soft Purple)
        purple: {
          50: '#F5F2FF',  // 라이트 배경
          100: '#EBE5FF',
          200: '#D9CCFF',
          300: '#C8B6FF',
          400: '#9B8FB7',  // Soft Purple
          500: '#8B7BA5',
          600: '#7B6B95',
          700: '#6B5B95',  // Deep Lavender (Primary)
          800: '#5A4A84',  // Hover state
          900: '#3D2E5F',
        },

        // Accent Colors (Gold + Rose Gold)
        amber: {
          gold: '#D4AF37', // Gold
          light: '#FFF8E6', // Light gold background
        },
        rose: {
          gold: '#B76E79', // Rose Gold
        },

        // Background Colors
        stone: {
          50: '#F9F7F4',   // Off-White
          100: '#FAF8F3',  // Cream
          white: '#FFFFFF',
        },

        // Text Colors
        gray: {
          deep: '#2C2C2C',   // Deep Charcoal (main text)
          medium: '#6B6B6B', // Medium Gray (secondary)
          light: '#A0A0A0',  // Light Gray (disabled/placeholder)
        },

        // Status Colors
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#FF6B6B',
        info: '#2196F3',

        // Five Elements
        elements: {
          wood: '#7FB069',   // 목
          fire: '#FF6B6B',   // 화
          earth: '#FFB366',  // 토
          metal: '#C0C0C0',  // 금
          water: '#4ECDC4',  // 수
        },
      },

      // 커스텀 spacing
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },

      // 반응형 설정
      screens: {
        mobile: '430px',   // 모바일 최대
        tablet: '768px',   // 태블릿
        desktop: '1024px', // 데스크톱
      },

      // 최대 너비 (모바일 웹 중심)
      maxWidth: {
        mobile: '430px',
        tablet: '600px',
        desktop: '480px',  // 서비스 특성상 모바일 중심
      },

      // 보더 래디우스
      borderRadius: {
        none: '0',
        sm: '4px',
        base: '8px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },

      // 박스 섀도우
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 2px 8px rgba(0, 0, 0, 0.04)',
        md: '0 8px 16px rgba(0, 0, 0, 0.08)',
        lg: '0 8px 24px rgba(107, 91, 149, 0.15)', // Purple tinted
        xl: '0 12px 32px rgba(0, 0, 0, 0.12)',
        'purple-glow': '0 0 0 3px rgba(107, 91, 149, 0.1)',
      },

      // 트랜지션
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        300: '300ms',
      },

      transitionTimingFunction: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },

  plugins: [
    // Tailwind CSS 플러그인 (선택)
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## 2. 폰트 설정 (Next.js 13+)

### 2.1 root layout에서 폰트 임포트

```typescript
// src/app/layout.tsx
import { Pretendard, Noto_Serif_KR } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

// Pretendard (Next.js 공식 지원 안 함, 외부 CDN 사용)
// Noto Serif KR (디스플레이용)
const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-serif-kr',
});

export const metadata: Metadata = {
  title: '팔자냥 | ₩1,500 사주 서비스',
  description: 'MZ세대를 위한 저가 사주 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSerifKr.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

### 2.2 globals.css (Pretendard + 이루 임포트)

```css
/* src/app/globals.css */

@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css');
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap');

/* CSS 변수 선언 */
:root {
  --font-pretendard: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    system-ui, sans-serif;
  --font-iru: 'Noto Serif KR', serif; /* 로고용 (임시) */
  --font-noto-serif-kr: 'Noto Serif KR', serif;

  /* 색상 토큰 */
  --color-primary: #6b5b95;
  --color-primary-hover: #5a4a84;
  --color-accent-gold: #d4af37;
  --color-accent-rose: #b76e79;
  --color-bg-off-white: #f9f7f4;
  --color-bg-cream: #faf8f3;
  --color-text-deep: #2c2c2c;
  --color-text-medium: #6b6b6b;
  --color-text-light: #a0a0a0;
}

/* 다크모드 지원 (향후) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-off-white: #1a1a1a;
    --color-bg-cream: #2d2d2d;
    --color-text-deep: #f5f5f5;
    --color-text-medium: #b0b0b0;
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-pretendard);
  background-color: var(--color-bg-off-white);
  color: var(--color-text-deep);
  line-height: 1.6;
}

/* Scrollbar 스타일 (웹) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

/* 입력 필드 기본 스타일 제거 (Tailwind forms 플러그인 사용 권장) */
input,
textarea {
  font-family: inherit;
}

input:focus,
textarea:focus {
  outline: none;
}

/* 접근성: 포커스 링 */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Safe Area 처리 (모바일) */
@supports (padding-top: env(safe-area-inset-top)) {
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

---

## 3. 버튼 컴포넌트 구현

### 3.1 Button 컴포넌트

```typescript
// src/components/Button.tsx
import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-base transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: clsx(
        'bg-purple-700 text-white hover:bg-purple-800',
        'focus:ring-2 focus:ring-purple-700 focus:ring-offset-2'
      ),
      secondary: clsx(
        'border-2 border-purple-400 text-purple-700',
        'hover:bg-purple-50',
        'focus:ring-2 focus:ring-purple-400'
      ),
      ghost: clsx(
        'text-gray-medium hover:text-purple-700',
        'focus:ring-2 focus:ring-purple-700'
      ),
    };

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-4 text-base',
      lg: 'px-8 py-5 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            로딩 중...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 3.2 사용 예시

```tsx
// 주요 CTA 버튼
<Button variant="primary" size="md" fullWidth>
  사주 보러가기 (1코인)
</Button>

// 보조 버튼
<Button variant="secondary">
  취소
</Button>

// 링크 스타일 버튼
<Button variant="ghost">
  더보기 →
</Button>

// 로딩 상태
<Button variant="primary" isLoading>
  로딩 중...
</Button>
```

---

## 4. 입력 필드 컴포넌트

### 4.1 Input 컴포넌트

```typescript
// src/components/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, className, ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block mb-2 text-base font-bold text-gray-deep">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full px-4 py-3 text-base rounded-base',
            'border border-gray-300 bg-white',
            'focus:border-purple-700 focus:ring-2 focus:ring-purple-glow',
            'placeholder-gray-light',
            'transition-colors duration-150',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error && 'border-error bg-error/5',
            className
          )}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-error">{error}</p>}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-medium">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

## 5. 카드 컴포넌트

### 5.1 Card 컴포넌트

```typescript
// src/components/Card.tsx
import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'highlighted';
  className?: string;
}

export function Card({ children, variant = 'default', className }: CardProps) {
  const variantStyles = {
    default: clsx(
      'bg-stone-100 border border-gray-300',
      'rounded-md shadow-sm hover:shadow-md'
    ),
    highlighted: clsx(
      'bg-gradient-to-br from-stone-100 to-purple-50',
      'border-2 border-amber-gold',
      'rounded-lg shadow-lg'
    ),
  };

  return (
    <div className={clsx(variantStyles[variant], 'p-6 transition-shadow duration-200', className)}>
      {children}
    </div>
  );
}
```

### 5.2 사용 예시

```tsx
// 기본 카드
<Card>
  <h3 className="text-2xl font-bold mb-4">개인 사주</h3>
  <p className="text-base text-gray-medium">설명 텍스트...</p>
</Card>

// 강조 카드 (결과)
<Card variant="highlighted">
  <h2 className="text-3xl font-bold mb-4">🐱 당신의 사주</h2>
  {/* 결과 콘텐츠 */}
</Card>
```

---

## 6. 페이지별 구현 예시

### 6.1 홈 화면 레이아웃

```tsx
// src/app/home/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

type SajuType = 'personal' | 'yearly' | 'compatibility' | 'love';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<SajuType>('personal');

  const tabs: { id: SajuType; label: string; icon: string }[] = [
    { id: 'personal', label: '개인사주', icon: '🔮' },
    { id: 'yearly', label: '신년운세', icon: '📅' },
    { id: 'compatibility', label: '궁합', icon: '💕' },
    { id: 'love', label: '연애운', icon: '❤️' },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-mobile mx-auto px-4 h-14 flex items-center justify-between">
          <div className="text-2xl font-bold text-purple-700">팔자냥</div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-medium">🪙 3.5</span>
            <button className="p-2 text-xl">👤</button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-mobile mx-auto px-4 py-6">
        {/* 인사말 */}
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-2">
            안녕하세요, 김민서님! 🐱
          </h1>
          <p className="text-gray-medium">오늘의 운세를 확인해보세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-4 py-2 rounded-md whitespace-nowrap font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-purple-700 text-white'
                  : 'bg-white text-gray-medium border border-gray-300'
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* 사주 유형 카드 */}
        <Card variant="default">
          <div className="text-4xl mb-4">🔮</div>
          <h2 className="text-2xl font-bold mb-2">개인 사주</h2>
          <p className="text-gray-medium mb-4 leading-relaxed">
            사주팔자 + 대운 분석으로 당신의 타고난 운명과 인생 전체 흐름을
            알려드려요
          </p>
          <ul className="mb-6 space-y-2 text-sm text-gray-medium">
            <li>• 성격과 기질</li>
            <li>• 타고난 재능과 진로</li>
            <li>• 대운 흐름 (10년 주기)</li>
          </ul>
          <Button variant="primary" fullWidth>
            사주 보러가기 (1코인)
          </Button>
        </Card>

        {/* 리워드 배너 */}
        <div className="mt-8 bg-amber-light rounded-md p-4 text-center">
          <p className="text-purple-700 font-bold">
            🎁 공유하면 1코인 무료!
          </p>
        </div>
      </main>
    </div>
  );
}
```

---

## 7. 다크모드 지원 (향후)

### 7.1 구현 방법

```typescript
// src/hooks/useDarkMode.ts
'use client';

import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode =
      localStorage.getItem('darkMode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    localStorage.setItem('darkMode', String(!isDark));
    document.documentElement.classList.toggle('dark');
  };

  return { isDark, toggleDarkMode };
}
```

### 7.2 tailwind.config.js 다크모드 설정

```javascript
module.exports = {
  darkMode: 'class', // HTML 요소의 'dark' 클래스 기반
  // ...
};
```

---

## 8. 자주 사용되는 클래스 조합

### 8.1 재사용 가능한 패턴

```typescript
// src/lib/cn.ts - 클래스 병합 유틸
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// 사용
import { cn } from '@/lib/cn';

<div className={cn('p-4 bg-white', condition && 'bg-purple-700')}>
  {/* ... */}
</div>
```

### 8.2 자주 쓰는 레이아웃

```tsx
// 중앙 정렬 컨테이너
<div className="max-w-mobile mx-auto px-4">

// 가로 배치
<div className="flex gap-4 items-center">

// 세로 배치 (공간 분산)
<div className="flex flex-col gap-6">

// 그리드 (2컬럼)
<div className="grid grid-cols-2 gap-4 md:grid-cols-3">

// 섀도우가 있는 카드
<div className="bg-white rounded-md p-6 shadow-md hover:shadow-lg">
```

---

## 9. 성능 최적화

### 9.1 CSS 클래스 최소화

```typescript
// 나쁜 예: 동적 클래스 생성
const className = `px-${size === 'lg' ? '8' : '4'}`;

// 좋은 예: 사전 정의
const sizeClasses = {
  lg: 'px-8',
  md: 'px-4',
};
const className = sizeClasses[size];
```

### 9.2 CSS 파일 번들 사이즈

```javascript
// tailwind.config.js
module.exports = {
  content: [
    // 필요한 파일만 포함
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // ...
};
```

---

## 10. 체크리스트

### 설정
- [ ] Tailwind 설치 및 설정
- [ ] tailwind.config.js 커스터마이징
- [ ] 폰트 임포트 (Pretendard + Noto Serif KR)
- [ ] CSS 변수 설정
- [ ] 색상 토큰 정의

### 컴포넌트
- [ ] Button (4 variants)
- [ ] Input (폼 상태 포함)
- [ ] Card (2 variants)
- [ ] Modal/Dialog
- [ ] Toast/Notification

### 페이지
- [ ] 홈 화면
- [ ] 정보 입력 화면
- [ ] 결제 유도 화면
- [ ] 결과 화면
- [ ] 마이페이지

### 반응형
- [ ] 모바일 (430px)
- [ ] 태블릿 (768px)
- [ ] 데스크톱 (1024px+)

### 접근성
- [ ] 색상 대비 확인
- [ ] 포커스 관리
- [ ] ARIA 라벨
- [ ] 키보드 네비게이션

### 다크모드 (v1.2)
- [ ] 다크모드 색상 정의
- [ ] 토글 기능
- [ ] 시스템 설정 감지

---

## 참고 자료

- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Next.js 폰트 최적화](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Headless UI 컴포넌트](https://headlessui.com/)
- [Framer Motion 애니메이션](https://www.framer.com/motion/)

