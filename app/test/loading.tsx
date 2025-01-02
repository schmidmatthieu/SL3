export default function Loading() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="p-4 bg-muted rounded-lg animate-pulse">
        <div className="h-4 bg-muted-foreground/20 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-muted-foreground/10 rounded"></div>
      </div>
    </div>
  );
}
