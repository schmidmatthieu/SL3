'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useEvents } from '@/hooks/useEvents';
import { BackButton } from '@/components/core/ui/back-button';
import { ViewAnalytics } from '@/components/features/events-global/management/analytics/view-analytics';
import { useToast } from '@/components/core/ui/use-toast';

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = params.slug as string;
  const { currentEvent, fetchEvent } = useEvents(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        if (!slug) {
          toast({
            title: 'Error',
            description: 'Event not found',
            variant: 'destructive',
          });
          router.push('/events');
          return;
        }
        await fetchEvent(slug);
        setLoading(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load event',
          variant: 'destructive',
        });
        router.push('/events');
      }
    };
    loadEvent();
  }, [slug, fetchEvent, router, toast]);

  if (loading || !currentEvent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-bold tracking-tight mb-8">View Analytics</h1>
      <ViewAnalytics event={currentEvent} />
    </div>
  );
}
