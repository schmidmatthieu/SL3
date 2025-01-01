import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h2 className="text-2xl font-bold">Événement non trouvé</h2>
      <p>L&apos;événement que vous recherchez n&apos;existe pas ou a été supprimé.</p>
      <Button asChild>
        <Link href="/events">
          Retour aux événements
        </Link>
      </Button>
    </div>
  );
}
