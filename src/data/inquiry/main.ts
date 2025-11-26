// src/data/inquiry/main.ts
import type { Inquiry, InquiryFilter, InquiryFile, Paged } from "./tpyes";

/* ========= Utils ========= */
const ymd = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${da}`;
};
const stripRe = (t: string) => t.replace(/^\s*\[RE\]\s*/gi, "").trim();
const makeFile = (
  id: string,
  name: string,
  sizeMB: number,
  mime = "application/pdf"
): InquiryFile => ({ id, name, sizeMB, mime, url: "#" });

/* ========= Seed (메인) ========= */
const MAIN_RAW: Inquiry[] = (() => {
  const list: Inquiry[] = [
    {
      id: 100,
      title: "대회 참가 신청 방법을 알려주세요.",
      author: "김참가",
      date: ymd(new Date(Date.now() - 86400000)),
      views: 320,
      content: "신청 절차 문의",
    },
    {
      id: 99,
      title: "현금영수증 발급 문의",
      author: "Runner",
      date: ymd(new Date(Date.now() - 2 * 86400000)),
      views: 210,
    },
    {
      id: 98,
      title: "기념품 수령 시간 문의",
      author: "Runner",
      date: ymd(new Date(Date.now() - 3 * 86400000)),
      views: 180,
    },
  ];
  for (let i = 0; i < 25; i++) {
    const id = 97 - i;
    const dt = new Date(Date.now() - (i + 4) * 86400000);
    list.push({
      id,
      title:
        i % 4 === 0
          ? "사이트 오류 제보"
          : i % 4 === 1
          ? "개인정보 수정 문의"
          : i % 4 === 2
          ? "우천 시 진행 문의"
          : "주차권 발급 문의",
      author: i % 2 ? "Runner" : "김참가",
      date: ymd(dt),
      views: 90 + ((i * 11) % 240),
      content: `${id}번 메인 문의 상세입니다.`,
      files: i % 6 === 0 ? [makeFile(`m-q-${id}-1`, "문의첨부.pdf", 0.6)] : undefined,
      ...(i % 5 === 0
        ? {
            answer: {
              content: "확인 후 답변드립니다.",
              author: "관리자",
              date: ymd(dt),
              files:
                i % 10 === 0 ? [makeFile(`m-a-${id}-1`, "답변첨부.pdf", 0.4)] : undefined,
            },
          }
        : {}),
    });
  }
  return list.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
})();

/* ========= Filter ========= */
function applyFilter(arr: Inquiry[], f?: InquiryFilter) {
  const sort = f?.sort ?? "new";
  const mode = f?.searchMode ?? "post";
  const q = (f?.q ?? "").trim().toLowerCase();

  // 원본은 절대 변이하지 말고 복사본으로 작업
  let rows = arr.map((r) => ({ ...r, title: stripRe(r.title) }));

  if (q) {
    rows =
      mode === "name"
        ? rows.filter((r) => r.author.toLowerCase().includes(q))
        : rows.filter((r) => stripRe(r.title).toLowerCase().includes(q));
  }

  if (sort === "new")
    rows.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  else if (sort === "old")
    rows.sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  else if (sort === "name")
    rows.sort(
      (a, b) => a.author.localeCompare(b.author, "ko") || b.date.localeCompare(a.date)
    );
  else if (sort === "hit") rows.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  return rows;
}

/* ========= 목록(답변행 확장) ========= */
export type InquiryListRow = Inquiry & {
  __replyOf?: number;     // 답변 행이면 원 질문 id
  __isReply?: boolean;    // 답변 행 플래그
};

export function getMainInquiries(
  page = 1,
  pageSize = 20,
  f?: InquiryFilter
): Paged<InquiryListRow> {
  const base = applyFilter(MAIN_RAW, f);

  const expanded: InquiryListRow[] = [];
  for (const q of base) {
    // 1) 원글(항상 RE 제거된 순수 제목)
    expanded.push({ ...q, title: stripRe(q.title) });

    // 2) 답변행(데이터 제목은 순수 제목 유지; UI에서만 [RE]/아이콘 표시)
    if (q.answer) {
      expanded.push({
        ...q,
        __replyOf: q.id,
        __isReply: true,
        title: stripRe(q.title),
        author: q.answer.author,
        date: q.answer.date,
        content: q.answer.content,
        files: q.answer.files,
      });
    }
  }

  const total = expanded.length;
  const start = (page - 1) * pageSize;
  return { rows: expanded.slice(start, start + pageSize), total };
}

/* ========= 상세 & 변경 ========= */
export function getMainInquiryDetail(id: number) {
  // 상세에서도 RE 흔적 제거해 일관성 유지
  const it = MAIN_RAW.find((r) => r.id === id);
  return it ? { ...it, title: stripRe(it.title) } : undefined;
}

export function deleteMainInquiry(id: number) {
  const i = MAIN_RAW.findIndex((r) => r.id === id);
  if (i >= 0) MAIN_RAW.splice(i, 1);
}

/** (inquiryId, content, files?, admin="관리자") */
export function replyMainInquiry(
  id: number,
  content: string,
  files?: InquiryFile[],
  admin = "관리자"
) {
  const it = MAIN_RAW.find((r) => r.id === id);
  if (!it) return;
  // 혹시 과거에 변이돼 [RE]가 들어갔다면 저장 시 정리
  it.title = stripRe(it.title);
  it.answer = { content, author: admin, date: ymd(new Date()), files };
}

export function createMainInquiry(
  payload: Omit<Inquiry, "id" | "date" | "views"> & Partial<Pick<Inquiry, "date">>
) {
  const nextId = (MAIN_RAW[0]?.id ?? 0) + 1;
  const dd = payload.date ?? ymd(new Date());
  MAIN_RAW.unshift({ id: nextId, date: dd, views: 0, ...payload, title: stripRe(payload.title) });
}
