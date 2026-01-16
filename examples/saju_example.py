"""
팔자냥 - 사주 계산 라이브러리 예시
===================================

필요한 라이브러리 설치:
    pip install lunar_python korean_lunar_calendar

사용하는 라이브러리:
    - lunar_python: 사주팔자, 오행, 십신 계산 (중국 기반)
    - korean_lunar_calendar: 한국 천문연구원 기준 음력 변환, 한글 간지
"""

from lunar_python import Solar, Lunar
from korean_lunar_calendar import KoreanLunarCalendar


# =============================================================================
# 1. 기본 사용법 - 사주팔자 계산
# =============================================================================

def get_saju_basic(year: int, month: int, day: int, hour: int = 12):
    """
    기본 사주팔자 계산

    Args:
        year: 출생 년도 (양력)
        month: 출생 월
        day: 출생 일
        hour: 출생 시간 (0-23), 기본값 12시 (모를 경우)

    Returns:
        dict: 사주팔자 정보
    """
    # Solar 객체 생성 (양력 날짜)
    solar = Solar(year, month, day, hour, 0, 0)

    # 음력 변환
    lunar = solar.getLunar()

    # 사주팔자 (八字) 가져오기
    bazi = lunar.getEightChar()

    return {
        "년주": bazi.getYear(),      # 年柱 (예: 庚午)
        "월주": bazi.getMonth(),     # 月柱
        "일주": bazi.getDay(),       # 日柱
        "시주": bazi.getTime(),      # 時柱
    }


# 예시 실행
print("=" * 50)
print("1. 기본 사주팔자 계산")
print("=" * 50)

result = get_saju_basic(1990, 5, 15, 14)
print(f"1990년 5월 15일 오후 2시생:")
for key, value in result.items():
    print(f"  {key}: {value}")


# =============================================================================
# 2. 오행 (五行) 분석
# =============================================================================

def get_wuxing(year: int, month: int, day: int, hour: int = 12):
    """
    오행 분석

    오행: 木(목), 火(화), 土(토), 金(금), 水(수)
    """
    solar = Solar(year, month, day, hour, 0, 0)
    bazi = solar.getLunar().getEightChar()

    return {
        "년주_오행": bazi.getYearWuXing(),
        "월주_오행": bazi.getMonthWuXing(),
        "일주_오행": bazi.getDayWuXing(),
        "시주_오행": bazi.getTimeWuXing(),
    }


print("\n" + "=" * 50)
print("2. 오행 분석")
print("=" * 50)

wuxing = get_wuxing(1990, 5, 15, 14)
for key, value in wuxing.items():
    print(f"  {key}: {value}")


# =============================================================================
# 3. 십신 (十神) 분석
# =============================================================================

def get_shishen(year: int, month: int, day: int, hour: int = 12):
    """
    십신 분석

    십신: 비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인
    """
    solar = Solar(year, month, day, hour, 0, 0)
    bazi = solar.getLunar().getEightChar()

    return {
        "년간_십신": bazi.getYearShiShenGan(),   # 년주 천간의 십신
        "월간_십신": bazi.getMonthShiShenGan(),  # 월주 천간의 십신
        "일간": bazi.getDayGan(),                # 일간 (본인, 기준점)
        "시간_십신": bazi.getTimeShiShenGan(),   # 시주 천간의 십신
    }


print("\n" + "=" * 50)
print("3. 십신 분석")
print("=" * 50)

shishen = get_shishen(1990, 5, 15, 14)
for key, value in shishen.items():
    print(f"  {key}: {value}")


# =============================================================================
# 4. 한글 간지 출력 (korean_lunar_calendar 사용)
# =============================================================================

def get_korean_ganji(year: int, month: int, day: int):
    """
    한국 천문연구원 기준 한글 간지 출력

    주의: 시주는 지원하지 않음 (lunar_python 사용 필요)
    """
    calendar = KoreanLunarCalendar()
    calendar.setSolarDate(year, month, day)

    return {
        "한글_간지": calendar.getGapJaString(),         # 예: 경오년 신사월 기묘일
        "한자_간지": calendar.getChineseGapJaString(),  # 예: 庚午年 辛巳月 己卯日
        "음력_날짜": calendar.LunarIsoFormat(),      # 예: 1990-04-21
        "윤달_여부": calendar.isIntercalation,        # True/False
    }


print("\n" + "=" * 50)
print("4. 한글 간지 출력")
print("=" * 50)

korean = get_korean_ganji(1990, 5, 15)
for key, value in korean.items():
    print(f"  {key}: {value}")


# =============================================================================
# 5. 음력 → 양력 변환
# =============================================================================

