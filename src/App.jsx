/**
 * App.jsx — The starting point of the entire React application.
 * All it does is render AppRouter, which handles everything else.
 */

import { AppRouter } from "./router/AppRouter";

function MockBanner() {
  const enabled = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === "true";
  if (!enabled) return null;
  return (
    <div className="fixed top-2 right-2 z-50 bg-yellow-100 text-yellow-800 px-3 py-1 rounded shadow-sm text-sm">
      MOCKS ON
    </div>
  );
}

function App() {
  return (
    <>
      <MockBanner />
      <AppRouter />
    </>
  );
}

export default App;
