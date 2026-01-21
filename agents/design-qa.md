# Design QA Agent

UI 품질을 자동으로 검사하는 에이전트입니다.

## 트리거 키워드

- "design qa"
- "디자인 qa"
- "디자인 검사"
- "UI 검사"
- "오버플로우 검사"

## 검사 항목

| 검사 | 설명 |
|------|------|
| 가로 오버플로우 | 요소가 화면 오른쪽을 벗어남 |
| 텍스트 오버플로우 | 텍스트가 컨테이너를 벗어남 |
| 세로 오버플로우 | 내용이 컨테이너 높이 초과 |
| 깨진 이미지 | 이미지 로딩 실패 |
| 가로 스크롤바 | 페이지에 불필요한 가로 스크롤 |
| 터치 타겟 | 모바일에서 버튼 크기 (권장 44x44px) |
| z-index 충돌 | fixed/sticky 요소 겹침 |
| 콘솔 에러 | JavaScript 에러 수집 |

## 사용법

```bash
# 기본 실행
npm run design-qa

# 스크린샷 포함
npm run design-qa:screenshot

# 특정 URL 검사
node scripts/design-qa.js --url=https://bazi-azure.vercel.app

# 상세 로그
node scripts/design-qa.js --verbose

# 특정 페이지만 검사
node scripts/design-qa.js --pages=/home,/mypage,/coin
```

## 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--url` | 테스트 URL | http://localhost:3000 |
| `--pages` | 검사할 페이지 (쉼표 구분) | 주요 페이지 10개 |
| `--screenshot` | 스크린샷 저장 | false |
| `--mobile` | 모바일 뷰포트 검사 | true |
| `--verbose` | 상세 로그 출력 | false |

## 검사 페이지 (기본)

- `/` (랜딩)
- `/home`
- `/auth/login`
- `/auth/signup`
- `/coin`
- `/mypage`
- `/terms`
- `/privacy`
- `/refund`
- `/saju/preview`

## 결과 해석

- **통과**: 문제 없음
- **경고**: 권장사항 미준수 (터치 타겟 크기 등)
- **에러**: 수정 필요 (오버플로우, 깨진 이미지 등)

## 스크린샷 저장 위치

`--screenshot` 옵션 사용 시:
```
./design-qa-screenshots/
├── _home_desktop.png
├── _home_mobile.png
├── home_desktop.png
├── home_mobile.png
└── ...
```