def lunar_to_solar(year: int, month: int, day: int, is_leap_month: bool = False):
    """
    음력 날짜를 양력으로 변환

    Args:
        year: 음력 년도
        month: 음력 월
        day: 음력 일
        is_leap_month: 윤달 여부
    """
    calendar = KoreanLunarCalendar()
    calendar.setLunarDate(year, month, day, is_leap_month)

    return {
        "양력_날짜": calendar.SolarIsoFormat(),
        "한글_간지": calendar.getGapJaString(),
    }


print("\n" + "=" * 50)
print("5. 음력 → 양력 변환")
print("=" * 50)

# 음력 1990년 4월 21일
lunar_result = lunar_to_solar(1990, 4, 21)
print(f"음력 1990년 4월 21일 → 양력: {lunar_result['양력_날짜']}")


# =============================================================================
# 6. 대운 (大運) 계산
# =============================================================================

def get_dayun(year: int, month: int, day: int, hour: int, gender: int):
    """
    대운 계산

    Args:
        gender: 1 = 남성, 0 = 여성
    """
    solar = Solar(year, month, day, hour, 0, 0)
    bazi = solar.getLunar().getEightChar()

    # 대운 시작 나이
    start_age = bazi.getYun(gender).getStartYear()

    # 대운 목록
    dayuns = bazi.getYun(gender).getDaYun()

    result = {
        "대운_시작_나이": start_age,
        "대운_목록": []
    }

    for dayun in dayuns[:5]:  # 처음 5개 대운만
        result["대운_목록"].append({
            "시작_나이": dayun.getStartAge(),
            "대운": dayun.getGanZhi(),
        })

    return result


print("\n" + "=" * 50)
print("6. 대운 계산")
print("=" * 50)

dayun = get_dayun(1990, 5, 15, 14, gender=0)  # 여성
print(f"대운 시작 나이: {dayun['대운_시작_나이']}세")
print("대운 목록:")
for d in dayun["대운_목록"]:
    print(f"  {d['시작_나이']}세: {d['대운']}")


# =============================================================================
# 7. 종합 사주 분석 함수 (실제 서비스용)
# =============================================================================

def analyze_saju(
    year: int,
    month: int,
    day: int,
    hour: int = None,
    is_lunar: bool = False,
    is_leap_month: bool = False,
    gender: str = "female"
):
    """
    종합 사주 분석 (팔자냥 서비스용)

    Args:
        year: 출생 년도
        month: 출생 월
        day: 출생 일
        hour: 출생 시간 (0-23), None이면 시주 생략
        is_lunar: 음력 여부 (True면 음력으로 입력받음)
        is_leap_month: 윤달 여부 (음력일 때만 사용)
        gender: "male" 또는 "female"

    Returns:
        dict: 종합 사주 분석 결과
    """
    # 음력이면 양력으로 변환
    if is_lunar:
        calendar = KoreanLunarCalendar()
        calendar.setLunarDate(year, month, day, is_leap_month)
        solar_date = calendar.SolarIsoFormat()
        year, month, day = map(int, solar_date.split("-"))

    # 시간이 없으면 정오(12시)로 설정 (시주는 참고용으로만)
    if hour is None:
        hour = 12
        time_unknown = True
    else:
        time_unknown = False

    # Solar 객체 생성
    solar = Solar(year, month, day, hour, 0, 0)
    lunar = solar.getLunar()
    bazi = lunar.getEightChar()

    # 한글 간지
    korean_cal = KoreanLunarCalendar()
    korean_cal.setSolarDate(year, month, day)

    # 성별 코드
    gender_code = 1 if gender == "male" else 0

    # 결과 조합
    result = {
        # 기본 정보
        "solar_date": f"{year}-{month:02d}-{day:02d}",
        "lunar_date": korean_cal.LunarIsoFormat(),
        "is_leap_month": korean_cal.isIntercalation,
        "gender": gender,
        "time_unknown": time_unknown,

        # 사주팔자
        "bazi": {
            "year": {
                "pillar": bazi.getYear(),
                "gan": bazi.getYearGan(),      # 천간
                "zhi": bazi.getYearZhi(),      # 지지
                "wuxing": bazi.getYearWuXing(),
                "shishen_gan": bazi.getYearShiShenGan(),
            },
            "month": {
                "pillar": bazi.getMonth(),
                "gan": bazi.getMonthGan(),
                "zhi": bazi.getMonthZhi(),
                "wuxing": bazi.getMonthWuXing(),
                "shishen_gan": bazi.getMonthShiShenGan(),
            },
            "day": {
                "pillar": bazi.getDay(),
                "gan": bazi.getDayGan(),       # 일간 = 본인
                "zhi": bazi.getDayZhi(),
                "wuxing": bazi.getDayWuXing(),
            },
            "hour": {
                "pillar": bazi.getTime() if not time_unknown else None,
                "gan": bazi.getTimeGan() if not time_unknown else None,
                "zhi": bazi.getTimeZhi() if not time_unknown else None,
                "wuxing": bazi.getTimeWuXing() if not time_unknown else None,
                "shishen_gan": bazi.getTimeShiShenGan() if not time_unknown else None,
            } if not time_unknown else {"note": "시간 미입력"},
        },

        # 한글 간지
        "korean_ganji": korean_cal.getGapJaString(),

        # 일간 (본인, 사주 해석의 기준)
        "day_master": {
            "gan": bazi.getDayGan(),
            "wuxing": bazi.getDayWuXing().split()[0],  # 木, 火, 土, 金, 水 중 하나
        },

        # 대운 (처음 8개)
        "dayun": [],
    }

    # 대운 계산
    yun = bazi.getYun(gender_code)
    result["dayun_start_age"] = yun.getStartYear()

    for dayun in yun.getDaYun()[:8]:
        result["dayun"].append({
            "start_age": dayun.getStartAge(),
            "end_age": dayun.getEndAge(),
            "ganzhi": dayun.getGanZhi(),
        })

    return result


