/**
 * Supabase 및 일반 에러 메시지를 한국어로 변환
 */

// Supabase Auth 에러 메시지 매핑
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않아요',
  'Email not confirmed': '이메일 인증이 필요해요. 메일함을 확인해주세요',
  'User already registered': '이미 가입된 이메일이에요',
  'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 해요',
  'Unable to validate email address: invalid format': '올바른 이메일 형식이 아니에요',
  'Email rate limit exceeded': '너무 많은 요청이 있었어요. 잠시 후 다시 시도해주세요',
  'For security purposes, you can only request this once every 60 seconds': '보안을 위해 60초에 한 번만 요청할 수 있어요',
  'New password should be different from the old password': '새 비밀번호는 이전과 달라야 해요',
  'Auth session missing!': '로그인이 필요해요',
  'JWT expired': '세션이 만료되었어요. 다시 로그인해주세요',
  'Token is expired or invalid': '인증 토큰이 만료되었어요. 다시 시도해주세요',
}

// Supabase Database 에러 메시지 매핑
const DB_ERROR_MESSAGES: Record<string, string> = {
  'duplicate key value violates unique constraint': '이미 존재하는 데이터예요',
  'violates foreign key constraint': '연관된 데이터가 있어서 삭제할 수 없어요',
  'violates not-null constraint': '필수 정보가 누락되었어요',
  'value too long for type': '입력값이 너무 길어요',
  'invalid input syntax': '올바르지 않은 형식이에요',
  'permission denied': '권한이 없어요',
  'relation does not exist': '데이터를 찾을 수 없어요',
}

// 일반 HTTP 에러 매핑
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: '요청이 올바르지 않아요',
  401: '로그인이 필요해요',
  403: '권한이 없어요',
  404: '찾을 수 없어요',
  409: '이미 처리된 요청이에요',
  429: '너무 많은 요청이 있었어요. 잠시 후 다시 시도해주세요',
  500: '서버 오류가 발생했어요. 잠시 후 다시 시도해주세요',
  502: '서버 연결에 실패했어요',
  503: '서비스가 일시적으로 불가능해요',
}

/**
 * 에러 메시지를 한국어로 변환
 */
export function getKoreanErrorMessage(error: unknown): string {
  // null/undefined 처리
  if (!error) {
    return '알 수 없는 오류가 발생했어요'
  }

  // 문자열 에러
  if (typeof error === 'string') {
    // Auth 에러 매핑 확인
    if (AUTH_ERROR_MESSAGES[error]) {
      return AUTH_ERROR_MESSAGES[error]
    }

    // DB 에러 매핑 확인 (부분 매칭)
    for (const [key, message] of Object.entries(DB_ERROR_MESSAGES)) {
      if (error.toLowerCase().includes(key.toLowerCase())) {
        return message
      }
    }

    // 이미 한글이면 그대로 반환
    if (/[가-힣]/.test(error)) {
      return error
    }

    return '오류가 발생했어요'
  }

  // Error 객체
  if (error instanceof Error) {
    return getKoreanErrorMessage(error.message)
  }

  // Supabase AuthError 형태 (message 속성 존재)
  if (typeof error === 'object' && 'message' in error) {
    const errorObj = error as { message: string; status?: number; code?: string }

    // message 기반 매핑
    if (AUTH_ERROR_MESSAGES[errorObj.message]) {
      return AUTH_ERROR_MESSAGES[errorObj.message]
    }

    // status 코드 기반 매핑
    if (errorObj.status && HTTP_ERROR_MESSAGES[errorObj.status]) {
      return HTTP_ERROR_MESSAGES[errorObj.status]
    }

    // DB 에러 매핑 확인 (부분 매칭)
    for (const [key, message] of Object.entries(DB_ERROR_MESSAGES)) {
      if (errorObj.message.toLowerCase().includes(key.toLowerCase())) {
        return message
      }
    }

    // 이미 한글이면 그대로 반환
    if (/[가-힣]/.test(errorObj.message)) {
      return errorObj.message
    }
  }

  return '오류가 발생했어요'
}

/**
 * HTTP 상태 코드로부터 한국어 메시지 반환
 */
export function getHttpErrorMessage(status: number): string {
  return HTTP_ERROR_MESSAGES[status] || '오류가 발생했어요'
}
