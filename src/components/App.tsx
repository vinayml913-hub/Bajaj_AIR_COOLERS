'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  FileText,
  RotateCcw,
  ShieldCheck,
  Trophy,
  X,
  XCircle,
} from 'lucide-react';
import { questions } from '@/data/questions';
import type { Question } from '@/data/questions';
import { LogoMark } from '@/components/LogoMark';
import { QuestionCard } from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  createSession,
  getAnsweredCount,
  PASSING_PERCENTAGE,
  scoreAssessment,
  type AssessmentResult,
  type AssessmentSession,
} from '@/lib/assessment';

type Screen = 'welcome' | 'assessment' | 'results';

const SESSION_KEY = 'bajaj-air-coolers-active-session';
const RESULT_KEY = 'bajaj-air-coolers-last-result';

function readStored<T>(key: string): T | null {
  const value = localStorage.getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function App() {
  const storedSession = readStored<AssessmentSession>(SESSION_KEY);
  const storedResult = readStored<AssessmentResult & { learnerName: string }>(RESULT_KEY);
  const [screen, setScreen] = useState<Screen>(storedSession ? 'assessment' : storedResult ? 'results' : 'welcome');
  const [session, setSession] = useState<AssessmentSession | null>(storedSession);
  const [result, setResult] = useState<(AssessmentResult & { learnerName: string }) | null>(storedResult);
  const [nameInput, setNameInput] = useState(storedSession?.learnerName ?? '');
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);

  useEffect(() => {
    if (result) localStorage.setItem(RESULT_KEY, JSON.stringify(result));
  }, [result]);

  const answeredCount = session ? getAnsweredCount(session) : 0;
  const activeQuestion = session ? questions.find((question) => question.id === session.order[session.currentIndex]) : null;
  const activeOptionOrder = activeQuestion && session ? session.optionOrders[String(activeQuestion.id)] : [];
  const moduleCount = useMemo(() => new Set(questions.map((question) => question.module)).size, []);

  function startAssessment() {
    const cleanName = nameInput.trim();
    if (!cleanName) {
      setNotice('Please enter your name to begin.');
      return;
    }
    setSession(createSession(cleanName, questions));
    setResult(null);
    localStorage.removeItem(RESULT_KEY);
    setNotice('');
    setScreen('assessment');
  }

  function resumeAssessment() {
    if (!session) return;
    setScreen('assessment');
  }

  function setAnswer(originalIndex: number) {
    if (!session || !activeQuestion) return;
    setSession({ ...session, answers: { ...session.answers, [String(activeQuestion.id)]: originalIndex } });
    setNotice('');
  }

  function moveToQuestion(index: number) {
    if (!session) return;
    setSession({ ...session, currentIndex: index });
    setNotice('');
  }

  function handleNext() {
    if (!session) return;
    if (session.currentIndex < questions.length - 1) moveToQuestion(session.currentIndex + 1);
    else if (answeredCount === questions.length) setShowSubmitConfirm(true);
    else setNotice(`Answer all ${questions.length} questions before submitting. ${questions.length - answeredCount} remaining.`);
  }

  function handlePrevious() {
    if (!session) return;
    if (session.currentIndex > 0) moveToQuestion(session.currentIndex - 1);
  }

  function submitAssessment() {
    if (!session) return;
    const scored = scoreAssessment(session, questions);
    setResult({ ...scored, learnerName: session.learnerName });
    setSession(null);
    setShowSubmitConfirm(false);
    setScreen('results');
  }

  function startFresh() {
    setSession(null);
    setResult(null);
    setNameInput('');
    setNotice('');
    localStorage.removeItem(RESULT_KEY);
    setScreen('welcome');
  }

  return (
    <div className="app-shell min-h-screen">
      <header className="glass-nav sticky top-0 z-30">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <LogoMark />
          <div className="hidden items-center gap-2 text-right sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dfeeff] text-xs font-extrabold text-[#0c4795]">BA</div>
            <div className="leading-tight"><p className="text-xs font-bold text-slate-700">Training centre</p><p className="text-[10px] text-slate-400">Learner assessment</p></div>
          </div>
        </div>
      </header>

      {screen === 'welcome' && <WelcomeScreen nameInput={nameInput} setNameInput={setNameInput} startAssessment={startAssessment} resumeAssessment={resumeAssessment} hasActiveSession={Boolean(session)} notice={notice} moduleCount={moduleCount} />}
      {screen === 'assessment' && session && activeQuestion && <AssessmentScreen session={session} question={activeQuestion} optionOrder={activeOptionOrder} answeredCount={answeredCount} notice={notice} setAnswer={setAnswer} moveToQuestion={moveToQuestion} handleNext={handleNext} handlePrevious={handlePrevious} />}
      {screen === 'results' && result && <ResultsScreen result={result} startFresh={startFresh} />}

      {showSubmitConfirm && <SubmitModal answeredCount={answeredCount} onCancel={() => setShowSubmitConfirm(false)} onSubmit={submitAssessment} />}
    </div>
  );
}

