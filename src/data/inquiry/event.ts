// src/data/inquiry/event.ts
import type { Inquiry, InquiryFilter, InquiryFile, Paged } from "./tpyes";

/* Utils */
const ymd = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${da}`;
};
const isReplyTitle = (t: string) => /^\s*\[RE\]\s*/i.test(t);
const stripRe = (t: string) => t.replace(/^\s*\[RE\]\s*/i, "").trim();
const norm = (t: string) => stripRe(t).toLowerCase();
const pdf = (id: string, name: string, sizeMB: number): InquiryFile => ({
  id, name, sizeMB, mime: "application/pdf", url: "#",
});

/* RAW DB: 질문/답변 섞여 있고, collapseThreads 가 흡수 */
const BY_EVENT_RAW: Record<string, Inquiry[]> = {
  "25": (() => {
    const seed: Inquiry[] = [
      {
        id: 410,
        title: "현금영수증 발급 요청 드립니다.**훈",
        author: "***",
        date: "2025.08.29",
        views: 7,
        content: "현금영수증 발급 요청 드립니다.**훈에 대한 상세 문의 내용입니다.",
        files: [pdf("q-410-1", "영수증요청서.pdf", 1.2)],
      },
      {
        id: 409,
        title: "[RE] 현금영수증 발급 요청 드립니다.**훈",
        author: "관리자",
        date: "2025.08.29",
        views: 1,
        content: "처리 완료했습니다.",
        files: [pdf("a-409-1", "발급내역.pdf", 0.8)],
      },
    ];

    // 최근 → 과거 30개 가까이 생성
    for (let i = 0; i < 28; i++) {
      const id = 408 - i;
      const dt = new Date(Date.now() - (i + 1) * 86400000);
      const titlePick =
        i % 5 === 0 ? "집결 장소 문의" :
        i % 5 === 1 ? "주차 가능 여부" :
        i % 5 === 2 ? "우천 시 진행 여부" :
        i % 5 === 3 ? "참가확인서 발급 방법 문의" : "기념품 사이즈 교환 가능한가요?";
      const base: Inquiry = {
        id,
        title: titlePick,
        author: i % 2 === 0 ? "RunnerB" : "RunnerC",
        date: ymd(dt),
        views: 10 + ((i * 9) % 90),
        content: `${id}번 문의 상세입니다.`,
        files: i % 6 === 0 ? [pdf(`q-${id}-1`, "문의첨부.pdf", 0.7)] : undefined,
      };
      seed.push(base);

      // 간헐적 [RE] 답변글
      if (i % 4 === 0) {
        seed.push({
          id: id - 1000,
          title: `[RE] ${base.title}`,
          author: "관리자",
          date: ymd(dt),
          content: "문의 주신 건 검토 후 답변드립니다.",
          files: i % 8 === 0 ? [pdf(`a-${id}-1`, "답변첨부.pdf", 0.4)] : undefined,
        });
      }
    }
    return seed;
  })(),

  "5": (() => {
    const seed: Inquiry[] = [];
    for (let i = 0; i < 30; i++) {
      const id = 3000 - i;
      const dt = new Date(Date.now() - (i + 2) * 86400000);
      const titlePick =
        i % 4 === 0 ? "셔틀버스 탑승 위치 문의" :
        i % 4 === 1 ? "현장 접수 가능 여부" :
        i % 4 === 2 ? "대회 코스 난이도 문의" : "주차권 배부 시간 문의";
      const base: Inquiry = {
        id,
        title: titlePick,
        author: i % 3 === 0 ? "홍길동" : i % 3 === 1 ? "RunnerD" : "RunnerE",
        date: ymd(dt),
        views: 30 + ((i * 5) % 100),
        content: `${id}번 문의 상세입니다.`,
        files: i % 7 === 0 ? [pdf(`q-${id}-1`, "사진.pdf", 1.1)] : undefined,
      };
      seed.push(base);
      if (i % 5 === 0) {
        seed.push({
          id: id - 2000,
          title: `[RE] ${base.title}`,
          author: "관리자",
          date: ymd(dt),
          content: "안내드립니다: 첨부 확인 부탁드립니다.",
          files: i % 10 === 0 ? [pdf(`a-${id}-1`, "안내문.pdf", 0.6)] : undefined,
        });
      }
    }
    return seed;
  })(),

  "1001": (() => {
    const seed: Inquiry[] = [
      { id: 410, title: "현금영수증 발급 요청 드립니다.**훈", author: "***", date: "2025.08.28", views: 7 },
      { id: 409, title: "[RE] 현금영수증 발급 요청 드립니다.**훈", author: "관리자", date: "2025.08.28", views: 1,
        content: "처리 완료했습니다.", files: [pdf("a-1001-409-1","증빙.pdf",0.9)] },
    ];
    for (let i = 0; i < 26; i++) {
      const id = 380 - i;
      const dt = new Date(Date.now() - (i + 1) * 86400000);
      seed.push({
        id,
        title: i % 2 === 0 ? "배번호 수령 안내" : "완주메달 수령 문의",
        author: i % 2 === 0 ? "RunnerF" : "RunnerG",
        date: ymd(dt),
        views: 5 + ((i * 3) % 50),
      });
      if (i % 6 === 0) {
        seed.push({
          id: id - 1500,
          title: `[RE] ${i % 2 === 0 ? "배번호 수령 안내" : "완주메달 수령 문의"}`,
          author: "관리자",
          date: ymd(dt),
          content: "현장 본부에서 수령 가능합니다.",
        });
      }
    }
    return seed;
  })(),
};

/* 스레드 접기
   - 이미 answer 있으면 [RE]로 덮지 않음
   - 부모 못 찾는 [RE]는 폐기(중복 방지) */
function collapseThreads(list: Inquiry[]): Inquiry[] {
  const sorted = [...list].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.id - a.id;
  });

  const out: Inquiry[] = [];
  const lastQuestionByTitle = new Map<string, Inquiry>();

  for (const it of sorted) {
    const key = norm(it.title);

    if (isReplyTitle(it.title)) {
      const parent = lastQuestionByTitle.get(key);
      if (parent) {
        if (!parent.answer) {
          parent.answer = {
            author: it.author,
            date: it.date,
            content: it.content ?? "",
            files: it.files ?? [],
          };
        }
        continue; // [RE] 원글 제거
      }
      continue; // 부모 없음 → 제거
    }

    out.push(it);
    lastQuestionByTitle.set(key, it);
  }

  return out.sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.id - a.id;
  });
}

/* 검색/정렬 */
function sortFilter(arr: Inquiry[], f?: InquiryFilter) {
  const sort = f?.sort ?? "new";
  const mode = f?.searchMode ?? "post";
  const q = (f?.q ?? "").trim().toLowerCase();

  let rows = [...arr];

  if (q) {
    rows = mode === "name"
      ? rows.filter(r => r.author.toLowerCase().includes(q))
      : rows.filter(r => stripRe(r.title).toLowerCase().includes(q));
  }

  if (sort === "new") rows.sort((a,b)=> b.date.localeCompare(a.date) || b.id - a.id);
  if (sort === "old") rows.sort((a,b)=> a.date.localeCompare(b.date) || a.id - b.id);
  if (sort === "name") rows.sort((a,b)=> a.author.localeCompare(b.author,"ko") || b.date.localeCompare(a.date));
  if (sort === "hit") rows.sort((a,b)=> (b.views ?? 0) - (a.views ?? 0));

  return rows;
}

/* Public APIs */
export function getEventInquiries(
  eventId: string,
  page = 1,
  pageSize = 20,
  f?: InquiryFilter
): Paged<Inquiry> {
  const collapsed = collapseThreads(BY_EVENT_RAW[eventId] ?? []);
  const all = sortFilter(collapsed, f);
  const total = all.length; // 질문 행 개수
  const start = (page - 1) * pageSize;
  return { rows: all.slice(start, start + pageSize), total };
}

export function getEventInquiryDetail(eventId: string, id: number) {
  const collapsed = collapseThreads(BY_EVENT_RAW[eventId] ?? []);
  return collapsed.find(r => r.id === id);
}

export function deleteEventInquiry(eventId: string, id: number) {
  const list = BY_EVENT_RAW[eventId] ?? [];
  const i = list.findIndex(r => r.id === id);
  if (i >= 0) list.splice(i, 1);
  BY_EVENT_RAW[eventId] = list;
}

export function replyEventInquiry(
  eventId: string,
  id: number,
  content: string,
  files?: InquiryFile[],
  admin = "관리자"
) {
  const list = BY_EVENT_RAW[eventId] ?? [];
  const it = list.find(r => r.id === id);
  if (!it) return;
  it.answer = { content, author: admin, date: ymd(new Date()), files };
}

export function createEventInquiry(
  eventId: string,
  payload: Omit<Inquiry, "id" | "date"> & Partial<Pick<Inquiry, "date">>
) {
  const list = (BY_EVENT_RAW[eventId] ??= []);
  const nextId = (list[0]?.id ?? 0) + 1;
  list.unshift({ id: nextId, date: ymd(new Date()), views: 0, ...payload });
}
