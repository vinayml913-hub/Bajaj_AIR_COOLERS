import { Check, Circle } from 'lucide-react';
import type { Question } from '@/data/questions';
import { cn } from '@/lib/utils';

type QuestionCardProps = {
  question: Question;
  optionOrder: number[];
  selectedIndex?: number;
  onSelect: (originalIndex: number) => void;
};

export function QuestionCard({ question, optionOrder, selectedIndex, onSelect }: QuestionCardProps) {
  return (
    <div className="animate-fade-up">
      <div className="mb-8 flex items-center gap-3">
        <span className="rounded-full bg-[#e9f1ff] px-3 py-1.5 text-xs font-bold text-[#0c4795]">Question {question.id}</span>
        <span className="text-sm font-medium text-slate-400">{question.module}</span>
      </div>
      <h1 className="max-w-3xl text-2xl font-bold leading-[1.28] tracking-[-0.02em] text-slate-900 sm:text-[30px]">{question.prompt}</h1>
      <div className="mt-8 grid gap-3">
        {optionOrder.map((originalIndex, displayIndex) => {
          const isSelected = selectedIndex === originalIndex;
          return (
            <button
              key={originalIndex}
              type="button"
              onClick={() => onSelect(originalIndex)}
              className={cn('group flex min-h-[72px] items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5', isSelected ? 'border-[#0c4795] bg-[#eef5ff] shadow-[0_8px_24px_rgba(12,71,149,0.12)]' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#8eb3e9] hover:shadow-[0_8px_22px_rgba(19,46,83,0.08)]')}
            >
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors', isSelected ? 'border-[#0c4795] bg-[#0c4795] text-white' : 'border-slate-300 bg-slate-50 text-slate-500 group-hover:border-[#0c4795] group-hover:text-[#0c4795]')}>
                {isSelected ? <Check size={17} strokeWidth={3} /> : String.fromCharCode(65 + displayIndex)}
              </span>
              <span className={cn('text-[15px] leading-6 sm:text-base', isSelected ? 'font-semibold text-[#0c4795]' : 'font-medium text-slate-700')}>{question.options[originalIndex]}</span>
              <span className="ml-auto shrink-0 text-slate-300">{isSelected ? <Check size={18} className="text-[#0c4795]" /> : <Circle size={18} />}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
