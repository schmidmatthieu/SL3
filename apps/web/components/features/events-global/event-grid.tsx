import { events } from '@/lib/constants/data';
import { EventCard } from '@/components/features/events-global/event-card';

export function EventGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
