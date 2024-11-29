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
    <section className="py-fluid-12">
      <div className="text-center mb-fluid-10">
        <h2 className="text-fluid-4xl font-bold tracking-tighter mb-fluid-4">
          Powered by <span className="text-gradient">Innovation</span>
        </h2>
        <p className="text-fluid-lg text-muted-foreground max-w-[800px] mx-auto">
          Experience the next generation of event management with our cutting-edge features
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-fluid-6">
        {features.map((feature) => (
          <div key={feature.title} className="glass-card p-fluid-6">
            <div className="flex flex-col gap-fluid-4">
              <div className="p-fluid-2 glass w-fit rounded-lg">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-fluid-xl font-semibold">{feature.title}</h3>
              <p className="text-fluid-base text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}