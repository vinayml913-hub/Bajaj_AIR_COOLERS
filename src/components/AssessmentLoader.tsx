'use client';

import dynamic from 'next/dynamic';

// The assessment keeps the learner's session in the browser (localStorage), so it is
// rendered on the client only. This avoids server/client markup mismatches on reload.
const App = dynamic(() => import('@/components/App'), {
  ssr: false,
  loading: () => <div className="app-shell min-h-screen" />,
});

export function AssessmentLoader() {
  return <App />;
}
