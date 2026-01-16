# 팔자냥 API 명세서

> 작성일: 2025-01-15
> 최종 업데이트: 2025-01-16
> Backend: Next.js API Routes (TypeScript)
> Base URL: `https://bazi-azure.vercel.app/api`

## 구현 현황

| 엔드포인트 | 상태 | 설명 |
|-----------|------|------|
| POST /api/saju/calculate | ✅ 완료 | 사주팔자 계산 |
| POST /api/saju/interpret | ✅ 완료 | LLM 해석 |
| POST /api/saju/save | ✅ 완료 | 결과 저장 |
| GET /api/saju/history | ✅ 완료 | 조회 기록 |
| POST /api/saju/use-coin | ✅ 완료 | 코인 차감 |
| GET /api/coin/balance | ✅ 완료 | 코인 잔액 |
| GET /api/coin/packages | ✅ 완료 | 패키지 목록 |
| GET /api/persons | ✅ 완료 | 인물 목록 |
| POST /api/persons | ✅ 완료 | 인물 저장 |
| POST /api/payment/initiate | ✅ 완료 | 결제 시작 |
| POST /api/payment/confirm | ✅ 완료 | 결제 확인 |

---

## 1. 개요

### 1.1 인증

모든 API는 Supabase Auth JWT 토큰을 사용합니다.

```
Authorization: Bearer <access_token>
```

### 1.2 공통 응답 형식

**성공 응답**
```json
{
  "success": true,
  "data": { ... }
}
```

**에러 응답**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_COINS",
    "message": "코인이 부족합니다. 필요: 1, 보유: 0.5"
  }
}
```

### 1.3 에러 코드

| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 422 | 입력값 오류 |
| `INSUFFICIENT_COINS` | 400 | 코인 부족 |
| `INVALID_REWARD` | 400 | 유효하지 않은 리워드 |
| `PAYMENT_FAILED` | 400 | 결제 실패 |
| `READING_FAILED` | 500 | 사주 분석 실패 |
| `RATE_LIMIT` | 429 | 요청 제한 초과 |

---

## 2. 인증 (Auth)

> Supabase Auth를 사용하므로 별도 백엔드 API 없음.
> 프론트엔드에서 Supabase SDK로 직접 처리.

### 지원 인증 방식

- 카카오 OAuth
- 구글 OAuth
- 이메일/비밀번호

### 참고 문서
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

## 3. 프로필 (Profile)

### 3.1 내 프로필 조회

```
GET /profile
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nickname": "냥이",
    "avatar_url": "https://...",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

---

### 3.2 프로필 수정

```
PATCH /profile
```

**Request Body**
```json
{
  "nickname": "새닉네임",
  "avatar_url": "https://..."
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nickname": "새닉네임",
    "avatar_url": "https://...",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

---

## 4. 인물 정보 (Person)

### 4.1 저장된 인물 목록 조회

```
GET /persons
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| relationship | string | X | 필터: self, partner, family, friend, other |

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "나",
      "relationship": "self",
      "birth_year": 1995,
      "birth_month": 3,
      "birth_day": 15,
      "birth_hour": 14,
      "is_lunar": false,
      "is_leap_month": false,
      "gender": "female",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### 4.2 인물 상세 조회

```
GET /persons/{person_id}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "나",
    "relationship": "self",
    "birth_year": 1995,
    "birth_month": 3,
    "birth_day": 15,
    "birth_hour": 14,
    "is_lunar": false,
    "is_leap_month": false,
    "gender": "female",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

---

### 4.3 인물 등록

```
POST /persons
```

**Request Body**
```json
{
  "name": "연인",
  "relationship": "partner",
  "birth_year": 1993,
  "birth_month": 7,
  "birth_day": 22,
  "birth_hour": null,
  "is_lunar": false,
  "is_leap_month": false,
  "gender": "male"
}
```

**Validation Rules**
- `name`: 1-50자
- `relationship`: self, partner, family, friend, other 중 하나
- `birth_year`: 1900-현재년도
- `birth_month`: 1-12
- `birth_day`: 1-31
- `birth_hour`: null 또는 0-23
- `gender`: male, female 중 하나

**Response**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "연인",
    ...
  }
}
```

