export type MainSponsor = {
    id: number;
    name: string;      // "스폰서 N" 라벨
    image?: string;    // dataURL or CDN URL
    url: string;
    visible: boolean;  // 공개/비공개
    priority: number;  // 1..N (작을수록 위)
    updatedAt: string; // YYYY.MM.DD
  };
  
  const ymd = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${da}`;
  };
  
  // Seed
  const STORE: MainSponsor[] = Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    name: `스폰서 ${i + 1}`,
    image: "",
    url: "",
    visible: true,
    priority: i + 1,
    updatedAt: ymd(),
  }));
  
  function resort(rows: MainSponsor[]) {
    rows.sort((a, b) => a.priority - b.priority || a.id - b.id);
    rows.forEach((r, i) => ((r.priority = i + 1), (r.name = `스폰서 ${i + 1}`)));
  }
  
  export function listMainSponsors(): MainSponsor[] {
    const rows = STORE.slice();
    resort(rows);
    return rows;
  }
  
  export function saveMainSponsors(payload: MainSponsor[]) {
    STORE.length = 0;
    payload.forEach((r) => STORE.push({ ...r, updatedAt: ymd() }));
    resort(STORE);
  }
  
  export function createMainSponsor(afterPriority?: number): MainSponsor {
    const nextId = Math.max(0, ...STORE.map((r) => r.id)) + 1;
    const insertPri = (afterPriority ?? STORE.length) + 1;
    STORE.forEach((r) => {
      if (r.priority >= insertPri) r.priority += 1;
    });
    const row: MainSponsor = {
      id: nextId,
      name: "스폰서",
      image: "",
      url: "",
      visible: true,
      priority: insertPri,
      updatedAt: ymd(),
    };
    STORE.push(row);
    resort(STORE);
    return row;
  }
  
  export function deleteMainSponsor(id: number) {
    const idx = STORE.findIndex((r) => r.id === id);
    if (idx >= 0) STORE.splice(idx, 1);
    resort(STORE);
  }
  
  export function moveMainSponsor(id: number, dir: "up" | "down") {
    const rows = listMainSponsors();
    const i = rows.findIndex((r) => r.id === id);
    if (i < 0) return;
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= rows.length) return;
    const a = rows[i],
      b = rows[j];
    const tmp = a.priority;
    a.priority = b.priority;
    b.priority = tmp;
    saveMainSponsors(rows);
  }
  
  export function patchMainSponsor(id: number, patch: Partial<MainSponsor>) {
    const it = STORE.find((r) => r.id === id);
    if (!it) return;
    Object.assign(it, patch, { updatedAt: ymd() });
    resort(STORE);
  }
  