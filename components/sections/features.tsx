'use client';

import {
  CalendarDays,
  Users,
  Building2,
  Clock,
  Shield,
  LineChart
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const features = [
  {
    key: 'eventPlanning',
    icon: CalendarDays,
  },
  {
    key: 'attendeeManagement',
    icon: Users,
  },
  {
    key: 'venueBooking',
    icon: Building2,
  },
  {
    key: 'realTimeUpdates',
    icon: Clock,
  },
  {
    key: 'securePlatform',
    icon: Shield,
  },
  {
    key: 'analytics',
    icon: LineChart,
  },
];

export function FeaturesSection() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <section className="responsive-container py-24 sm:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Powered by <span className="text-gradient">Innovation</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
            Experience the next generation of event management
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="glass-card p-6 group transition-all duration-300 hover:translate-y-[-2px]"
            >
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-gradient transition-all">
                  Feature
                </h3>
                <p className="text-sm text-muted-foreground">Description</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="responsive-container py-24 sm:py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
          {t('features.title')}{' '}
          <span className="text-gradient">{t('features.titleHighlight')}</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
          {t('features.subtitle')}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.key}
            className="glass-card p-6 group transition-all duration-300 hover:translate-y-[-2px]"
          >
            <div className="relative z-10">
              <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-gradient transition-all">
                {t(`features.list.${feature.key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(`features.list.${feature.key}.description`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}