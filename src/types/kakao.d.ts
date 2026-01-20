// 카카오 JavaScript SDK 타입 선언

interface KakaoShareButton {
  container: string
  objectType: 'feed' | 'list' | 'location' | 'commerce' | 'text'
  content: {
    title: string
    description: string
    imageUrl: string
    link: {
      mobileWebUrl: string
      webUrl: string
    }
  }
  social?: {
    likeCount?: number
    commentCount?: number
    sharedCount?: number
  }
  buttons?: Array<{
    title: string
    link: {
      mobileWebUrl: string
      webUrl: string
    }
  }>
}

interface KakaoShareDefault {
  objectType: 'feed' | 'list' | 'location' | 'commerce' | 'text'
  content: {
    title: string
    description: string
    imageUrl: string
    link: {
      mobileWebUrl: string
      webUrl: string
    }
  }
  social?: {
    likeCount?: number
    commentCount?: number
    sharedCount?: number
  }
  buttons?: Array<{
    title: string
    link: {
      mobileWebUrl: string
      webUrl: string
    }
  }>
}

interface KakaoLink {
  sendDefault: (settings: KakaoShareDefault) => void
  createDefaultButton: (settings: KakaoShareButton) => void
}

interface KakaoShare {
  sendDefault: (settings: KakaoShareDefault) => void
  createDefaultButton: (settings: KakaoShareButton) => void
}

interface Kakao {
  init: (appKey: string) => void
  isInitialized: () => boolean
  Link: KakaoLink
  Share: KakaoShare
}

declare global {
  interface Window {
    Kakao: Kakao
  }
}

export {}
