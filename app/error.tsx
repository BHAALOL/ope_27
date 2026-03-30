"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-red-400">!</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          Une erreur est survenue
        </h2>
        <p className="text-gray-400 mb-6">
          Nous sommes désolés, une erreur inattendue s&apos;est produite.
          Veuillez réessayer.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