---

### 4.4 인물 수정

```
PATCH /persons/{person_id}
```

**Request Body** (수정할 필드만)
```json
{
  "name": "새이름",
  "birth_hour": 10
}
```

---

### 4.5 인물 삭제

```
DELETE /persons/{person_id}
```

**Response**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

## 5. 사주 분석 (Reading)

### 5.1 사주 분석 요청

```
POST /readings
```

**Request Body** (개인 사주)
```json
{
  "type": "personal",
  "person1_id": "uuid",
  "reward_id": null
}
```

**Request Body** (신년운세)
```json
{
  "type": "yearly",
  "person1_id": "uuid",
  "yearly_year": 2025,
  "reward_id": null
}
```

**Request Body** (궁합)
```json
{
  "type": "compatibility",
  "person1_id": "uuid",
  "person2_id": "uuid"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| type | string | O | personal, yearly, compatibility, love |
| person1_id | uuid | O | 첫 번째 인물 ID |
| person2_id | uuid | X | 두 번째 인물 ID (궁합 시 필수) |
| yearly_year | int | X | 운세 대상 연도 (yearly 시 필수, 기본: 현재년도) |
| reward_id | uuid | X | 사용할 리워드 ID (무료 사용 시) |

**비용**
- 리워드 사용 시: 무료
- 일반: 1 코인

**Response**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "personal",
    "status": "processing",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

**Error Cases**
- `INSUFFICIENT_COINS`: 코인 부족
- `INVALID_REWARD`: 유효하지 않거나 만료된 리워드
- `VALIDATION_ERROR`: 궁합인데 person2_id 누락

---

### 5.2 사주 결과 조회

```
GET /readings/{reading_id}
```

**Response** (완료 시)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "personal",
    "status": "completed",

    "person1": {
      "id": "uuid",
      "name": "나",
      "birth_year": 1995,
      "birth_month": 3,
      "birth_day": 15,
      "birth_hour": 14,
      "gender": "female"
    },

    "saju": {
      "bazi": {
        "year": "乙亥",
        "month": "己卯",
        "day": "甲辰",
        "time": "辛未"
      },
      "korean_ganji": "을해년 기묘월 갑진일 신미시",
      "day_master": "甲",
      "wuxing": {
        "wood": 30,
        "fire": 10,
        "earth": 25,
        "metal": 15,
        "water": 20
      }
    },

    "interpretation": {
      "summary": "갑목 일간으로 봄에 태어나 기운이 왕성합니다...",
      "sections": [
        {
          "title": "타고난 성격",
          "content": "곧고 정직한 성품을 지녔습니다..."
        },
        {
          "title": "2025년 운세",
          "content": "을사년은 비견의 해로..."
        },
        {
          "title": "조언",
          "content": "올해는 새로운 시작보다..."
        }
      ],
      "keywords": ["리더십", "창의성", "성장"],
      "lucky": {
        "color": "파란색",
        "number": 3,
        "direction": "동쪽"
      }
    },

    "share_summary": "나는 봄의 기운을 받은 갑목! 곧은 성품과 리더십이 강점이에요.",

    "coins_used": 1,
    "is_free": false,
    "created_at": "2025-01-15T10:00:00Z",
    "completed_at": "2025-01-15T10:00:05Z"
  }
}
```

**Response** (궁합일 때 추가 필드)
```json
{
  "data": {
    "type": "compatibility",
    "person2": { ... },
    "saju2": { ... },
    "compatibility_score": 85,
    "interpretation": {
      "summary": "두 분의 궁합은 85점입니다...",
      "sections": [
        { "title": "전체 궁합", "content": "..." },
        { "title": "성격 궁합", "content": "..." },
        { "title": "연애 스타일", "content": "..." },
        { "title": "갈등 포인트", "content": "..." },
        { "title": "조언", "content": "..." }
      ]
    }
  }
}
```

