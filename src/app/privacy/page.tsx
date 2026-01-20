'use client'

import { Header } from '@/components/layout'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header showBack title="개인정보처리방침" showAuth={false} />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <div className="prose prose-sm max-w-none text-text">
          <p className="text-text-muted mb-6">시행일: 2025년 1월 20일</p>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제1조 (목적)</h2>
            <p className="text-text-muted leading-relaxed">
              ChartIQ(이하 "회사")는 팔자냥 서비스(이하 "서비스") 이용자의 개인정보를 중요시하며,
              「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수하고 있습니다.
              본 개인정보처리방침은 회사가 제공하는 서비스 이용과 관련하여 개인정보의 수집, 이용, 제공, 보호에 관한 사항을 규정합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제2조 (수집하는 개인정보 항목)</h2>
            <p className="text-text-muted leading-relaxed mb-2">회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">1. 회원가입 시</p>
              <ul className="list-disc list-inside text-text-muted ml-2 mb-3">
                <li>필수: 이메일 주소</li>
                <li>선택: 프로필 사진, 닉네임</li>
              </ul>
              <p className="font-medium mb-2">2. 서비스 이용 시</p>
              <ul className="list-disc list-inside text-text-muted ml-2 mb-3">
                <li>사주 분석을 위한 생년월일, 출생시간, 성별</li>
                <li>서비스 이용 기록, 접속 로그</li>
              </ul>
              <p className="font-medium mb-2">3. 결제 시</p>
              <ul className="list-disc list-inside text-text-muted ml-2">
                <li>결제 수단 정보, 결제 내역</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제3조 (개인정보의 수집 방법)</h2>
            <p className="text-text-muted leading-relaxed">
              회사는 다음과 같은 방법으로 개인정보를 수집합니다.
            </p>
            <ul className="list-disc list-inside text-text-muted mt-2">
              <li>웹사이트 회원가입 및 서비스 이용 과정에서 이용자의 직접 입력</li>
              <li>소셜 로그인(카카오, 구글)을 통한 정보 제공 동의</li>
              <li>서비스 이용 과정에서 자동으로 생성되는 정보</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제4조 (개인정보의 이용 목적)</h2>
            <p className="text-text-muted leading-relaxed mb-2">수집된 개인정보는 다음의 목적으로 이용됩니다.</p>
            <ul className="list-disc list-inside text-text-muted">
              <li>회원 관리: 회원제 서비스 제공, 본인 확인, 부정 이용 방지</li>
              <li>서비스 제공: 사주 분석 서비스, 맞춤형 콘텐츠 제공</li>
              <li>결제 처리: 코인 충전 및 결제 처리, 환불 처리</li>
              <li>서비스 개선: 서비스 이용 통계, 신규 서비스 개발</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제5조 (개인정보의 보유 및 이용 기간)</h2>
            <p className="text-text-muted leading-relaxed mb-2">
              회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
              단, 관련 법령에 의해 보존할 필요가 있는 경우 아래와 같이 보관합니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-text-muted">
              <p className="mb-1">• 계약 또는 청약철회 등에 관한 기록: 5년</p>
              <p className="mb-1">• 대금결제 및 재화 등의 공급에 관한 기록: 5년</p>
              <p className="mb-1">• 소비자의 불만 또는 분쟁처리에 관한 기록: 3년</p>
              <p>• 접속에 관한 기록: 3개월</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제6조 (개인정보의 제3자 제공)</h2>
            <p className="text-text-muted leading-relaxed">
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc list-inside text-text-muted mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제7조 (개인정보 처리의 위탁)</h2>
            <p className="text-text-muted leading-relaxed mb-2">
              회사는 서비스 향상을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-text-muted">
              <p className="mb-1">• Supabase: 데이터베이스 관리 및 인증 서비스</p>
              <p className="mb-1">• Vercel: 웹 호스팅 서비스</p>
              <p className="mb-1">• 토스페이먼츠: 결제 처리</p>
              <p>• 카카오페이: 결제 처리</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제8조 (이용자의 권리와 행사 방법)</h2>
            <p className="text-text-muted leading-relaxed">
              이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며,
              회원 탈퇴를 통해 개인정보 삭제를 요청할 수 있습니다.
            </p>
            <ul className="list-disc list-inside text-text-muted mt-2">
              <li>개인정보 조회/수정: 마이페이지에서 직접 처리</li>
              <li>회원 탈퇴: 마이페이지에서 직접 처리 또는 고객센터 문의</li>
              <li>동의 철회: 고객센터를 통해 요청</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제9조 (쿠키의 사용)</h2>
            <p className="text-text-muted leading-relaxed">
              회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키(cookie)를 사용합니다.
              이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나,
              이 경우 서비스 이용에 어려움이 발생할 수 있습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제10조 (개인정보의 안전성 확보 조치)</h2>
            <p className="text-text-muted leading-relaxed">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc list-inside text-text-muted mt-2">
              <li>개인정보 암호화</li>
              <li>해킹 등에 대비한 기술적 대책</li>
              <li>개인정보 취급 직원의 최소화 및 교육</li>
              <li>개인정보 보호를 위한 내부 관리계획 수립 및 시행</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제11조 (개인정보 보호책임자)</h2>
            <p className="text-text-muted leading-relaxed mb-2">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-text-muted">
              <p className="font-medium text-text">개인정보 보호책임자</p>
              <p>성명: 박재호</p>
              <p>직책: 대표</p>
              <p>연락처: 010-5148-4187</p>
              <p>이메일: abc@abc.com</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제12조 (권익침해 구제방법)</h2>
            <p className="text-text-muted leading-relaxed mb-2">
              이용자는 개인정보 침해로 인한 구제를 받기 위해 아래 기관에 분쟁해결이나 상담 등을 신청할 수 있습니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-text-muted text-sm">
              <p className="mb-1">• 개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</p>
              <p className="mb-1">• 개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</p>
              <p className="mb-1">• 대검찰청 사이버수사과: (국번없이) 1301 (www.spo.go.kr)</p>
              <p>• 경찰청 사이버안전국: (국번없이) 182 (cyberbureau.police.go.kr)</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">제13조 (개인정보처리방침의 변경)</h2>
            <p className="text-text-muted leading-relaxed">
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는
              변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">부칙</h2>
            <p className="text-text-muted leading-relaxed">
              본 개인정보처리방침은 2025년 1월 20일부터 시행됩니다.
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
