# Bajaj Air Coolers · Product Knowledge Assessment

A 50-question product knowledge assessment for the Bajaj Air Coolers training programme.
Question order and answer-option order are shuffled for every learner, and scoring is calculated on submission.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 (CSS-based config in `src/app/globals.css`)
- class-variance-authority + tailwind-merge + clsx (`src/lib/utils.ts`, `src/components/ui/button.tsx`)
- lucide-react icons

## Requirements

Node.js 20.9 or later.

## Run

```bash
npm install
npm run dev        # development server on http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run lint
npm run typecheck
```

## Structure

```
src/
  app/            layout.tsx, page.tsx, globals.css, icon.svg (favicon)
  components/     App.tsx (assessment UI), QuestionCard, LogoMark, AssessmentLoader, ui/button.tsx
  data/           questions.ts (the 50 questions and correct answers)
  lib/            assessment.ts (shuffle + scoring), utils.ts (cn helper)
```

## Notes

- The learner's in-progress session and last result are stored in the browser (`localStorage`);
  there is no backend. The assessment is therefore rendered on the client only.
- The pass mark is set in `src/lib/assessment.ts` (`PASSING_PERCENTAGE`).