**Response** (신년운세일 때 추가 필드)
```json
{
  "data": {
    "type": "yearly",
    "yearly_year": 2025,

    "yearly_fortune": {
      "summary": "2025년은 변화와 도약의 해입니다...",
      "yearly_theme": "도약과 성장",

      "monthly": [
        {
          "month": 1,
          "score": 3,
          "fortune": "새해의 시작과 함께 계획 수립에 좋은 달입니다.",
          "advice": "큰 결정보다는 준비에 집중하세요."
        },
        {
          "month": 2,
          "score": 4,
          "fortune": "대인관계 운이 상승합니다.",
          "advice": "적극적인 네트워킹을 추천합니다."
        }
      ],

      "best_months": [5, 9],
      "caution_months": [3, 7],

      "categories": {
        "wealth": {
          "summary": "전반적으로 안정적인 재물운...",
          "advice": "하반기 투자에 주의..."
        },
        "love": {
          "summary": "새로운 만남의 기회가...",
          "advice": "5월과 9월에 좋은 인연이..."
        },
        "career": {
          "summary": "직장 내 변화가 예상되며...",
          "advice": "상반기에 이직 기회가..."
        },
        "health": {
          "summary": "체력 관리에 신경 써야...",
          "advice": "3월, 7월 건강 주의..."
        }
      }
    },

    "share_summary": "나의 2025년 키워드는 '도약과 성장'! 5월과 9월이 행운의 달이에요."
  }
}
```

---

### 5.3 내 사주 기록 목록

```
GET /readings
```

**Query Parameters**
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| type | string | X | 필터: personal, yearly, compatibility, love |
| limit | int | 20 | 조회 개수 (max 50) |
| offset | int | 0 | 오프셋 |

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "type": "personal",
        "status": "completed",
        "person1_name": "나",
        "person2_name": null,
        "korean_ganji": "을해년 기묘월 갑진일",
        "summary": "갑목 일간으로 봄에 태어나...",
        "created_at": "2025-01-15T10:00:00Z"
      }
    ],
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 5.4 사주 결과 삭제

```
DELETE /readings/{reading_id}
```

**Response**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

## 6. 사주 계산 (Saju) - 내부 API

> 이 API는 Reading 생성 시 내부적으로 호출됩니다.
> 직접 호출 가능하지만 코인 차감 없이 계산만 수행합니다.

### 6.1 사주팔자 계산

```
POST /saju/calculate
```

**Request Body**
```json
{
  "birth_year": 1995,
  "birth_month": 3,
  "birth_day": 15,
  "birth_hour": 14,
  "is_lunar": false,
  "is_leap_month": false,
  "gender": "female"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "bazi": {
      "year": "乙亥",
      "month": "己卯",
      "day": "甲辰",
      "time": "辛未"
    },
    "korean_ganji": "을해년 기묘월 갑진일 신미시",
    "day_master": "甲",
    "wuxing": {
      "wood": 30,
      "fire": 10,
      "earth": 25,
      "metal": 15,
      "water": 20
    },
    "shishen": {
      "year_gan": "비견",
      "month_gan": "정재",
      "time_gan": "정관"
    },
    "dayun": [
      { "start_age": 3, "end_age": 12, "ganzhi": "庚辰" },
      { "start_age": 13, "end_age": 22, "ganzhi": "辛巳" }
    ]
  }
}
```

---

### 6.2 음력 변환

```
POST /saju/convert-lunar
```

**Request Body**
```json
{
  "year": 1995,
  "month": 2,
  "day": 15,
  "is_leap_month": false
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "solar_date": "1995-03-15",
    "lunar_date": "1995-02-15",
    "is_leap_month": false
  }
}
```

---

## 7. 코인 (Coin)

### 7.1 코인 잔액 조회

```
GET /coins/balance
```

