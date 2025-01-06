'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <h2 className="font-semibold mb-2">Something went wrong!</h2>
        <p className="mb-4">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
