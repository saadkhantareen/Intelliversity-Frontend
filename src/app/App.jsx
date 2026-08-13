import { Suspense } from 'react';

import AppRouter from '@/app/router/AppRouter';
import { useBrandingEffects } from '@/features/branding/hooks/useBrandingEffects';

function FullScreenLoader({ text = 'Loading...' }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-400">{text}</p>
    </div>
  );
}

export default function App() {
  useBrandingEffects();

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <AppRouter />
    </Suspense>
  );
}
