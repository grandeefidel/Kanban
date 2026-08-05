"use client";

import dynamic from "next/dynamic";

const Board = dynamic(() => import("./Board").then((m) => m.Board), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center text-sm text-gray-text">
      Loading board...
    </div>
  ),
});

export function BoardApp() {
  return <Board />;
}
