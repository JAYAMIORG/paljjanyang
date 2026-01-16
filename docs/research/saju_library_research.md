# Python 사주 라이브러리 기술 조사

> 작성일: 2025-01-15
> 프로젝트: 팔자냥 (1불 사주 서비스)

---

## 1. 조사 목적

사주팔자(四柱八字) 계산을 위한 Python 라이브러리 조사 및 기술 검증

---

## 2. 라이브러리 비교표

| 라이브러리 | GitHub Stars | 최근 업데이트 | 사주팔자 | 음력/양력 | 오행 | 한국어 | 추천도 |
|------------|--------------|---------------|----------|-----------|------|--------|--------|
| lunar-python | 524 ⭐ | 2025.11 | ✅ 완전 | ✅ | ✅ | ❌ | ⭐⭐⭐⭐⭐ |
| korean-lunar-calendar | 26 ⭐ | 2022.09 | ⚠️ 부분 | ✅ | ❌ | ✅ | ⭐⭐⭐⭐ |
| lunisolar | 40 ⭐ | 활성 | ⚠️ 기초 | ✅ | ❌ | ❌ | ⭐⭐⭐ |
| LunarCalendar | 82 ⭐ | 활성 | ❌ | ✅ | ❌ | ❌ | ⭐⭐⭐ |
| lunar-mcp-server | - | 2025.12 | ✅ 완전 | ✅ | ✅ | ❌ | ⭐⭐⭐⭐ |

---

## 3. 상세 분석

### 3.1 lunar-python (최고 추천)

**기본 정보:**
- GitHub: https://github.com/6tail/lunar-python
- PyPI: `pip install lunar_python`
- Stars: 524 | Version: 1.4.8 (2025.11)

**지원 기능:**
- ✅ 완전한 사주팔자(八字) 계산
- ✅ 년주/월주/일주/시주 모두 지원
- ✅ 오행(五行) 계산
- ✅ 십신(十神) 계산
- ✅ 대운/세운/소운 계산
- ✅ 24절기 지원
- ✅ 양력/음력 변환
- ✅ 외부 의존성 없음

**사용 예시:**
```python
from lunar_python import Solar

# 생년월일시로 Solar 객체 생성
solar = Solar(1988, 2, 15, 23, 30, 0)
lunar = solar.getLunar()
baZi = lunar.getEightChar()

# 사주팔자 출력
print(baZi.getYear())   # 년주 (예: 戊辰)
print(baZi.getMonth())  # 월주
print(baZi.getDay())    # 일주
print(baZi.getTime())   # 시주

# 오행 출력
print(baZi.getYearWuXing())   # 년주 오행
print(baZi.getMonthWuXing())  # 월주 오행
print(baZi.getDayWuXing())    # 일주 오행
print(baZi.getTimeWuXing())   # 시주 오행

# 십신 출력
print(baZi.getYearShiShenGan())  # 년간 십신
print(baZi.getMonthShiShenGan()) # 월간 십신
```

**장점:**
- 가장 완전한 사주 계산 기능
- 활발한 유지보수 (37개 릴리즈)
- 풍부한 API 문서
- 외부 라이브러리 의존성 없음

**단점:**
- 한국어 문서화 없음 (중국어)
- 한국 특유의 만세력 표기와 다를 수 있음

---

### 3.2 korean-lunar-calendar (한국어 지원)

**기본 정보:**
- GitHub: https://github.com/usingsky/korean_lunar_calendar_py
- PyPI: `pip install korean_lunar_calendar`
- Stars: 26 | Version: 0.3.1 (2022.09)

**지원 기능:**
- ✅ 한국천문연구원(KARI) 기준 음력 변환
- ✅ 년/월/일 간지 계산
- ✅ 한글/한자 간지 문자열 출력
- ❌ 시주(시간) 계산 미지원
- ❌ 오행 계산 미지원