**Response**
```json
{
  "success": true,
  "data": {
    "balance": 5.5,
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

---

### 7.2 코인 거래 내역

```
GET /coins/transactions
```

**Query Parameters**
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| type | string | X | purchase, spend, reward, refund |
| limit | int | 20 | 조회 개수 |
| offset | int | 0 | 오프셋 |

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "type": "spend",
        "amount": -1,
        "description": "personal 사주",
        "balance_after": 4.5,
        "created_at": "2025-01-15T10:00:00Z"
      },
      {
        "id": "uuid",
        "type": "purchase",
        "amount": 5.5,
        "description": "코인 충전",
        "balance_after": 5.5,
        "created_at": "2025-01-15T09:00:00Z"
      }
    ],
    "total": 10
  }
}
```

---

### 7.3 코인 패키지 목록

```
GET /coins/packages
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "1 코인",
      "coins": 1,
      "bonus_coins": 0,
      "total_coins": 1,
      "price": 1500,
      "price_per_coin": 1500
    },
    {
      "id": "uuid",
      "name": "5 코인",
      "coins": 5,
      "bonus_coins": 0.5,
      "total_coins": 5.5,
      "price": 6500,
      "price_per_coin": 1182
    },
    {
      "id": "uuid",
      "name": "10 코인",
      "coins": 10,
      "bonus_coins": 2,
      "total_coins": 12,
      "price": 12000,
      "price_per_coin": 1000
    }
  ]
}
```

---

## 8. 결제 (Payment)

### 8.1 결제 요청 생성

```
POST /payments
```

**Request Body**
```json
{
  "package_id": "uuid",
  "method": "toss"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| package_id | uuid | 코인 패키지 ID |
| method | string | toss, kakao |

**Response**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "order_id": "PJY-20250115-xxxxx",
    "amount": 6500,
    "checkout_url": "https://pay.toss.im/...",
    "expires_at": "2025-01-15T10:30:00Z"
  }
}
```

---

### 8.2 결제 완료 처리 (Webhook/Callback)

```
POST /payments/{payment_id}/confirm
```

**Request Body**
```json
{
  "payment_key": "toss_payment_key_xxxxx"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "status": "completed",
    "coins_added": 5.5,
    "new_balance": 10.5
  }
}
```

---

### 8.3 결제 내역 조회

```
GET /payments
```

