import { EventGrid } from '@/components/events/event-grid';

export default function EventsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">All Events</h1>
      <EventGrid />
    </div>
  );
}