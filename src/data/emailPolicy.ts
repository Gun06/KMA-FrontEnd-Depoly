export const EMAIL_POLICY_INTRO =
  '전국마라톤협회 홈페이지에 게시된 이메일 주소는 정보통신망법에 따라 무단 수집을 거부합니다.'

export const EMAIL_POLICY_TITLE =
  '정보통신망법 제50조의2 (전자우편주소의 무단 수집행위 등 금지)'

export const EMAIL_POLICY_CLAUSES = [
  {
    label: '수집 금지',
    content:
      '전자우편주소 수집을 거부하는 의사가 명시된 홈페이지에서 자동 수집 프로그램 등 기술적 장치를 이용해 전자우편주소를 수집해서는 안 됩니다.',
  },
  {
    label: '판매·유통 금지',
    content: '제1항을 위반하여 수집된 전자우편주소를 판매하거나 유통해서는 안 됩니다.',
  },
  {
    label: '정보전송 이용 금지',
    content:
      '수집·판매·유통이 금지된 전자우편주소임을 알면서 이를 정보전송에 이용해서는 안 됩니다.',
  },
] as const

export const EMAIL_POLICY_PENALTY = '위반 시 1천만원 이하의 벌금이 부과될 수 있습니다.'
