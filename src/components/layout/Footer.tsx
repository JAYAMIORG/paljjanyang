'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="text-caption text-text-light space-y-1">
          <p className="font-medium text-text-muted">ChartIQ</p>
          <p>대표자: 박재호</p>
          <p>사업자등록번호: 794-29-01712</p>
          <p>주소: 경기도 화성시 동탄지성로 295</p>
        </div>

        <div className="flex justify-between items-center mt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Link href="/terms" className="text-caption text-text-light hover:text-text-muted px-2 py-3 min-h-[44px] flex items-center">
              이용약관
            </Link>
            <Link href="/privacy" className="text-caption text-text-light hover:text-text-muted px-2 py-3 min-h-[44px] flex items-center">
              개인정보처리방침
            </Link>
            <Link href="/refund" className="text-caption text-text-light hover:text-text-muted px-2 py-3 min-h-[44px] flex items-center">
              환불정책
            </Link>
          </div>
          <div className="flex gap-2 items-center">
            <a
              href="https://www.instagram.com/saju.palzza/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:opacity-80 transition-opacity"
              aria-label="Instagram"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFDC80"/>
                    <stop offset="25%" stopColor="#F77737"/>
                    <stop offset="50%" stopColor="#E1306C"/>
                    <stop offset="75%" stopColor="#C13584"/>
                    <stop offset="100%" stopColor="#5851DB"/>
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#instagram-gradient)" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4" stroke="url(#instagram-gradient)" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="url(#instagram-gradient)"/>
              </svg>
            </a>
            <a
              href="https://www.threads.com/@saju.palzza"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:opacity-80 transition-opacity"
              aria-label="Threads"
            >
              <svg width="20" height="20" viewBox="0 0 192 192" fill="#000000">
                <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C120.004 17.1122 137.48 24.4614 149.027 38.7576C154.673 45.7536 158.819 54.4631 161.473 64.6168L176.842 60.5922C173.517 47.7512 168.052 36.7805 160.439 27.7249C145.932 10.1437 125.169 1.08498 97.0695 0.890625H96.9569C68.8816 1.08388 48.2332 10.1066 33.9585 27.6235C21.0659 43.4634 14.4326 65.6274 14.2187 96.0024C14.4329 126.377 21.0662 148.542 33.9585 164.382C48.2332 181.899 68.8816 190.922 96.9569 191.116H97.0695C122.03 190.949 139.307 184.294 153.549 170.063C173.331 150.298 172.737 126.043 166.451 111.414C161.987 100.858 153.345 92.3569 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"/>
              </svg>
            </a>
          </div>
        </div>

        <p className="text-caption text-text-light mt-4">
          © {new Date().getFullYear()} ChartIQ. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
