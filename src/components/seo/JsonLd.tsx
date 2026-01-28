export function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://palzza.app'

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ChartIQ',
    url: baseUrl,
    logo: `${baseUrl}/images/logo-opened.webp`,
    description: '프리미엄 사주 서비스를 제공하는 ChartIQ입니다.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+82-10-5148-4187',
      contactType: 'customer service',
      availableLanguage: 'Korean',
    },
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'ChartIQ',
    image: `${baseUrl}/images/logo-opened.webp`,
    '@id': baseUrl,
    url: baseUrl,
    telephone: '010-5148-4187',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '동탄지성로 295',
      addressLocality: '화성시',
      addressRegion: '경기도',
      addressCountry: 'KR',
    },
    priceRange: '₩₩',
  }

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '팔자냥',
    alternateName: ['팔자냥 사주', 'Paljjanyang'],
    url: baseUrl,
    description: '880원으로 보는 프리미엄 사주 서비스. 개인 사주, 신년운세, 궁합, 연애운을 상세하게 풀이해드립니다.',
    inLanguage: 'ko-KR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/home`,
      },
    },
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '팔자냥 사주 서비스',
    serviceType: 'Fortune Telling Service',
    provider: {
      '@type': 'Organization',
      name: 'ChartIQ',
    },
    description: '만세력 기반 정통 사주팔자 분석 서비스. 개인 사주, 신년운세, 궁합, 연애운을 상세하게 풀이해드립니다.',
    offers: {
      '@type': 'Offer',
      price: '880',
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '사주 서비스 목록',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '개인 사주',
            description: '사주팔자와 대운을 기반으로 한 인생 전체 분석',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '2026 신년운세',
            description: '세운과 월운을 기반으로 한 올해 월별 운세',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '궁합',
            description: '두 사람의 사주 궁합 분석',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '연애운',
            description: '연애와 결혼 관련 운세 분석',
          },
        },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  )
}
