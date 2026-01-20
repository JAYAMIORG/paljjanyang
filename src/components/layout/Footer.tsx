'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-caption text-text-light space-y-1">
          <p className="font-medium text-text-muted">ChartIQ</p>
          <p>대표자: 박재호</p>
          <p>사업자등록번호: 794-29-01712</p>
          <p>주소: 경기도 화성시 동탄지성로 295</p>
          <p>전화: 010-5148-4187</p>
        </div>

        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200">
          <Link href="/terms" className="text-caption text-text-light hover:text-text-muted">
            이용약관
          </Link>
          <Link href="/privacy" className="text-caption text-text-light hover:text-text-muted">
            개인정보처리방침
          </Link>
          <Link href="/refund" className="text-caption text-text-light hover:text-text-muted">
            환불정책
          </Link>
        </div>

        <p className="text-caption text-text-light mt-4">
          © 2025 ChartIQ. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