type WelcomeScreenProps = { nameInput: string; setNameInput: (value: string) => void; startAssessment: () => void; resumeAssessment: () => void; hasActiveSession: boolean; notice: string; moduleCount: number };

function WelcomeScreen({ nameInput, setNameInput, startAssessment, resumeAssessment, hasActiveSession, notice, moduleCount }: WelcomeScreenProps) {
  return (
    <main className="mx-auto grid max-w-[1280px] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-20 lg:py-20">
      <section className="animate-fade-up">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#cfe0f8] bg-white px-3 py-2 text-xs font-bold text-[#0c4795] shadow-xs"><span className="h-2 w-2 rounded-full bg-[#0c4795] animate-pulse-soft" /> Product knowledge series · 2024–25</div>
        <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.02] tracking-[-0.055em] text-slate-950 sm:text-6xl sm:leading-none">Sell with clarity.<br /><span className="text-[#0c4795]">Know every detail.</span></h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-slate-500">Build confidence across the Bajaj Air Coolers range with a focused product knowledge assessment designed for the people who move the category forward.</p>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm font-semibold text-slate-600"><span className="flex items-center gap-2"><ClipboardCheck size={17} className="text-[#0c4795]" /> 50 questions</span><span className="flex items-center gap-2"><Clock3 size={17} className="text-[#0c4795]" /> Self-paced</span><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-[#0c4795]" /> 70% to pass</span></div>
        <div className="mt-14 grid max-w-xl grid-cols-3 gap-3 sm:gap-5"><div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-100"><p className="text-2xl font-extrabold text-[#0c4795]">{String(moduleCount).padStart(2, '0')}</p><p className="mt-1 text-xs font-semibold text-slate-400">Learning modules</p></div><div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-100"><p className="text-2xl font-extrabold text-[#0c4795]">50</p><p className="mt-1 text-xs font-semibold text-slate-400">Curated questions</p></div><div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-100"><p className="text-2xl font-extrabold text-[#0c4795]">70%</p><p className="mt-1 text-xs font-semibold text-slate-400">Passing score</p></div></div>
      </section>
      <section className="soft-card animate-fade-up rounded-[28px] p-6 sm:p-9" style={{ animationDelay: '100ms' }}>
        <div className="mb-8 flex items-start justify-between"><div><p className="eyebrow">Learner access</p><h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950">Begin your assessment</h2><p className="mt-2 text-sm leading-6 text-slate-500">Enter your name to personalise your scorecard.</p></div><div className="rounded-2xl bg-[#eef5ff] p-3 text-[#0c4795]"><BookOpenCheck size={23} /></div></div>
        {hasActiveSession && <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#cfe0f8] bg-[#f5f9ff] p-4"><RotateCcw size={18} className="mt-0.5 shrink-0 text-[#0c4795]" /><div><p className="text-sm font-bold text-[#0c4795]">You have an assessment in progress</p><p className="mt-1 text-xs leading-5 text-slate-500">Your randomized questions and answers are saved on this device.</p><button type="button" onClick={resumeAssessment} className="mt-3 text-xs font-bold text-[#0c4795] underline underline-offset-4">Resume assessment</button></div></div>}
        <label className="block text-sm font-bold text-slate-700" htmlFor="learner-name">Learner name</label>
        <input id="learner-name" value={nameInput} onChange={(event) => setNameInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') startAssessment(); }} placeholder="e.g. Ananya Sharma" className="mt-3 h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-slate-900 outline-hidden transition focus:border-[#0c4795] focus:bg-white focus:ring-4 focus:ring-[#0c4795]/10" />
        {notice && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-600"><CircleAlert size={16} /> {notice}</p>}
        <Button onClick={startAssessment} className="mt-6 flex h-14 w-full items-center justify-center gap-2 shadow-lg shadow-blue-900/20 hover:-translate-y-0.5">{hasActiveSession ? 'Start a new assessment' : 'Start assessment'} <ArrowRight size={18} /></Button>
        <div className="mt-7 flex items-start gap-3 border-t border-slate-100 pt-6"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#0c4795]" /><p className="text-xs leading-5 text-slate-400">This is a frontend demonstration. Your progress is kept only in this browser and is not shared.</p></div>
      </section>
    </main>
  );
}

type AssessmentScreenProps = { session: AssessmentSession; question: Question; optionOrder: number[]; answeredCount: number; notice: string; setAnswer: (index: number) => void; moveToQuestion: (index: number) => void; handleNext: () => void; handlePrevious: () => void };

function AssessmentScreen({ session, question, optionOrder, answeredCount, notice, setAnswer, moveToQuestion, handleNext, handlePrevious }: AssessmentScreenProps) {
  const remaining = questions.length - answeredCount;
  return (
    <main className="mx-auto max-w-[1280px] px-5 py-7 sm:px-8 sm:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Product knowledge assessment</p><h1 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-3xl">Keep going, {session.learnerName.split(' ')[0]}.</h1></div><div className="text-right"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Completion</p><p className="mt-1 text-2xl font-extrabold text-[#0c4795]">{Math.round((answeredCount / questions.length) * 100)}%</p></div></div>
      <div className="mb-8 h-2 overflow-hidden rounded-full bg-[#dfe8f3]"><div className="h-full rounded-full bg-[#0c4795] transition-all duration-500" style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="soft-card rounded-[28px] p-6 sm:p-10"><QuestionCard question={question} optionOrder={optionOrder} selectedIndex={session.answers[String(question.id)]} onSelect={setAnswer} />{notice && <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"><CircleAlert size={17} /> {notice}</div>}<div className="mt-10 flex items-center justify-between gap-3 border-t border-slate-100 pt-6"><Button variant="ghost" onClick={handlePrevious} disabled={session.currentIndex === 0} className="flex items-center gap-2 px-3 py-3"><ChevronLeft size={18} /> Previous</Button><Button onClick={handleNext} className="flex items-center gap-2 px-5 py-3 shadow-md shadow-blue-900/15 hover:-translate-y-0.5">{session.currentIndex === questions.length - 1 ? 'Review & submit' : 'Next question'} {session.currentIndex === questions.length - 1 ? <Check size={18} /> : <ChevronRight size={18} />}</Button></div></section>
        <aside className="soft-card h-fit rounded-[28px] p-5 lg:sticky lg:top-24"><div className="flex items-start justify-between"><div><p className="text-sm font-extrabold text-slate-900">Assessment map</p><p className="mt-1 text-xs text-slate-400">{answeredCount} answered · {remaining} remaining</p></div><div className="rounded-lg bg-[#eef5ff] p-2 text-[#0c4795]"><FileText size={17} /></div></div><div className="mt-5 grid grid-cols-5 gap-2">{session.order.map((questionId, index) => { const isAnswered = session.answers[String(questionId)] !== undefined; const isCurrent = index === session.currentIndex; return <button key={questionId} type="button" onClick={() => moveToQuestion(index)} aria-label={`Go to question ${index + 1}`} className={cn('relative flex h-9 items-center justify-center rounded-lg text-xs font-bold transition', isCurrent ? 'bg-[#0c4795] text-white shadow-md shadow-blue-900/20' : isAnswered ? 'bg-[#dcecff] text-[#0c4795] hover:bg-[#c8ddfa]' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>{index + 1}{isAnswered && !isCurrent && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#37a26a]" />}</button>; })}</div><div className="mt-6 space-y-2 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-500"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#dcecff]" /> Answered</div><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-100" /> Not answered</div><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#0c4795]" /> Current question</div></div></aside>
      </div>
    </main>
  );
}

type ResultsScreenProps = { result: AssessmentResult & { learnerName: string }; startFresh: () => void };
function ResultsScreen({ result, startFresh }: ResultsScreenProps) {
  return <main className="mx-auto max-w-[1000px] px-5 py-12 sm:px-8 sm:py-20"><section className="soft-card animate-fade-up overflow-hidden rounded-[30px]"><div className={`p-8 text-center sm:p-14 ${result.passed ? 'bg-[#effaf5]' : 'bg-[#fff8ed]'}`}><div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${result.passed ? 'bg-[#d2f3e1] text-[#168251]' : 'bg-[#ffebc8] text-[#b76b00]'}`}>{result.passed ? <Trophy size={30} /> : <XCircle size={30} />}</div><p className="eyebrow mt-7">Assessment complete</p><h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">{result.passed ? 'Well done, ' : 'Keep building, '}{result.learnerName.split(' ')[0]}.</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">{result.passed ? 'You have demonstrated strong product knowledge across the Bajaj Air Coolers range.' : 'Review the product material and try the assessment again when you are ready.'}</p></div><div className="grid gap-4 p-6 sm:grid-cols-4 sm:p-8"><div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Final score</p><p className="mt-2 text-3xl font-extrabold text-[#0c4795]">{result.percentage}%</p></div><div className="rounded-2xl bg-[#effaf5] p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Correct</p><p className="mt-2 text-3xl font-extrabold text-[#168251]">{result.correct}<span className="ml-1 text-base font-bold text-slate-400">/ 50</span></p></div><div className="rounded-2xl bg-[#fff4f2] p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Incorrect</p><p className="mt-2 text-3xl font-extrabold text-[#c94b43]">{result.incorrect}</p></div><div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Result</p><p className={`mt-2 text-xl font-extrabold ${result.passed ? 'text-[#168251]' : 'text-[#b76b00]'}`}>{result.passed ? 'Passed' : 'Not passed'}</p><p className="mt-1 text-xs font-semibold text-slate-400">Pass mark {PASSING_PERCENTAGE}%</p></div></div><div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 py-6 sm:flex-row sm:px-8"><p className="text-xs text-slate-400">Learner record · {result.learnerName} · {new Date().toLocaleDateString('en-IN')}</p><Button onClick={startFresh} className="flex items-center gap-2 px-5 py-3"><RotateCcw size={17} /> Take again</Button></div></section></main>;
}

function SubmitModal({ answeredCount, onCancel, onSubmit }: { answeredCount: number; onCancel: () => void; onSubmit: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102743]/45 p-5 backdrop-blur-xs"><div className="soft-card animate-fade-up relative w-full max-w-md rounded-[26px] p-7 sm:p-8"><button type="button" onClick={onCancel} aria-label="Close confirmation" className="absolute right-5 top-5 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef5ff] text-[#0c4795]"><ClipboardCheck size={23} /></div><h2 className="mt-6 text-2xl font-extrabold tracking-[-0.03em] text-slate-950">Submit your assessment?</h2><p className="mt-3 text-sm leading-6 text-slate-500">You have answered all {answeredCount} questions. Once submitted, your score will be calculated and your answers will be locked.</p><div className="mt-7 flex gap-3"><Button variant="outline" onClick={onCancel} className="flex-1 px-4 py-3">Keep reviewing</Button><Button onClick={onSubmit} className="flex-1 px-4 py-3">Submit now</Button></div></div></div>;
}

export default App;
