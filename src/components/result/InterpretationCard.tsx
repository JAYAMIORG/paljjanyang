'use client'

import { Card } from '@/components/ui'
import { parseMarkdownSections } from '@/lib/utils/markdown'

interface InterpretationCardProps {
  content: string
}

/**
 * LLM 해석 결과를 섹션별로 카드 형태로 표시하는 컴포넌트
 */
export function InterpretationCard({ content }: InterpretationCardProps) {
  const sections = parseMarkdownSections(content)

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <Card key={index}>
          {section.title && (
            <h3 className="text-subheading font-semibold text-text mb-3">
              {section.title}
            </h3>
          )}
          <div className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
            {section.content}
          </div>
        </Card>
      ))}
    </div>
  )
}
