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
    description: "Access to Switzerland's premier venues with real-time availability",
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
    <section className="responsive-container py-24 sm:py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
          Powered by <span className="text-gradient">Innovation</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
          Experience the next generation of event management with our cutting-edge features
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="glass-card p-6 group transition-all duration-300 hover:translate-y-[-2px]"
          >
            <div className="relative z-10">
              <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-gradient transition-all">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}