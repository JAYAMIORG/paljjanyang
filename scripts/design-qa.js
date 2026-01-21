#!/usr/bin/env node
/**
 * Design QA Agent
 *
 * 자동으로 UI 품질을 검사하는 에이전트
 * - 오버플로우 감지 (텍스트/요소가 컨테이너를 벗어남)
 * - 텍스트 잘림 확인
 * - 이미지 로딩 실패 감지
 * - 스크롤바 이상 감지
 * - 반응형 레이아웃 검사
 *
 * 사용법:
 *   node scripts/design-qa.js [옵션]
 *
 * 옵션:
 *   --url=<URL>           테스트 URL (기본: http://localhost:3000)
 *   --pages=<paths>       검사할 페이지 (쉼표로 구분, 기본: 주요 페이지)
 *   --screenshot          스크린샷 저장 (기본: false)
 *   --mobile              모바일 뷰포트도 검사 (기본: true)
 *   --verbose             상세 로그 출력
 */

const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

// 파라미터 파싱
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.replace('--', '').split('=')
    acc[key] = value === undefined ? true : value
  }
  return acc
}, {})

const BASE_URL = args.url || 'http://localhost:3000'
const SAVE_SCREENSHOTS = args.screenshot || false
const CHECK_MOBILE = args.mobile !== 'false'
const VERBOSE = args.verbose || false

// 검사할 페이지 목록
const DEFAULT_PAGES = [
  '/',
  '/home',
  '/auth/login',
  '/auth/signup',
  '/coin',
  '/mypage',
  '/terms',
  '/privacy',
  '/refund',
  '/saju/preview',
]

const PAGES = args.pages ? args.pages.split(',') : DEFAULT_PAGES

// 뷰포트 설정
const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 667 }, // iPhone SE
}

// 결과 저장
const results = {
  passed: [],
  warnings: [],
  errors: [],
}

/**
 * 페이지에서 오버플로우 요소 감지
 */
async function checkOverflow(page) {
  return await page.evaluate(() => {
    const issues = []

    // 모든 요소 검사
    const allElements = document.querySelectorAll('*')

    allElements.forEach((el) => {
      const style = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()

      // 요소가 화면에 보이는지 확인
      if (rect.width === 0 || rect.height === 0) return
      if (style.display === 'none' || style.visibility === 'hidden') return

      // 1. 가로 오버플로우 체크 (body 기준)
      if (rect.right > document.documentElement.clientWidth + 5) {
        issues.push({
          type: 'horizontal-overflow',
          element: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : ''),
          message: `요소가 화면 오른쪽을 벗어남 (${Math.round(rect.right - document.documentElement.clientWidth)}px)`,
          selector: getSelector(el),
        })
      }

      // 2. 텍스트 오버플로우 체크 (ellipsis 없이 잘림)
      if (
        el.scrollWidth > el.clientWidth &&
        style.overflow !== 'hidden' &&
        style.textOverflow !== 'ellipsis' &&
        style.whiteSpace === 'nowrap'
      ) {
        issues.push({
          type: 'text-overflow',
          element: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : ''),
          message: `텍스트가 컨테이너를 벗어남 (${el.scrollWidth - el.clientWidth}px)`,
          selector: getSelector(el),
          text: el.textContent?.substring(0, 50),
        })
      }

      // 3. 세로 오버플로우 체크 (스크롤바 생성)
      if (
        el.scrollHeight > el.clientHeight + 5 &&
        style.overflowY === 'visible' &&
        el.tagName !== 'HTML' &&
        el.tagName !== 'BODY'
      ) {
        // 의도적인 스크롤 컨테이너가 아닌 경우만
        if (!el.classList.contains('overflow-auto') && !el.classList.contains('overflow-scroll')) {
          issues.push({
            type: 'vertical-overflow',
            element: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : ''),
            message: `내용이 컨테이너 높이를 초과 (${el.scrollHeight - el.clientHeight}px)`,
            selector: getSelector(el),
          })
        }
      }
    })

    function getSelector(el) {
      if (el.id) return `#${el.id}`
      if (el.className) {
        const classes = el.className.split(' ').filter(c => c && !c.includes(':'))[0]
        if (classes) return `${el.tagName.toLowerCase()}.${classes}`
      }
      return el.tagName.toLowerCase()
    }

    return issues
  })
}

