/** ISO 문자열을 BirthDateInput + TimeSelect(5분 단위)용으로 분해 */
export function isoToDateParts(iso: string): { date: string; hh: string; mm: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', hh: '00', mm: '00' };
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const totalMin = d.getHours() * 60 + d.getMinutes();
  const snappedTotal = Math.round(totalMin / 5) * 5;
  const hh = Math.floor(snappedTotal / 60) % 24;
  const mm = snappedTotal % 60;
  return {
    date: `${y}-${m}-${day}`,
    hh: String(hh).padStart(2, '0'),
    mm: String(mm).padStart(2, '0'),
  };
}

