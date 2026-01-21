/**
 * 마크다운 파싱 유틸리티
 */

export interface MarkdownSection {
  title: string | null
  content: string
}

/**
 * 마크다운 텍스트를 섹션별로 파싱
 * # 또는 ## 또는 ### 헤더를 기준으로 분리
 */
export function parseMarkdownSections(markdown: string): MarkdownSection[] {
  const lines = markdown.split('\n')
  const sections: MarkdownSection[] = []
  let currentSection: { title: string | null; content: string[] } = { title: null, content: [] }

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)$/)
    if (headerMatch) {
      if (currentSection.content.length > 0 || currentSection.title) {
        sections.push({
          title: currentSection.title,
          content: currentSection.content.join('\n').trim(),
        })
      }
      currentSection = { title: headerMatch[1], content: [] }
    } else {
      currentSection.content.push(line)
    }
  }

  if (currentSection.content.length > 0 || currentSection.title) {
    sections.push({
      title: currentSection.title,
      content: currentSection.content.join('\n').trim(),
    })
  }

  return sections.filter(s => s.content.trim() || s.title)
}
