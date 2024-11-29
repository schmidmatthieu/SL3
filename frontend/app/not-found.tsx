export default function NotFound() {
  return (
    <div className="container flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-primary hover:underline">
          Return Home
        </a>
      </div>
    </div>
  );
}