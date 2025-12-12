import { ChevronUp, ChevronDown, Plus, Minus } from 'lucide-react';

export function CircleBtn({ 
  kind, 
  onClick 
}: { 
  kind: 'up' | 'down' | 'plus' | 'minus'; 
  onClick: () => void;
}) {
  const base = 'inline-flex items-center justify-center h-9 w-9 rounded-lg select-none transition-all hover:scale-105 active:scale-95';
  const isMove = kind === 'up' || kind === 'down';
  const cls = isMove 
    ? `${base} border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400` 
    : kind === 'plus'
    ? `${base} border border-[#1E5EFF] text-white bg-[#1E5EFF] hover:bg-[#1E5EFF]/90`
    : `${base} border border-red-500 text-white bg-red-500 hover:bg-red-600`;
  
  const title = kind === 'up' 
    ? '위로 이동' 
    : kind === 'down' 
    ? '아래로 이동' 
    : kind === 'plus' 
    ? '추가' 
    : '삭제';
  
  return (
    <button 
      type="button" 
      onClick={onClick} 
      className={cls} 
      aria-label={kind} 
      title={title}
    >
      {kind === 'up' && <ChevronUp size={16} strokeWidth={2.2} />}
      {kind === 'down' && <ChevronDown size={16} strokeWidth={2.2} />}
      {kind === 'plus' && <Plus size={16} strokeWidth={2.2} />}
      {kind === 'minus' && <Minus size={16} strokeWidth={2.2} />}
    </button>
  );
}

