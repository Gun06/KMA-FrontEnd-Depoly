import type { Faq, FaqFilter, FaqFile, Paged } from "./types";

/** UI에서 넘기는 답변 드래프트(작성자/날짜는 여기서 채움) */
type AnswerDraft = { content: string; files?: FaqFile[] };

/* ========= Utils ========= */
const ymd = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${da}`;
};

// eventId -> Faq[] 메모리 DB
const DB: Record<string, Faq[]> = {};

/* ========= Seed =========
   - ID: COUNT..1(작은 번호)
   - 제목은 질문 역할, question 본문은 3개마다 채움(옵션 A)
   - 질문 첨부는 사용 안 함
*/
const COUNT = 30;

function seed(eventId: string) {
  if (DB[eventId]) return;
  const rows: Faq[] = [];
  for (let i = 0; i < COUNT; i++) {
    const id = COUNT - i;                        // 30..1
    const d = new Date(Date.now() - (i + 1) * 86400000);
    const title = i % 2 ? "주차 안내 문의" : "기록증 출력 방법 문의";

    rows.push({
      id,
      title,
      author: "관리자",
      date: ymd(d),
      views: 50 + ((i * 7) % 300),
      question: i % 3 === 0 ? `<p>${title} 관련 상세 안내입니다.</p>` : "",
      ...(i % 4 === 0
        ? {
            answer: {
              content: "안내드립니다.",
              author: "관리자",
              date: ymd(d),
              // 데모용: 몇 건은 답변 첨부 포함
              files: i % 8 === 0 ? [{ id: `a-${id}-1`, name: "답변첨부.pdf", sizeMB: 0.4, mime: "application/pdf", url: "#" }] : undefined,
            },
          }
        : {}),
    });
  }
  DB[eventId] = rows;
}

/* ========= Filter ========= */
function applyFilter(arr: Faq[], f?: FaqFilter) {
  let rows = [...arr];
  const q = (f?.q ?? "").trim().toLowerCase();
  const mode = f?.searchMode ?? "post";
  if (q) {
    rows = mode === "name" ? rows.filter(r => r.author.toLowerCase().includes(q))
                           : rows.filter(r => r.title.toLowerCase().includes(q));
  }
  const sort = f?.sort ?? "new";
  if (sort === "new") rows.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  else if (sort === "old") rows.sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  else if (sort === "hit") rows.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  else if (sort === "name") rows.sort((a, b) => a.author.localeCompare(b.author, "ko"));
  return rows;
}

/* ========= 목록/상세 ========= */
export function getEventFaqs(eventId: string, page = 1, pageSize = 20, f?: FaqFilter): Paged<Faq> {
  seed(eventId);
  const base = applyFilter(DB[eventId], f);
  const total = base.length;
  const start = (page - 1) * pageSize;
  return { rows: base.slice(start, start + pageSize), total };
}

export function getEventFaqDetail(eventId: string, id: number) {
  seed(eventId);
  return DB[eventId].find(x => x.id === id);
}

export function deleteEventFaq(eventId: string, id: number) {
  seed(eventId);
  const i = DB[eventId].findIndex(r => r.id === id);
  if (i >= 0) DB[eventId].splice(i, 1);
}

/* ========= 등록/수정 =========
   - 질문 첨부 미사용
   - answer는 AnswerDraft를 받아 author/date 채움
*/
export function createEventFaq(
  eventId: string,
  payload: Omit<Faq, "id" | "date" | "views" | "author" | "answer" | "files"> &
           Partial<Pick<Faq, "date">> & { answer?: AnswerDraft },
  opts?: { adminName?: string }
) {
  seed(eventId);
  const admin = (opts?.adminName ?? "관리자").trim() || "관리자";
  const dd = payload.date ?? ymd(new Date());
  const nextId = Math.max(0, ...DB[eventId].map(r => r.id)) + 1;  // ✅ 항상 최대 ID + 1

  DB[eventId].unshift({
    id: nextId,
    date: dd,
    views: 0,
    author: admin,
    title: payload.title,
    question: payload.question ?? "",
    // files: 질문 첨부 미사용
    answer: payload.answer
      ? { content: payload.answer.content, files: payload.answer.files, author: admin, date: dd }
      : undefined,
  });
}

export function updateEventFaq(
  eventId: string,
  id: number,
  patch: Partial<Omit<Faq, "answer" | "author" | "files">> & { answer?: AnswerDraft | null },
  opts?: { adminName?: string }
) {
  seed(eventId);
  const it = DB[eventId].find(x => x.id === id);
  if (!it) return;
  const admin = (opts?.adminName ?? "관리자").trim() || "관리자";

  if (typeof patch.title === "string") it.title = patch.title;
  if (typeof patch.question === "string") it.question = patch.question;

  if (patch.answer !== undefined) {
    it.answer = patch.answer
      ? { content: patch.answer.content, files: patch.answer.files, author: admin, date: ymd(new Date()) }
      : null;
  }

  it.author = admin;
}
