import type { Faq, FaqFilter, FaqFile, Paged } from "./types";

/** UI에서 입력받는 답변 드래프트 타입(작성자/날짜는 데이터 레이어가 채움) */
type AnswerDraft = { content: string; files?: FaqFile[] };

/* ========= Utils ========= */
const ymd = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${da}`;
};
const stripRe = (t: string) => t.replace(/^\s*\[RE\]\s*/gi, "").trim();

/* ========= Seed(메인 FAQ) =========
   - ID: TOTAL..1(작은 번호)
   - 제목은 질문 역할, question 본문은 3개마다 채움(옵션 A)
   - 질문 첨부는 사용 안 함
*/
const TOTAL = 28;
const MAIN_RAW: Faq[] = (() => {
  const list: Faq[] = [];
  for (let i = 0; i < TOTAL; i++) {
    const id = TOTAL - i;                          // 28..1
    const dt = new Date(Date.now() - (i + 1) * 86400000);
    const title =
      i % 4 === 0 ? "사이트 오류 제보"
      : i % 4 === 1 ? "개인정보 수정 문의"
      : i % 4 === 2 ? "우천 시 진행 문의"
      : "주차권 발급 문의";

    list.push({
      id,
      title,
      author: "관리자",
      date: ymd(dt),
      views: 80 + ((i * 11) % 240),
      // ⬇ 옵션 A: 3개마다 본문 채움
      question: i % 3 === 0 ? `<p>${title} 관련 상세 안내입니다.</p>` : "",
      // 일부는 답변 포함(답변 첨부 가능)
      ...(i % 5 === 0
        ? { answer: { content: "확인 후 답변드립니다.", author: "관리자", date: ymd(dt) } }
        : {}),
    });
  }
  return list.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
})();

/* ========= Filter ========= */
function applyFilter(arr: Faq[], f?: FaqFilter) {
  const sort = f?.sort ?? "new";
  const mode = f?.searchMode ?? "post";
  const q = (f?.q ?? "").trim().toLowerCase();

  let rows = arr.map((r) => ({ ...r, title: stripRe(r.title) }));

  if (q) {
    rows = mode === "name"
      ? rows.filter((r) => r.author.toLowerCase().includes(q))
      : rows.filter((r) => stripRe(r.title).toLowerCase().includes(q));
  }

  if (sort === "new") rows.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  else if (sort === "old") rows.sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  else if (sort === "name") rows.sort((a, b) => a.author.localeCompare(b.author, "ko") || b.date.localeCompare(a.date));
  else if (sort === "hit") rows.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  return rows;
}

/* ========= 목록(답변행 확장) ========= */
export type FaqListRow = Faq & { __replyOf?: number; __isReply?: boolean };

export function getMainFaqs(page = 1, pageSize = 20, f?: FaqFilter): Paged<FaqListRow> {
  const base = applyFilter(MAIN_RAW, f);
  const expanded: FaqListRow[] = [];
  for (const q of base) {
    expanded.push({ ...q, title: stripRe(q.title) });
    if (q.answer) {
      expanded.push({
        ...q,
        __replyOf: q.id,
        __isReply: true,
        title: stripRe(q.title),
        author: q.answer.author,
        date: q.answer.date,
        question: q.answer.content,
        files: q.answer.files, // 첨부는 답변에만
      });
    }
  }
  const total = expanded.length;
  const start = (page - 1) * pageSize;
  return { rows: expanded.slice(start, start + pageSize), total };
}

/* ========= 상세 & 변경 ========= */
export function getMainFaqDetail(id: number) {
  const it = MAIN_RAW.find((r) => r.id === id);
  return it ? { ...it, title: stripRe(it.title) } : undefined;
}

export function deleteMainFaq(id: number) {
  const i = MAIN_RAW.findIndex((r) => r.id === id);
  if (i >= 0) MAIN_RAW.splice(i, 1);
}

export function replyMainFaq(id: number, content: string, files?: FaqFile[], admin = "관리자") {
  const it = MAIN_RAW.find((r) => r.id === id);
  if (!it) return;
  it.title = stripRe(it.title);
  it.answer = { content, author: admin, date: ymd(new Date()), files };
}

/** 여러 관리자 지원 + AnswerDraft 허용 */
export function createMainFaq(
  payload: Omit<Faq, "id" | "date" | "views" | "author" | "answer" | "files"> &
           Partial<Pick<Faq, "date">> & { answer?: AnswerDraft },
  opts?: { adminName?: string }
) {
  const admin = (opts?.adminName ?? "관리자").trim() || "관리자";
  const dd = payload.date ?? ymd(new Date());
  const nextId = Math.max(0, ...MAIN_RAW.map(r => r.id)) + 1;  // ✅ 항상 최대 ID + 1

  MAIN_RAW.unshift({
    id: nextId,
    date: dd,
    views: 0,
    author: admin,
    title: stripRe(payload.title),
    question: payload.question ?? "",
    files: undefined, // 질문 첨부 미사용
    answer: payload.answer
      ? { content: payload.answer.content, files: payload.answer.files, author: admin, date: dd }
      : undefined,
  });
}

export function updateMainFaq(
  id: number,
  patch: Partial<Omit<Faq, "answer" | "author" | "files">> & { answer?: AnswerDraft | null },
  opts?: { adminName?: string }
) {
  const it = MAIN_RAW.find((r) => r.id === id);
  if (!it) return;
  const admin = (opts?.adminName ?? "관리자").trim() || "관리자";

  if (typeof patch.title === "string") it.title = stripRe(patch.title);
  if (typeof patch.question === "string") it.question = patch.question;

  if (patch.answer !== undefined) {
    it.answer = patch.answer
      ? { content: patch.answer.content, files: patch.answer.files, author: admin, date: ymd(new Date()) }
      : null;
  }

  it.author = admin;
}
