'use client'

import { Header } from '@/components/layout'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header showBack title="서비스 이용약관" />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <div className="prose prose-sm max-w-none text-text">
          <p className="text-text-muted mb-6">시행일: 2025년 1월 20일</p>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제1조 (목적)</h2>
            <p className="text-text-muted leading-relaxed">
              본 약관은 ChartIQ(이하 "회사")가 제공하는 팔자냥 서비스(이하 "서비스")의 이용과 관련하여
              회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제2조 (정의)</h2>
            <p className="text-text-muted leading-relaxed mb-2">본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ul className="list-decimal list-inside text-text-muted space-y-1">
              <li>"서비스"란 회사가 제공하는 사주 분석, 운세 등 모든 서비스를 의미합니다.</li>
              <li>"회원"이란 본 약관에 동의하고 회사와 이용계약을 체결한 자를 의미합니다.</li>
              <li>"코인"이란 서비스 내에서 사주 분석 등을 이용하기 위해 사용되는 가상의 결제 수단을 의미합니다.</li>
              <li>"콘텐츠"란 서비스를 통해 제공되는 사주 분석 결과, 운세 정보 등 모든 정보를 의미합니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제3조 (약관의 게시 및 변경)</h2>
            <ul className="list-decimal list-inside text-text-muted space-y-2">
              <li>회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
              <li>회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
              <li>회사가 약관을 변경할 경우에는 적용일자 및 변경사유를 명시하여 현행 약관과 함께 서비스 초기 화면에 그 적용일자 7일 전부터 공지합니다. 다만, 회원에게 불리한 약관 변경의 경우에는 30일 전부터 공지합니다.</li>
              <li>회원이 변경된 약관에 동의하지 않는 경우 회원 탈퇴를 요청할 수 있으며, 변경된 약관의 효력 발생일 이후에도 서비스를 계속 사용할 경우 약관 변경에 동의한 것으로 간주합니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제4조 (이용계약의 체결)</h2>
            <ul className="list-decimal list-inside text-text-muted space-y-2">
              <li>이용계약은 회원이 되고자 하는 자가 본 약관에 동의하고 회원가입을 신청한 후, 회사가 이를 승낙함으로써 체결됩니다.</li>
              <li>회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                  <li>허위 정보를 기재하거나, 필수 정보를 기재하지 않은 경우</li>
                  <li>이전에 회원 자격을 상실한 적이 있는 경우</li>
                  <li>기타 회사가 정한 이용신청 요건에 미비한 경우</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제5조 (회원정보의 변경)</h2>
            <p className="text-text-muted leading-relaxed">
              회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다.
              회원은 회원가입 신청 시 기재한 사항이 변경되었을 경우 온라인으로 수정하거나 전자우편 등의 방법으로 회사에 그 변경사항을 알려야 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제6조 (회원의 의무)</h2>
            <p className="text-text-muted leading-relaxed mb-2">회원은 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-decimal list-inside text-text-muted space-y-1">
              <li>신청 또는 변경 시 허위 내용의 등록</li>
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
              <li>회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
              <li>서비스를 통해 얻은 정보를 회사의 사전 승낙 없이 복제, 유통, 조장하거나 상업적으로 이용하는 행위</li>
              <li>기타 불법적이거나 부당한 행위</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제7조 (서비스의 제공)</h2>
            <ul className="list-decimal list-inside text-text-muted space-y-2">
              <li>회사는 회원에게 다음과 같은 서비스를 제공합니다.
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>사주팔자 분석 서비스</li>
                  <li>신년운세 서비스</li>
                  <li>궁합 분석 서비스</li>
                  <li>연애운 분석 서비스</li>
                  <li>기타 회사가 추가 개발하거나 제휴를 통해 회원에게 제공하는 일체의 서비스</li>
                </ul>
              </li>
              <li>서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</li>
              <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제8조 (서비스의 변경 및 중단)</h2>
            <ul className="list-decimal list-inside text-text-muted space-y-2">
              <li>회사는 상당한 이유가 있는 경우에 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.</li>
              <li>회사는 서비스의 제공에 필요한 경우 정기점검을 실시할 수 있으며, 정기점검시간은 서비스 제공화면에 공지한 바에 따릅니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제9조 (코인 및 결제)</h2>
            <ul className="list-decimal list-inside text-text-muted space-y-2">
              <li>회원은 회사가 정한 결제 수단을 통해 코인을 충전할 수 있습니다.</li>
              <li>코인은 사주 분석 등 유료 서비스 이용 시 차감됩니다.</li>
              <li>충전된 코인은 현금으로 환급되지 않으며, 서비스 내에서만 사용 가능합니다.</li>
              <li>회사는 코인의 가격, 종류 등을 변경할 수 있으며, 변경 시 사전에 공지합니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제10조 (환불 정책)</h2>
            <p className="text-text-muted leading-relaxed mb-2">코인 환불에 관한 사항은 다음과 같습니다.</p>
            <div className="bg-gray-50 p-4 rounded-lg text-text-muted">
              <p className="font-medium text-text mb-2">환불 가능한 경우</p>
              <ul className="list-disc list-inside mb-3">
                <li>결제 후 7일 이내이며, 충전한 코인을 전혀 사용하지 않은 경우</li>
                <li>서비스 장애로 인해 코인을 정상적으로 사용하지 못한 경우</li>
              </ul>
              <p className="font-medium text-text mb-2">환불 불가능한 경우</p>
              <ul className="list-disc list-inside mb-3">
                <li>이미 사주 분석 등에 사용된 코인</li>
                <li>이벤트, 프로모션 등으로 무료로 지급받은 보너스 코인</li>
                <li>결제 후 7일이 경과한 경우</li>
              </ul>
              <p className="font-medium text-text mb-2">환불 신청 방법</p>
              <p>이메일(abc@abc.com)로 환불 신청서를 제출해 주시기 바랍니다.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제11조 (저작권의 귀속)</h2>
            <ul className="list-decimal list-inside text-text-muted space-y-2">
              <li>서비스에 대한 저작권 및 지적재산권은 회사에 귀속됩니다.</li>
              <li>회원은 서비스를 이용함으로써 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리 목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제12조 (면책조항)</h2>
            <ul className="list-decimal list-inside text-text-muted space-y-2">
              <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 인해 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
              <li>회사는 서비스를 통해 제공되는 사주 분석 결과 및 운세 정보의 정확성, 신뢰성에 대해 보증하지 않으며, 이를 기반으로 한 회원의 판단과 행위에 대해 책임을 지지 않습니다.</li>
              <li>회사가 제공하는 서비스는 오락 및 참고 목적으로만 제공되며, 전문적인 조언을 대체할 수 없습니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제13조 (계약 해지 및 이용 제한)</h2>
            <ul className="list-decimal list-inside text-text-muted space-y-2">
              <li>회원은 언제든지 서비스 내 탈퇴 기능을 통해 이용계약 해지를 신청할 수 있으며, 회사는 즉시 회원 탈퇴를 처리합니다.</li>
              <li>회사는 회원이 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우 사전 통보 후 이용계약을 해지하거나 서비스 이용을 제한할 수 있습니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제14조 (분쟁해결)</h2>
            <ul className="list-decimal list-inside text-text-muted space-y-2">
              <li>회사는 회원이 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 고객센터를 운영합니다.</li>
              <li>본 약관에 명시되지 않은 사항은 관계법령 및 상관례에 따릅니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제15조 (재판권 및 준거법)</h2>
            <ul className="list-decimal list-inside text-text-muted space-y-2">
              <li>회사와 회원 간에 발생한 분쟁에 관한 소송은 수원지방법원을 관할법원으로 합니다.</li>
              <li>회사와 회원 간에 제기된 소송에는 대한민국 법률을 적용합니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">부칙</h2>
            <p className="text-text-muted leading-relaxed">
              본 약관은 2025년 1월 20일부터 시행됩니다.
            </p>
          </section>

          <section className="border-t pt-6 mt-8">
            <h2 className="text-lg font-bold mb-3">사업자 정보</h2>
            <div className="text-text-muted">
              <p>상호: ChartIQ</p>
              <p>대표자: 박재호</p>
              <p>주소: 동탄지성로 295</p>
              <p>연락처: 010-5148-4187</p>
              <p>이메일: abc@abc.com</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
