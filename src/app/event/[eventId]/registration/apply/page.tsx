"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { getAgreementData } from "./shared/api/event";
import { useState } from "react";
import Link from "next/link";

export default function ApplyPage({ params }: { params: { eventId: string } }) {
  const agreementData = getAgreementData(params.eventId);
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <SubmenuLayout 
      eventId={params.eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "신청하기"
      }}
    >
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* 상단 면책조항 박스 */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-center">
              * 나는 {agreementData.eventName}에 참가하면서, {agreementData.organizationName}가 규정하는 참가자 동의사항에 대해 다음과 같이 동의하고 확인합니다.
            </p>
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="bg-white p-6 mb-6">
            {/* 헤더 섹션 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3 sm:mb-0">
                참가자 유의사항
              </h1>
            </div>
            
            <hr className="border-black mb-6" style={{ borderWidth: '1.7px' }} />
            
            {/* 상세 내용 */}
            <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
              <div className="flex items-start space-x-2">
                <span className="text-gray-700 flex-shrink-0">•</span>
                <span className="text-gray-700">천재지변(자연재해) 및 전쟁, 국가비상상태, 재난(전염병(질병)) 등으로 인하여 대회가 취소될시 참가금 환불 안됨. (단, 기념품 배송)</span>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="text-gray-700 flex-shrink-0">•</span>
                <span className="text-gray-700">고혈압, 심근검색, 심장병, 당뇨, 기타질병으로 인하여 대회 사망시 주최측에서 책임을 지지 않으며, 보험혜택을 받을 수 없습니다.</span>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="text-gray-700 flex-shrink-0">•</span>
                <span className="text-gray-700">종목별 제한시간이 초과 된 경우 시상에서 제외됩니다.</span>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="text-gray-700 flex-shrink-0">•</span>
                <span className="text-gray-700">애완동물 동반 참가불가</span>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="text-gray-700 flex-shrink-0">•</span>
                <span className="text-gray-700">택배배송 : 주최측 부담일 경우 기념품, 책자, 배번호, 칩 일괄배송(대회 사정상 변경될 수 있습니다.)</span>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="text-gray-700 flex-shrink-0">•</span>
                <span className="text-gray-700">수신자 부담일 경우 대회당일 현장 배부 (대회 미참가 시 수신자 부담으로 기념품 배송)</span>
              </div>
            </div>
          </div>

          {/* 약관 섹션 */}
          <div className="bg-white p-6 mb-6">
            {/* 약관 헤더 */}
            <div className="text-left mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">약관</h2>
              <hr className="border-black mb-3" style={{ borderWidth: '1.7px' }} />
            </div>
            
            <p className="text-sm sm:text-base text-gray-900">※ 마라톤대회 신청 약관(필독)</p>
            {/* 약관 내용 */}
            <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-[250px]">
              <p className="font-bold text-gray-800 mb-4">
                안전한 레이스를 위한 안내 사항 (필독)!!!
              </p>
              
              <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                <p>
                  뛰는 동안 자신의 몸 상태를 확인하고 이상이 있는 경우 뛰는 것을 바로 멈춰야 합니다.<br />
                  (달리는 도중 어지러움, 가슴 통증, 심한 숨 가쁨, 극심한 피로감, 근육 경련, 탈수 등의 증상)<br />
                  무리하게 달리면 심각한 경우 쓰러지거나 심근경색 등 심혈관계 질환의 가능성이 있으므로<br />
                  달리기를 멈추고 즉시 의료진의 도움을 받아야 합니다.<br />
                  훈련이 제대로 되지 않은 상태에서는 자신의 체력과 능력을 고려하고 속도를 조절하며 달려주세요.<br />
                  달리기 전 준비 운동과 충분한 수분 섭취 필수! 달린 후 충분한 휴식을 가지는 것이 중요!
                </p>
                <p className="font-semibold text-gray-800">
                  위와 같이 안전한 레이스를 지키지 않거나 질병이나 본인의 과실로 인한 사고는 보험 적용이 되지 않습니다.
                </p>
              </div>
            </div>

            {/* 추가 약관 내용 영역 */}
            <div className="bg-gray-100 rounded-lg p-4 h-[300px] overflow-y-auto">
              <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 건강상태</p>
                  <div className="pl-5">
                    <div className="flex items-start space-x-2 mb-2">
                      <span className="text-gray-700 flex-shrink-0"><strong>1.</strong></span>
                      <span className="text-gray-700"><strong>참가자의 건강 상태 및 책임본인</strong> 참가자의 건강 상태 및 책임본인은 마라톤 대회 참가와 관련하여, 대회 참가 중 발생할 수 있는 건강상의 문제에 대한 충분한 고려와 준비를 하였으며, 대회 도중 발생하는 모든 건강상의 문제는 전적으로 본인의 책임임을 인정합니다. <br/>
                      이에 따라, 본인은 다음과 같은 사항을 이해하고 동의합니다.<br/>
                      <div className="pl-5">
                        <div className="flex items-start space-x-2 mb-1">
                          <span className="text-red-500 flex-shrink-0">※</span>
                          <span className="text-red-500">고혈압, 심근경색, 심장질환, 당뇨 등 질병으로 인해 발생하는 사고나 사망에 대해서는 주최측이 어떠한 책임도 지지 않으며, 참가자는 이에 대해 보험 혜택을 받을 수 없습니다.</span>
                        </div>
                        <div className="flex items-start space-x-2 mb-1">
                          <span className="text-red-500 flex-shrink-0">※</span>
                          <span className="text-red-500">대회 도중 발생하는 부상, 사망, 기타 사고에 대해서는 주최측이 응급조치 외에는 어떠한 법적, 책임도 지지 않습니다.</span>
                        </div>
                      </div>
                      </span>
                    </div>
                    <div className="flex items-start space-x-2 mb-1">
                      <span className="text-gray-700 flex-shrink-0"><strong>2.</strong></span>
                      <span className="text-gray-700"><strong>기상 변화 및 기타 위험 요소</strong> 기상 변화 및 기타 위험 요소에 대한 책임본인은 기상 변화로 인한 열사병 증세 또는 과도한 레이스로 인한 탈수증 등의 위험 요소를 충분히 인지하고 있으며, 이러한 상황 발생 시 주최측이 응급조치 외에는 어떠한 책임도 지지 않음을 이해합니다. 따라서 본인은 이러한 위험을 자발적으로 수용하며 참가합니다.</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 대회규정 준수안내 ◆</p>
                  <div className="pl-5">
                    <div className="flex items-start space-x-2 mb-2">
                      <span className="text-gray-700 flex-shrink-0"><strong>1.</strong></span>
                      <span className="text-gray-700"><strong>대회 중단 및 긴급 안전 조치에 대한 이해</strong> 대회 중단 및 긴급 안전 조치에 대한 이해대회 도중 예기치 못한 상황(예: 기상 악화, 긴급 사고 등) 발생 시, 주최측은 지자체 및 소방 당국과 협력하여 긴급 안전 대책 회의를 거쳐 대회를 중단할 수 있습니다.<br />
                      이와 같은 경우에도 주최측은 대회 중단에 따른 참가자의 피해에 대해 어떠한 책임도 지지 않음을 동의합니다.</span>
                    </div>
                    <div className="flex items-start space-x-2 mb-2">
                      <span className="text-gray-700 flex-shrink-0"><strong>2.</strong></span>
                      <span className="text-gray-700"><strong>참가 규정 준수</strong> 참가 규정 준수본인은 전마협 대회 규정(아래 세부사항 포함)을 준수할 것을 서약하며, 만약 규정을 위반하여 발생하는 모든 사항에 대해 본인이 책임을 질 것임을 동의합니다.</span>
                    </div>
                    <div className="pl-5">
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-gray-700 flex-shrink-0">①</span>
                        <span className="text-gray-700">등록 시 가명 또는 차명을 사용하지 않으며, 참가권을 타인에게 양도하지 않습니다. 가명, 차명 사용 및 참가권 양도로 인해 발생하는 불이익은 본인이 감수합니다.</span>
                      </div>
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-gray-700 flex-shrink-0">②</span>
                        <span className="text-gray-700">대회 코스의 교통 혼잡으로 인해 각 구간별 제한 시간이 설정되어 있으며, 제한 시간 이후에는 교통 통제가 자동 해제됩니다. 제한 시간 내 완주하지 못한 참가자는 진행 요원의 지시에 따라 회수 차량에 탑승해야 합니다.</span>
                      </div>
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-gray-700 flex-shrink-0">③</span>
                        <span className="text-gray-700">기록 측정의 정확성을 위해 기록 측정용 칩은 정해진 방법으로 착용하고, 정해진 지점을 통과해야 합니다. (기타 세부 규정은 대회 요강을 참조하십시오.)</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 mb-2">
                      <span className="text-gray-700 flex-shrink-0"><strong>3.</strong></span>
                      <span className="text-gray-700"><strong>참가 취소 및 환불 정책</strong> 참가 취소 및 환불 정책부상이나 출장 등 불가피한 사정으로 인해 참가가 불가능한 경우, 주최측은 이를 확인 후 참가 취소를 할 수 있습니다. 참가 취소에 따른 환불은 아래의 규정에 따릅니다.</span>
                    </div>
                    <div className="pl-5">
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-gray-700 flex-shrink-0">•</span>
                        <span className="text-gray-700">대회 접수 마감일 이전까지: 참가비의 0% 공제 후 환불</span>
                      </div>
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-gray-700 flex-shrink-0">•</span>
                        <span className="text-gray-700">대회 접수 마감일 다음날부터: 참가비의 100% 공제 후 환불 불가</span>
                      </div>
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-gray-700 flex-shrink-0">•</span>
                        <span className="text-gray-700">대회 접수 마감일 이후에는 참가 취소 및 환불이 불가합니다. (참가비 전액 공제)</span>
                      </div>
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-gray-700 flex-shrink-0">•</span>
                        <span className="text-gray-700">대회 마감일 이후 10일 이내에 환불이 일괄적으로 처리됩니다</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 mb-2">
                      <span className="text-gray-700 flex-shrink-0"><strong>4.</strong></span>
                      <span className="text-gray-700"><strong>천재지변 및 기타 불가항력 사유</strong> 에 따른 대회 취소천재지변(자연재해) 또는 전쟁 등의 불가항력적인 사유로 인해 대회가 취소될 경우, 참가비는 환불되지 않으며, 단 기념품은 배송됩니다. 또한 코로나19와 관련된 질병 또는 개인 사정으로 인한 마감일 이후의 환불 요청은 불가합니다.</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 개인정보수집에 대한 동의 ◆</p>
                  <div className="pl-5">
                    <p className="mb-1">참가신청시 이용약관을 동의하는 절차를 마련하고 있으며 동의의 의사표시가 있으면 개인정보수집에 대해 동의한 것으로 봅니다</p>
                    <div className="pl-5">
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-gray-700 flex-shrink-0">1.</span>
                        <span className="text-gray-700">개인정보의 수집목적 및 이용목적 당사가 회원님들의 개인정보를 수집하는 목적은 회원님들의 신분을 확인하고 당사 서비스를 이용하고자 하는 의사를 확인하며 회원님에게 최적의 서비스를 제공하고자 하는 것입니다. 당사는 다양한 서비스를 회원님들의 특성, 기호에 맞추어 제공하고 회원님이 당사의 서비스를 이용함에 따라 일어나는 이행과정에서 일어나는 문제를 해결하기 위해 일부 한정된 범위내에서 개인정보를 이용하고 있습니다.</span>
                      </div>
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-gray-700 flex-shrink-0">2.</span>
                        <span className="text-gray-700">개인정보 취급정보방침은 홈페이지 메인하단&quot;개인정보취급방침&quot;에 따름을 이해한다.</span>
                      </div>
                      <div className="flex items-start space-x-2 mb-2">
                        <span className="text-gray-700 flex-shrink-0">3.</span>
                        <span className="text-gray-700">참가신청한후에는 대회안내 홍보문자가 발송을 수락한다.</span>
                      </div>
                    </div>
                    
                    <p className="mb-1">
                      <strong>▣ 개인정보활용동의 ▣</strong> 
                    </p>
                    <div className="pl-5">
                      <p className="mb-2">개인정보보호법 제22조 및 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제22조에 따라 타인에게 제공 활용 시 개인정보 제공자(정보주체)의 동의를 얻어야 하는 정보입니다. <br />
                        이에 정보주체(이하 &quot;본인&quot;으로 표기)인 본인은 귀사가 다음의 정보를 귀사 및 관계사의 서비스 제공 목적으로 활용 및 제공, 상호 공유하는데 동의한다.</p>
                    </div>

                    <p className="mb-1">
                      <strong>▣ 본인이 제공할 개인 정보의 내용 ▣</strong>
                    </p>
                    <div className="pl-5">
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-gray-700 flex-shrink-0">1.</span>
                        <span className="text-gray-700">필수제공사항 : 성명, 생년월일, 자택(회사)주소, 자택(회사)전화번호, 핸드폰번호, 이메일주소</span>
                      </div>
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-gray-700 flex-shrink-0">※</span>
                        <span className="text-gray-700">단, 정보통신망을 이용한 가입자의 경우 정보통신망 이용촉진 및 정보보호등에 관한 법률 제23조에 따라 주민등록번호를 대신하여 이용회원번호 및 생년월일등으로 이를 대체할 수 있습니다.</span>
                      </div>
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-gray-700 flex-shrink-0">※</span>
                        <span className="text-gray-700">사무국은 원칙적으로 이용자의 개인정보의 수집 및 이용 목적이 달성되면 지체 없이 파기합니다.</span>
                      </div>
                      <p className="mb-1">(단, 다음과 같은 이유로 명시한 기간 동안 보존합니다.)</p>
                      <p className="mb-2"><strong>사용목적</strong> : 대회기록조회 ┃ 5년 ┃ 성명, 생년월일, 성별, 휴대폰번호, 주소</p>
                    </div>                    

                    <p className="mb-2">
                      <strong>▣ 제공 대상자 및 제공 이용목적 ▣</strong>
                    </p>
                    <div className="pl-5">
                      <div className="flex items-start space-x-2 mb-2">
                        <span className="text-gray-700 flex-shrink-0">1.</span>
                        <span className="text-gray-700">개인정보는 제3자에게 제공 및 공개하지 않음이 원칙이지만 본인이 동의한 경우나 아래와 같은 경우는 예외로한다.</span>
                      </div>
                      <div className="pl-5">
                        <div className="flex items-start space-x-2 mb-1">
                          <span className="text-gray-700 flex-shrink-0">-</span>
                          <span className="text-gray-700">귀사의 서비스 지원 업무 외 추후 귀사 및 관계사의 신규 사업 홍보및 상품 안내, 통신사업 등에 필요한 경우 본인에게 다양한 신상품 서비스 제공 및 귀사에서 판매하는 상품, 서비스 이용 및 홍보 본인에 대한 사은행사 및 판촉행사, 부가서비스 제공, 귀사 내부 시장조사 및 상품 개발연구, 추가 서비스 이용 권유, SMS서비스 제공 등 업무처리 위탁을 위해 위탁업체에 제공됩니다.<br />
                          (우편물 · E-mail 발송업무, 배송업무, 회원유치, 신규 상품 판매 권유업무, 관계사 서비스 이용, 상담 및 예약업무 전화상담업무, 상품 및 서비스 관련 텔레마케팅, 고객만족도조사, 인터넷관련 서비스 업무, SMS 서비스제공 등)</span>
                        </div>
                        <div className="flex items-start space-x-2 mb-1">
                          <span className="text-gray-700 flex-shrink-0">-</span>
                          <span className="text-gray-700">관계사 및 부가서비스 제공기관에 제공 귀사나 귀사의 관계사 또는 귀사의 제휴업체와 &quot;서비스&quot;의 효율적 제공을 위해 업무 제휴 및 관계된 업체가 위 기입란에 기재된 사항을 상호 공유 또는 활용</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2 mb-2">
                        <span className="text-gray-700 flex-shrink-0">2.</span>
                        <span className="text-gray-700">고객 관심사에 부합되는 서비스 및 이벤트 기획, 정기간행물 발송, 이용회원 서비스 이용에 따른 본인 확인, 기념일 축하메세지 전달</span>
                      </div>
                      <div className="pl-5">
                        <p className="mb-1">웹페이지 접속 결과 분석에 따른 서비스 개선, 고객설문조사, 서비스 이용에 대한 통계 목적, 불량회원의 부정이용 방지 및 비인가 사용 방지</p>
                        <p className="mb-1">이벤트와 경품 당첨결과 안내 및 상품배송 · 발송 및 결제 추심, 고객상담 및 분쟁조정을 위한 기록보존, 공지사항 전달</p>
                      </div>
                      
                      <div className="flex items-start space-x-2 mb-2">
                        <span className="text-gray-700 flex-shrink-0">3.</span>
                        <span className="text-gray-700">개인정보 보유, 이용기간 및 열람, 증명, 정정</span>
                      </div>
                      <div className="pl-5">
                        <div className="flex items-start space-x-2 mb-1">
                          <span className="text-gray-700 flex-shrink-0">-</span>
                          <span className="text-gray-700">개인정보의 이용 및 보유기간은 회원가입시를 기점으로 하여 탈퇴 후 즉시 파기하는 것을 원칙으로하되 아래와 같은 경우에는 예외로 한다</span>
                        </div>
                        <div className="flex items-start space-x-2 mb-1">
                          <span className="text-gray-700 flex-shrink-0">-</span>
                          <span className="text-gray-700">충분한 법률적 근거가 있을 경우 관계법령에 적시된 보존 기간 동안 보존한다.</span>
                        </div>
                        <div className="flex items-start space-x-2 mb-1">
                          <span className="text-gray-700 flex-shrink-0">-</span>
                          <span className="text-gray-700">개인정보를 변경 또는 열람하고자 할 때는 주민번호(생년월일), 전화번호, 주소 등의 이미 제공된 개인정보를 통해 본인 여부를 확인한 후에 변경 또는 열람할 수 있다.</span>
                        </div>
                        <div className="flex items-start space-x-2 mb-1">
                          <span className="text-gray-700 flex-shrink-0">-</span>
                          <span className="text-gray-700">회원의 개인정보에 대한 각종 증명 및 발급을 원할 경우에는 본인 확인 후 가능하다.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 물품보관</p>
                  <div className="pl-5">
                    <div className="flex items-start space-x-2 mb-2">
                      <span className="text-gray-700 flex-shrink-0"><strong>1.</strong></span>
                      <span className="text-gray-700"><strong>행사장내에서 물품분실시 주최측에서 책임을 지지 않습니다.</strong></span>
                    </div>
                    <div className="flex items-start space-x-2 mb-2">
                      <span className="text-gray-700 flex-shrink-0"><strong>2.</strong></span>
                      <span className="text-gray-700"><strong>물품보관소는 전자제품 및 고가의 장비 귀중품, 지갑, 고가의 악세사리 등을 사전에 확인할 수 없으므로 분실 및 파손시에는 주최측에서 일체 책임지지 않으며 보상하지 않습니다.</strong></span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 추가 안내사항</p>
                  <div className="pl-5">
                    <div className="flex items-start space-x-2 mb-1">
                      <span className="text-gray-700 flex-shrink-0">•</span>
                      <span className="text-gray-700">천재지변(자연재해) 및 전쟁, 국가비상사태, 재난(전염병(질병)) 등으로 인하여 대회가 취소될시 참가금 환불 안됨. (단, 기념품 배송)</span>
                    </div>
                    <div className="flex items-start space-x-2 mb-1">
                      <span className="text-gray-700 flex-shrink-0">•</span>
                      <span className="text-gray-700">대회물품 택배배송은 주최측에 사정에 따라서 대회요강과 다르게 변동 될수 있습니다.</span>
                    </div>
                    <div className="flex items-start space-x-2 mb-1">
                      <span className="text-gray-700 flex-shrink-0">•</span>
                      <span className="text-gray-700">상금 25만원 초과시 세액은 본인이 부담하며, 상금입금에 필요한 각종 서류 추후 제출 (개인, 단체시상)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 동의 및 신청 섹션 */}
          <div className="bg-white p-6">
            {/* 동의 체크박스 */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="agreement-checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="agreement-checkbox" className="text-sm sm:text-base text-gray-700">
                  약관 내용을 이해하였으며, 약관에 동의합니다.
                </label>
              </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex flex-row gap-3 justify-center">
              <Link href={`/event/${params.eventId}/registration/apply/individual`}>
                <button 
                  className={`px-8 py-3 rounded font-semibold transition-colors ${
                    isAgreed 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isAgreed}
                >
                  개인신청
                </button>
              </Link>
              <Link href={`/event/${params.eventId}/registration/apply/group`}>
                <button 
                  className={`px-8 py-3 rounded font-semibold transition-colors ${
                    isAgreed 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isAgreed}
                >
                  단체신청
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}
