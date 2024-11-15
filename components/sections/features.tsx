import {
  CalendarDays,
  Users,
  Building2,
  Clock,
  Shield,
  LineChart
} from 'lucide-react';

const features = [
  {
    title: 'Event Planning',
    description: 'Comprehensive tools for planning and organizing events of any scale',
    icon: CalendarDays,
  },
  {
    title: 'Attendee Management',
    description: 'Effortlessly manage registrations, check-ins, and attendee communications',
    icon: Users,
  },
  {
    title: 'Venue Booking',
    description: 'Access to Switzerland s premier venues with real-time availability',
    icon: Building2,
  },
  {
    title: 'Real-time Updates',
    description: 'Stay informed with instant updates and live event monitoring',
    icon: Clock,
  },
  {
    title: 'Secure Platform',
    description: 'Enterprise-grade security for your events and attendee data',
    icon: Shield,
  },
  {
    title: 'Analytics',
    description: 'Comprehensive insights and reporting for event performance',
    icon: LineChart,
  },
];

export function FeaturesSection() {
  return (
    <section className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-4 p-6 bg-muted/50 rounded-lg"
          >
            <feature.icon className="h-6 w-6 text-primary" />
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}