/**
 * 이미지 로딩 실패 감지
 */
async function checkBrokenImages(page) {
  return await page.evaluate(() => {
    const issues = []
    const images = document.querySelectorAll('img')

    images.forEach((img) => {
      if (!img.complete || img.naturalWidth === 0) {
        issues.push({
          type: 'broken-image',
          element: 'img',
          message: `이미지 로딩 실패`,
          src: img.src,
          alt: img.alt,
        })
      }
    })

    return issues
  })
}

/**
 * 가로 스크롤바 감지
 */
async function checkHorizontalScrollbar(page) {
  return await page.evaluate(() => {
    const issues = []

    if (document.documentElement.scrollWidth > document.documentElement.clientWidth) {
      issues.push({
        type: 'horizontal-scrollbar',
        element: 'body',
        message: `페이지에 가로 스크롤바 발생 (${document.documentElement.scrollWidth - document.documentElement.clientWidth}px 초과)`,
      })
    }

    return issues
  })
}

/**
 * 클릭 가능 영역 크기 검사 (터치 타겟)
 */
async function checkTouchTargets(page) {
  return await page.evaluate(() => {
    const issues = []
    const minSize = 44 // Apple HIG 권장 최소 크기

    const clickables = document.querySelectorAll('button, a, input, select, textarea, [role="button"]')

    clickables.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)

      if (style.display === 'none' || style.visibility === 'hidden') return
      if (rect.width === 0 || rect.height === 0) return

      if (rect.width < minSize || rect.height < minSize) {
        // padding으로 실제 터치 영역이 넓어지는 경우 제외
        const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
        const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)

        if (rect.width < minSize && rect.width + paddingX < minSize) {
          issues.push({
            type: 'small-touch-target',
            element: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : ''),
            message: `터치 영역이 너무 작음 (${Math.round(rect.width)}x${Math.round(rect.height)}px, 권장: ${minSize}x${minSize}px)`,
            text: el.textContent?.substring(0, 30),
          })
        }
      }
    })

    return issues
  })
}

/**
 * z-index 충돌 감지
 */
async function checkZIndexIssues(page) {
  return await page.evaluate(() => {
    const issues = []
    const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]')
    const stickyElements = document.querySelectorAll('[style*="position: sticky"], [style*="position:sticky"]')

    // CSS로 fixed/sticky 설정된 요소도 포함
    const allElements = document.querySelectorAll('*')
    const positionedElements = []

    allElements.forEach((el) => {
      const style = window.getComputedStyle(el)
      if (style.position === 'fixed' || style.position === 'sticky') {
        const zIndex = parseInt(style.zIndex) || 0
        positionedElements.push({
          element: el,
          zIndex,
          position: style.position,
        })
      }
    })

    // z-index가 겹치는 요소 확인
    const zIndexMap = new Map()
    positionedElements.forEach(({ element, zIndex, position }) => {
      if (!zIndexMap.has(zIndex)) {
        zIndexMap.set(zIndex, [])
      }
      zIndexMap.get(zIndex).push({ element, position })
    })

    zIndexMap.forEach((elements, zIndex) => {
      if (elements.length > 1 && zIndex !== 0) {
        issues.push({
          type: 'z-index-conflict',
          message: `z-index ${zIndex}에 ${elements.length}개 요소가 겹침`,
          elements: elements.map((e) => e.element.tagName.toLowerCase()),
        })
      }
    })

    return issues
  })
}

/**
 * 콘솔 에러 수집
 */
function setupConsoleListener(page, pagePath) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.errors.push({
        page: pagePath,
        type: 'console-error',
        message: msg.text(),
      })
    }
  })

  page.on('pageerror', (error) => {
    results.errors.push({
      page: pagePath,
      type: 'page-error',
      message: error.message,
    })
  })
}

/**
 * 단일 페이지 검사
 */