**Query Parameters**
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| status | string | X | pending, completed, failed, refunded |
| limit | int | 20 | 조회 개수 |

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "amount": 6500,
        "method": "toss",
        "status": "completed",
        "package_name": "5 코인",
        "coins_purchased": 5.5,
        "created_at": "2025-01-15T09:00:00Z",
        "completed_at": "2025-01-15T09:01:00Z"
      }
    ],
    "total": 3
  }
}
```

---

## 9. 공유 및 리워드 (Share & Reward)

### 9.1 공유 등록 (리워드 발급)

```
POST /readings/{reading_id}/share
```

**Request Body**
```json
{
  "platform": "instagram"
}
```

| platform | 설명 |
|----------|------|
| instagram | 인스타그램 스토리/피드 |
| kakao | 카카오톡 |
| twitter | 트위터 |
| facebook | 페이스북 |
| link | 링크 복사 |

**Response** (리워드 발급됨)
```json
{
  "success": true,
  "data": {
    "share_id": "uuid",
    "reward_issued": true,
    "reward": {
      "id": "uuid",
      "type": "share",
      "expires_at": "2025-02-14T10:00:00Z"
    }
  }
}
```

**Response** (월 제한 초과 - 리워드 미발급)
```json
{
  "success": true,
  "data": {
    "share_id": "uuid",
    "reward_issued": false,
    "message": "이번 달 공유 리워드를 이미 받으셨습니다. 다음 달에 다시 받을 수 있어요!"
  }
}
```

---

### 9.2 내 리워드 목록

```
GET /rewards
```

**Query Parameters**
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| status | string | active | active, used, expired |

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "share",
      "status": "active",
      "valid_for": null,
      "expires_at": "2025-02-14T10:00:00Z",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### 9.3 공유 이미지 생성

```
GET /readings/{reading_id}/share-image
```

**Query Parameters**
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| format | string | png | png, jpg |
| size | string | story | story (1080x1920), square (1080x1080) |

**Response**
- Content-Type: image/png
- 이미지 바이너리 데이터

또는 URL 반환 방식:
```json
{
  "success": true,
  "data": {
    "image_url": "https://cdn.paljjanyang.com/shares/xxxxx.png",
    "expires_at": "2025-01-15T11:00:00Z"
  }
}
```

---

## 10. 기타

### 10.1 헬스 체크

```
GET /health
```

**Response**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

---

## 11. 요약 테이블

### 11.1 전체 엔드포인트

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | /profile | 내 프로필 조회 | O |
| PATCH | /profile | 프로필 수정 | O |
| GET | /persons | 인물 목록 | O |
| GET | /persons/{id} | 인물 상세 | O |
| POST | /persons | 인물 등록 | O |
| PATCH | /persons/{id} | 인물 수정 | O |
| DELETE | /persons/{id} | 인물 삭제 | O |
| POST | /readings | 사주 분석 요청 | O |
| GET | /readings | 사주 기록 목록 | O |
| GET | /readings/{id} | 사주 결과 조회 | O |
| DELETE | /readings/{id} | 사주 결과 삭제 | O |
| POST | /saju/calculate | 사주 계산 | O |
| POST | /saju/convert-lunar | 음력 변환 | O |
| GET | /coins/balance | 코인 잔액 | O |
| GET | /coins/transactions | 거래 내역 | O |
| GET | /coins/packages | 패키지 목록 | X |
| POST | /payments | 결제 요청 | O |
| POST | /payments/{id}/confirm | 결제 완료 | O |
| GET | /payments | 결제 내역 | O |
| POST | /readings/{id}/share | 공유 등록 | O |
| GET | /readings/{id}/share-image | 공유 이미지 | O |
| GET | /rewards | 리워드 목록 | O |
| GET | /health | 헬스 체크 | X |

### 11.2 사주 유형 (reading_type)

| 타입 | 설명 | 필수 파라미터 |
|------|------|---------------|
| `personal` | 개인 사주 (인생 전체 분석) | person1_id |
| `yearly` | 신년운세 (올해 월별 운세) | person1_id, yearly_year |
| `compatibility` | 궁합 | person1_id, person2_id |
| `love` | 연애운 | person1_id |

### 11.3 코인 비용

| 항목 | 비용 |
|------|------|
| 사주 분석 (모든 유형) | 1 코인 |

### 11.4 무료 제공

| 항목 | 설명 |
|------|------|
| 공유 리워드 | 월 1회, 30일 유효, 무료 사주 1회 |

---

## 12. 구현 순서 (권장)

1. **Phase 1 - 기본**
   - 헬스 체크
   - Profile API
   - Person CRUD API
   - Saju 계산 API

2. **Phase 2 - 핵심**
   - Coin 잔액/내역 API
   - Coin 패키지 API
   - Reading 생성/조회 API

3. **Phase 3 - 결제**
   - Payment API (토스페이먼츠 연동)
   - 코인 충전 플로우

4. **Phase 4 - 부가**
   - Share/Reward API
   - 공유 이미지 생성

---

## 13. FastAPI 구조 (예시)

```
backend/
├── app/
│   ├── main.py              # FastAPI 앱
│   ├── config.py            # 설정
│   ├── dependencies.py      # 의존성 (인증 등)
│   │
│   ├── routers/
│   │   ├── profile.py
│   │   ├── persons.py
│   │   ├── readings.py
│   │   ├── saju.py
│   │   ├── coins.py
│   │   ├── payments.py
│   │   └── shares.py
│   │
│   ├── services/
│   │   ├── saju_calculator.py   # 사주 계산 (lunar_python)
│   │   ├── llm_interpreter.py   # LLM 해석
│   │   └── payment_service.py   # 결제 처리
│   │
│   ├── schemas/
│   │   ├── profile.py
│   │   ├── person.py
│   │   ├── reading.py
│   │   └── ...
│   │
│   └── utils/
│       ├── supabase.py      # Supabase 클라이언트
│       └── image_generator.py
│
├── tests/
└── requirements.txt
```
