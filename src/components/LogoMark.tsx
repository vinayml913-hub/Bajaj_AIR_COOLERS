import { Wind } from 'lucide-react';

type LogoMarkProps = { compact?: boolean };

export function LogoMark({ compact = false }: LogoMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0c4795] text-white shadow-lg shadow-blue-900/20">
        <Wind size={21} strokeWidth={2.4} />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-[15px] font-extrabold tracking-[0.08em] text-[#0c4795]">BAJAJ</p>
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-500">AIR COOLERS</p>
        </div>
      )}
    </div>
  );
}