async function checkPage(browser, pagePath, viewport, viewportName) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: viewportName === 'mobile' ? 2 : 1,
  })

  const page = await context.newPage()
  setupConsoleListener(page, pagePath)

  const url = `${BASE_URL}${pagePath}`
  const pageId = `${pagePath} (${viewportName})`

  try {
    if (VERBOSE) console.log(`  검사 중: ${pageId}`)

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

    // 페이지 로딩 대기
    await page.waitForTimeout(1000)

    // 검사 실행
    const overflowIssues = await checkOverflow(page)
    const brokenImages = await checkBrokenImages(page)
    const scrollbarIssues = await checkHorizontalScrollbar(page)
    const touchIssues = viewportName === 'mobile' ? await checkTouchTargets(page) : []
    const zIndexIssues = await checkZIndexIssues(page)

    const allIssues = [
      ...overflowIssues,
      ...brokenImages,
      ...scrollbarIssues,
      ...touchIssues,
      ...zIndexIssues,
    ]

    if (allIssues.length === 0) {
      results.passed.push(pageId)
    } else {
      allIssues.forEach((issue) => {
        const severity = ['broken-image', 'horizontal-scrollbar', 'horizontal-overflow'].includes(issue.type)
          ? 'error'
          : 'warning'

        const entry = {
          page: pageId,
          ...issue,
        }

        if (severity === 'error') {
          results.errors.push(entry)
        } else {
          results.warnings.push(entry)
        }
      })
    }

    // 스크린샷 저장
    if (SAVE_SCREENSHOTS) {
      const screenshotDir = path.join(process.cwd(), 'design-qa-screenshots')
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true })
      }

      const filename = `${pagePath.replace(/\//g, '_') || 'home'}_${viewportName}.png`
      await page.screenshot({
        path: path.join(screenshotDir, filename),
        fullPage: true,
      })
    }
  } catch (error) {
    results.errors.push({
      page: pageId,
      type: 'page-load-error',
      message: error.message,
    })
  } finally {
    await context.close()
  }
}

/**
 * 결과 출력
 */
function printResults() {
  console.log('\n')
  console.log('========================================')
  console.log('📋 Design QA 검사 결과')
  console.log('========================================')

  // 통과
  if (results.passed.length > 0) {
    console.log(`\n✅ 통과: ${results.passed.length}개 페이지`)
    if (VERBOSE) {
      results.passed.forEach((p) => console.log(`   - ${p}`))
    }
  }

  // 경고
  if (results.warnings.length > 0) {
    console.log(`\n⚠️  경고: ${results.warnings.length}개`)
    results.warnings.forEach((w) => {
      console.log(`   [${w.page}] ${w.type}: ${w.message}`)
      if (w.selector) console.log(`      선택자: ${w.selector}`)
      if (w.text) console.log(`      텍스트: "${w.text}"`)
    })
  }

  // 에러
  if (results.errors.length > 0) {
    console.log(`\n❌ 에러: ${results.errors.length}개`)
    results.errors.forEach((e) => {
      console.log(`   [${e.page}] ${e.type}: ${e.message}`)
      if (e.src) console.log(`      소스: ${e.src}`)
    })
  }

  // 요약
  console.log('\n----------------------------------------')
  console.log('📊 요약')
  console.log(`   통과: ${results.passed.length}`)
  console.log(`   경고: ${results.warnings.length}`)
  console.log(`   에러: ${results.errors.length}`)

  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log('\n🎉 모든 검사 통과!')
  } else if (results.errors.length === 0) {
    console.log('\n⚠️  경고가 있지만 심각한 문제는 없습니다.')
  } else {
    console.log('\n❌ 수정이 필요한 문제가 발견되었습니다.')
  }

  console.log('========================================')

  if (SAVE_SCREENSHOTS) {
    console.log(`\n📸 스크린샷 저장 위치: ./design-qa-screenshots/`)
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('========================================')
  console.log('🔍 Design QA Agent 시작')
  console.log('========================================')
  console.log(`URL: ${BASE_URL}`)
  console.log(`검사 페이지: ${PAGES.length}개`)
  console.log(`모바일 검사: ${CHECK_MOBILE ? 'Yes' : 'No'}`)
  console.log('----------------------------------------')

  const browser = await chromium.launch({ headless: true })

  try {
    for (const pagePath of PAGES) {
      console.log(`\n📄 ${pagePath}`)

      // 데스크톱 검사
      await checkPage(browser, pagePath, VIEWPORTS.desktop, 'desktop')

      // 모바일 검사
      if (CHECK_MOBILE) {
        await checkPage(browser, pagePath, VIEWPORTS.mobile, 'mobile')
      }
    }

    printResults()
  } finally {
    await browser.close()
  }

  // 에러가 있으면 exit code 1
  process.exit(results.errors.length > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Design QA Agent 실행 실패:', error)
  process.exit(1)
})
