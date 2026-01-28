'use client'

import { Header } from '@/components/layout'
import { Card } from '@/components/ui'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header showBack useHistoryBack title="환불 정책" showAuth={false} />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <div className="prose prose-sm max-w-none text-text">
          <p className="text-text-muted mb-6">시행일: 2026년 1월 20일</p>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">환불 정책 안내</h2>
            <p className="text-text-muted leading-relaxed">
              ChartIQ(이하 "회사")의 팔자냥 서비스(이하 "서비스")에서 제공하는 코인 상품의 환불에 관한 정책입니다.
              본 정책은 「전자상거래 등에서의 소비자보호에 관한 법률」 및 관련 법령을 준수합니다.
            </p>
          </section>

          <Card variant="highlighted" className="mb-8">
            <h3 className="text-base font-bold mb-4 text-primary">환불 가능한 경우</h3>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span><strong>미사용 코인 환불:</strong> 결제 후 7일 이내이며, 충전한 코인을 전혀 사용하지 않은 경우 전액 환불이 가능합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span><strong>서비스 장애:</strong> 회사의 귀책사유로 인한 서비스 장애로 코인을 정상적으로 사용하지 못한 경우 환불이 가능합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span><strong>중복 결제:</strong> 동일한 상품이 중복 결제된 경우, 중복 결제분에 대해 환불이 가능합니다.</span>
              </li>
            </ul>
          </Card>

          <Card className="mb-8">
            <h3 className="text-base font-bold mb-4 text-red-500">환불 불가능한 경우</h3>
            <ul className="space-y-3 text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">1.</span>
                <span><strong>사용된 코인:</strong> 사주 분석, 운세 조회 등 서비스 이용에 사용된 코인은 환불되지 않습니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">2.</span>
                <span><strong>보너스 코인:</strong> 이벤트, 프로모션, 패키지 구매 시 추가로 지급된 보너스 코인은 환불 대상에서 제외됩니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">3.</span>
                <span><strong>기간 경과:</strong> 결제일로부터 7일이 경과한 경우 환불이 불가능합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">4.</span>
                <span><strong>부분 사용:</strong> 충전한 코인 중 일부라도 사용한 경우, 미사용분에 대한 부분 환불은 불가능합니다.</span>
              </li>
            </ul>
          </Card>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">환불 금액 산정</h2>
            <div className="bg-gray-50 p-4 rounded-lg text-text-muted">
              <ul className="space-y-2">
                <li>• 환불 금액은 실제 결제 금액을 기준으로 산정됩니다.</li>
                <li>• 할인 또는 프로모션 적용 시, 할인된 금액을 기준으로 환불됩니다.</li>
                <li>• 결제 수수료는 환불 금액에서 차감될 수 있습니다.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">환불 신청 방법</h2>
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-text-muted mb-4">
                환불을 원하시는 경우, 아래 이메일로 환불 신청서를 보내주세요.
              </p>
              <div className="bg-white p-4 rounded-lg border">
                <p className="font-medium text-text mb-2">환불 신청 이메일</p>
                <p className="text-primary font-bold text-lg">abc@abc.com</p>
              </div>
              <div className="mt-4 text-text-muted text-sm">
                <p className="font-medium text-text mb-2">신청 시 필요한 정보:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>회원 이메일 주소</li>
                  <li>결제일시 및 결제 금액</li>
                  <li>환불 사유</li>
                  <li>환불 받으실 계좌 정보 (은행명, 계좌번호, 예금주)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">환불 처리 기간</h2>
            <ul className="list-disc list-inside text-text-muted space-y-2">
              <li>환불 신청 접수 후 영업일 기준 3~5일 이내에 환불 여부를 안내드립니다.</li>
              <li>환불 승인 후 결제 수단에 따라 3~7 영업일 이내에 환불 처리됩니다.</li>
              <li>카드 결제의 경우 카드사 사정에 따라 환불 처리 기간이 다소 지연될 수 있습니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">결제 취소</h2>
            <p className="text-text-muted leading-relaxed">
              결제 후 코인이 지급되기 전에 결제 취소를 원하시는 경우,
              결제 수단의 취소 기능을 이용하시거나 고객센터로 즉시 연락해 주시기 바랍니다.
              결제 취소는 코인 지급 전에만 가능합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">기타 사항</h2>
            <ul className="list-disc list-inside text-text-muted space-y-2">
              <li>본 환불 정책은 관련 법령의 범위 내에서 적용됩니다.</li>
              <li>환불 정책은 서비스 운영 상황에 따라 변경될 수 있으며, 변경 시 사전에 공지합니다.</li>
              <li>본 정책에 명시되지 않은 사항은 「전자상거래 등에서의 소비자보호에 관한 법률」 및 관련 법령에 따릅니다.</li>
            </ul>
          </section>

          <section className="border-t pt-6 mt-8">
            <h2 className="text-lg font-bold mb-3">문의처</h2>
            <div className="text-text-muted">
              <p>상호: ChartIQ</p>
              <p>대표자: 박재호</p>
              <p>이메일: abc@abc.com</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