**사용 예시:**
```python
from korean_lunar_calendar import KoreanLunarCalendar

calendar = KoreanLunarCalendar()
calendar.setSolarDate(2024, 1, 15)

# 간지 출력
print(calendar.getGapJaString())        # 갑진년 을축월 기묘일
print(calendar.getChineseGapJaString()) # 甲辰年 乙丑月 己卯日

# 음력 날짜
print(calendar.getLunarIsoFormat())     # 2023-12-05
```

**장점:**
- 한국 공식 기관(KARI) 기준 정확한 음력
- 한글 간지 출력 지원
- 1000년~2050년 넓은 범위

**단점:**
- 시주(時柱) 계산 없음
- 오행, 십신 등 사주 해석 기능 없음
- 업데이트 비활성 (2022년 이후)

---

### 3.3 lunar-mcp-server (AI 통합용)

**기본 정보:**
- PyPI: `pip install lunar-mcp-server`
- Version: 1.2.0 (2025.12)

**지원 기능:**
- ✅ 완전한 사주팔자 계산
- ✅ 오행 분석
- ✅ 일주(Day Master) 성격 분석
- ✅ 궁합 점수 계산
- ✅ MCP(Model Context Protocol) 지원

**특징:**
- AI 애플리케이션 통합에 최적화
- 타임존 지원
- Python 3.11 이상 필요

---

## 4. 권장 구성

### 4.1 설치

```bash
pip install lunar_python korean_lunar_calendar
```

### 4.2 조합 사용 예시

```python
from korean_lunar_calendar import KoreanLunarCalendar
from lunar_python import Solar

def get_saju(year: int, month: int, day: int, hour: int = 12):
    """
    사주팔자 계산 함수

    Args:
        year: 출생 년도 (양력)
        month: 출생 월
        day: 출생 일
        hour: 출생 시간 (0-23)

    Returns:
        dict: 사주팔자 정보
    """
    # 한국식 간지 (년월일) - 한글 출력용
    calendar = KoreanLunarCalendar()
    calendar.setSolarDate(year, month, day)
    korean_ganji = calendar.getGapJaString()

    # 완전한 사주팔자 (시주 포함 + 오행)
    solar = Solar(year, month, day, hour, 0, 0)
    lunar = solar.getLunar()
    baZi = lunar.getEightChar()

    return {
        "korean_ganji": korean_ganji,
        "year_pillar": {
            "chinese": baZi.getYear(),
            "wuxing": baZi.getYearWuXing(),
        },
        "month_pillar": {
            "chinese": baZi.getMonth(),
            "wuxing": baZi.getMonthWuXing(),
        },
        "day_pillar": {
            "chinese": baZi.getDay(),
            "wuxing": baZi.getDayWuXing(),
        },
        "time_pillar": {
            "chinese": baZi.getTime(),
            "wuxing": baZi.getTimeWuXing(),
        },
        "lunar_date": {
            "year": lunar.getYear(),
            "month": lunar.getMonth(),
            "day": lunar.getDay(),
        }
    }

# 사용 예시
result = get_saju(1990, 5, 15, 14)
print(result)
```

---

## 5. 기술 검증 결론

### 5.1 결론

| 목적 | 추천 라이브러리 |
|------|-----------------|
| 완전한 사주팔자 계산 | `lunar-python` |
| 한국어 간지 출력 | `korean-lunar-calendar` |
| AI 앱 통합 | `lunar-mcp-server` |

**최종 결정:** `lunar-python` + `korean-lunar-calendar` 조합 사용

### 5.2 구현 가능 여부

- ✅ 사주팔자 계산: 가능
- ✅ 오행 분석: 가능
- ✅ 음력/양력 변환: 가능
- ✅ 한글 간지 출력: 가능
- ⚠️ 사주 해석: LLM으로 구현 필요

---

## 6. 참고 자료

- [lunar-python GitHub](https://github.com/6tail/lunar-python)
- [lunar-python PyPI](https://pypi.org/project/lunar_python/)
- [korean-lunar-calendar GitHub](https://github.com/usingsky/korean_lunar_calendar_py)
- [korean-lunar-calendar PyPI](https://pypi.org/project/korean-lunar-calendar/)
- [lunar-mcp-server PyPI](https://pypi.org/project/lunar-mcp-server/)
