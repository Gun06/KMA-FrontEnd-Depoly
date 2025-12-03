// src/components/filters/presets.ts
import type { FilterBarProps } from "./FilterBar";

/** 2004 ~ 현재년도+1, 내림차순 + 전체 옵션 */
const currentYear = new Date().getFullYear();
const yearOptions = [
  { label: "전체", value: "" }, // 전체 필터 추가
  ...Array.from({ length: currentYear + 1 - 2003 }, (_, i) => {
    const y = currentYear + 1 - i; // 올해 +1까지 포함
    return { label: String(y), value: String(y) };
  }),
];

export type FilterBarPreset = {
  props: FilterBarProps; // buttons, showReset 포함
};

export const PRESETS: Record<string, FilterBarPreset> = {
  /* ===================== 참가신청 ===================== */

  "참가신청 / 기본": {
    props: {
      buttonTextMode: "current",
      fields: [
        { label: "년도", options: yearOptions, menuMaxHeight: 280 },
        {
          label: "신청상태",
          options: [
            { label: "비접수", value: "none" },
            { label: "접수중", value: "ing" },
            { label: "접수마감", value: "done" },
          ],
        },
        {
          label: "공개여부",
          options: [
            { label: "공개", value: "open" },
            { label: "비공개", value: "closed" },
          ],
        },
      ],
      searchPlaceholder: "검색어를 입력해주세요.",
      buttons: [{ label: "대회등록", tone: "primary", iconRight: true }],
      showReset: true,
    },
  },

  "참가신청 / 신청자관리(정렬)": {
    props: {
      buttonTextMode: "current",
      fields: [
        {
          label: "입금여부",
          options: [
            { label: "전체", value: "" },
            { label: "미결제", value: "unpaid" },
            { label: "결제완료", value: "completed" },
            { label: "확인필요", value: "must_check" },
            { label: "차액환불요청", value: "need_partial_refund" },
            { label: "전액환불요청", value: "need_refund" },
            { label: "전액환불완료", value: "refunded" },
          ],
        },
        {
          label: "이름",
          options: [
            { label: "전체", value: "all" },
            { label: "이름", value: "name" },
            { label: "단체명", value: "org" },
            { label: "생년월일", value: "birth" },
            { label: "휴대전화", value: "tel" },
            { label: "입금자명", value: "paymenterName" },
            { label: "메모", value: "memo" },
            { label: "비고", value: "note" },
            { label: "상세메모", value: "detailMemo" },
            { label: "매칭로그", value: "matchingLog" },
          ],
        },
      ],
      searchPlaceholder: "내용을 입력해주세요.",
      buttons: [
        { label: "검색", tone: "dark" },
        {
          label: "Excel",
          tone: "primary",
          menu: [
            { label: "신청자 목록 다운로드", value: "downloadApplicants" },
            { label: "입금 내역 업로드",     value: "uploadPayments" },
          ],
        },
      ],
      showReset: true,
    },
  },

  /* ===================== 관리자 ===================== */

  "관리자 / 대회관리": {
    props: {
      buttonTextMode: "current",
      fields: [
        {
          label: "년도",
          options: yearOptions,
        },
        {
          label: "신청여부",
          options: [
            { label: "접수중", value: "ing" },
            { label: "비접수", value: "none" },
            { label: "접수마감", value: "done" },
          ],
        },
        {
          label: "공개여부",
          options: [
            { label: "공개", value: "open" },
            { label: "비공개", value: "closed" },
          ],
        },
      ],
      searchPlaceholder: "검색어를 입력해주세요.",
      buttons: [{ label: "대회등록", tone: "primary", iconRight: true }],
      showReset: true,
    },
  },

  "관리자 / 공지사항(기본)": {
    props: {
      buttonTextMode: "current",
      fields: [
        {
          label: "정렬",
          options: [
            { label: "최신순", value: "new" },
            { label: "조회수순", value: "hit" },
            { label: "이름순", value: "name" },
          ],
        },
        {
          label: "신청상태",
          options: [
            { label: "비접수", value: "none" },
            { label: "접수중", value: "ing" },
            { label: "접수마감", value: "done" },
          ],
        },
        {
          label: "공개여부",
          options: [
            { label: "공개", value: "open" },
            { label: "비공개", value: "closed" },
          ],
        },
      ],
      searchPlaceholder: "검색어를 입력해주세요.",
      buttons: [{ label: "검색", tone: "dark" }],
      showReset: true,
    },
  },

  "관리자 / 대회_공지사항": {
    props: {
      buttonTextMode: "current",
      fields: [
        {
          label: "정렬",
          options: [
            { label: "최신순", value: "new" },
            { label: "조회수순", value: "hit" },
          ],
        },
        {
          label: "유형",
          options: [
            { label: "대회", value: "match" },
            { label: "이벤트", value: "event" },
            { label: "공지", value: "notice" },
            { label: "일반", value: "general" },

          ],
        },
      ],
      searchPlaceholder: "검색어를 입력해주세요.",
      buttons: [{ label: "검색", tone: "dark" }],
      showReset: true,
    },
  },

  "관리자 / 대회_문의사항": {
    props: {
      buttonTextMode: "current",
      fields: [
        {
          label: "검색키",
          options: [
            { label: "전체", value: "all" },
            { label: "작성자명", value: "name" },
            { label: "게시글명", value: "post" },
          ],
        },
      ],
      searchPlaceholder: "검색어를 입력해주세요.",
      buttons: [{ label: "검색", tone: "dark" }],
      showReset: true,
    },
  },

  "관리자 / FAQ": {
    props: {
      buttonTextMode: "current",
      fields: [], // 간단한 검색만 지원
      searchPlaceholder: "검색어를 입력해주세요.",
      buttons: [{ label: "검색", tone: "dark" }],
      showReset: true,
    },
  },

  "관리자 / 회원관리(개인)": {
    props: {
      buttonTextMode: "current",
      fields: [
        {
          label: "번호",
          options: [
            { label: "번호", value: "id" },
            { label: "이름", value: "name" },
            { label: "생년월일순", value: "birth" },
          ],
        },
        {
          label: "회원여부",
          options: [
            { label: "전체", value: "" },
            { label: "회원", value: "member" },
            { label: "비회원", value: "nonMember" },
          ],
        },
      ],
      searchPlaceholder: "검색어를 입력해주세요.",
      buttons: [
        { label: "검색", tone: "dark" },
        { label: "Excel", tone: "primary", iconRight: true },
      ],
      showReset: true,
    },
  },
  "관리자 / 개인 신청상세": {
    props: {
      buttonTextMode: "current",
      fields: [
        {
          label: "신청상태",
          options: [
            { label: "전체",   value: "" },
            { label: "참가완료", value: "참가완료" },
            { label: "접수중",   value: "접수중" },
            { label: "접수취소", value: "접수취소" },
          ],
        },
        {
          label: "입금여부",
          options: [
            { label: "전체",   value: "" },
            { label: "입금",   value: "paid" },
            { label: "미입금", value: "unpaid" },
            { label: "확인요망", value: "pending" },
          ],
        },
      ],
      searchPlaceholder: "검색어를 입력해주세요.",
      buttons: [
        { label: "검색",     tone: "dark" },
        { label: "뒤로가기", tone: "dark" },
        { label: "Excel",    tone: "primary", iconRight: true },
      ],
      showReset: true,
    },
  },


  "관리자 / 회원관리(단체)": {
    props: {
      buttonTextMode: "current",
      fields: [
        {
          label: "번호",
          options: [
            { label: "번호", value: "id" },
            { label: "참가횟수", value: "joinCount" },
            { label: "회원수", value: "memberCount" },
          ],
        },
        {
          label: "단체명",
          options: [
            { label: "단체명", value: "org" },
            { label: "대표자명", value: "owner" },
            { label: "대표자 ID", value: "ownerId" },
          ],
        },
      ],
      searchPlaceholder: "검색어를 입력해주세요.",
      buttons: [
        { label: "검색", tone: "dark" },
        { label: "Excel", tone: "primary", iconRight: true },
      ],
      showReset: true,
    },
  },

  // presets.ts 안에 추가
  "관리자 / 단체 구성원": {
    props: {
      buttonTextMode: "current",
      fields: [
        {
          label: "번호",
          options: [
            { label: "번호", value: "id" },
            { label: "이름", value: "name" },
            { label: "생년월일", value: "birth" },
          ],
        },
        {
          label: "회원여부",
          options: [
            { label: "전체", value: "" },
            { label: "회원", value: "member" },
            { label: "비회원", value: "nonMember" },
          ],
        },
      ],
      searchPlaceholder: "검색어를 입력해주세요.",
      buttons: [
        { label: "검색", tone: "dark" },
        { label: "뒤로가기", tone: "dark" },
        { label: "Excel", tone: "primary", iconRight: true },
      ],
      showReset: true,
    },
  },
  "스폰서관리": {
    props: {
      buttonTextMode: "current",
      fields: [
        { label: "년도", options: yearOptions, menuMaxHeight: 280 },
        {
          label: "신청상태",
          options: [
            { label: "비접수", value: "none" },
            { label: "접수중", value: "ing" },
            { label: "접수마감", value: "done" },
          ],
        },
        {
          label: "공개여부",
          options: [
            { label: "공개", value: "open" },
            { label: "비공개", value: "closed" },
          ],
        },
      ],
      searchPlaceholder: "검색어를 입력해주세요.",
      buttons: [{ label: "등록하기", tone: "primary", iconRight: true }],
      showReset: true,
    },
  },

  "관리자 / 갤러리 리스트": {
    props: {
      buttonTextMode: "current",
      fields: [
        {
          label: "정렬",
          options: [
            { label: "번호 순", value: "no" },
            { label: "개최일 순", value: "date" },
            { label: "대회명 순", value: "title" },
          ],
        },
        {
          label: "공개여부",
          options: [
            { label: "공개", value: "open" },
            { label: "비공개", value: "closed" },
          ],
        },
      ],
      searchPlaceholder: "검색어를 입력해주세요.",
      buttons: [
        { label: "검색", tone: "dark" },
        { label: "등록하기", tone: "primary", iconRight: true },
      ],
      showReset: true,
    },
  },
};