print("\n" + "=" * 50)
print("7. 종합 사주 분석 (서비스용)")
print("=" * 50)

# 양력 입력 예시
analysis = analyze_saju(
    year=1990,
    month=5,
    day=15,
    hour=14,
    is_lunar=False,
    gender="female"
)

print(f"\n양력: {analysis['solar_date']}")
print(f"음력: {analysis['lunar_date']}")
print(f"한글 간지: {analysis['korean_ganji']}")
print(f"\n사주팔자:")
print(f"  년주: {analysis['bazi']['year']['pillar']} ({analysis['bazi']['year']['wuxing']})")
print(f"  월주: {analysis['bazi']['month']['pillar']} ({analysis['bazi']['month']['wuxing']})")
print(f"  일주: {analysis['bazi']['day']['pillar']} ({analysis['bazi']['day']['wuxing']})")
print(f"  시주: {analysis['bazi']['hour']['pillar']} ({analysis['bazi']['hour']['wuxing']})")
print(f"\n일간 (본인): {analysis['day_master']['gan']} - {analysis['day_master']['wuxing']}")
print(f"\n대운 시작: {analysis['dayun_start_age']}세")
print("대운 목록:")
for d in analysis["dayun"][:5]:
    print(f"  {d['start_age']}~{d['end_age']}세: {d['ganzhi']}")


# =============================================================================
# 8. 궁합 계산 예시
# =============================================================================

def calculate_compatibility(person1: dict, person2: dict):
    """
    두 사람의 궁합 분석 (기본 예시)

    실제 서비스에서는 더 복잡한 로직 필요
    """
    # 각자의 사주 분석
    saju1 = analyze_saju(**person1)
    saju2 = analyze_saju(**person2)

    # 일간 (본인) 비교
    day_master1 = saju1["day_master"]["wuxing"]
    day_master2 = saju2["day_master"]["wuxing"]

    # 오행 상생상극 관계 (간단한 예시)
    # 실제로는 훨씬 복잡한 로직 필요
    compatible_pairs = [
        ("木", "火"), ("火", "土"), ("土", "金"), ("金", "水"), ("水", "木"),  # 상생
    ]

    is_compatible = (day_master1, day_master2) in compatible_pairs or \
                   (day_master2, day_master1) in compatible_pairs

    return {
        "person1": {
            "day_master": day_master1,
            "korean_ganji": saju1["korean_ganji"],
        },
        "person2": {
            "day_master": day_master2,
            "korean_ganji": saju2["korean_ganji"],
        },
        "is_compatible": is_compatible,
        "relationship": "상생 관계" if is_compatible else "기타 관계",
    }


print("\n" + "=" * 50)
print("8. 궁합 계산 예시")
print("=" * 50)

person1 = {"year": 1990, "month": 5, "day": 15, "hour": 14, "gender": "female"}
person2 = {"year": 1988, "month": 2, "day": 20, "hour": 10, "gender": "male"}

compatibility = calculate_compatibility(person1, person2)
print(f"\n사람1: {compatibility['person1']['korean_ganji']} (일간: {compatibility['person1']['day_master']})")
print(f"사람2: {compatibility['person2']['korean_ganji']} (일간: {compatibility['person2']['day_master']})")
print(f"관계: {compatibility['relationship']}")


# =============================================================================
# 실행 결과 예시
# =============================================================================
"""
실행하면 다음과 같은 결과가 출력됩니다:

==================================================
1. 기본 사주팔자 계산
==================================================
1990년 5월 15일 오후 2시생:
  년주: 庚午
  월주: 辛巳
  일주: 己卯
  시주: 辛未

==================================================
2. 오행 분석
==================================================
  년주_오행: 金 火
  월주_오행: 金 火
  일주_오행: 土 木
  시주_오행: 金 土

...
"""
