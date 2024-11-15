import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative border-b bg-card clip-diagonal overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="responsive-container relative py-24 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass glass-hover rounded-full">
              <CalendarClock className="h-4 w-4 text-primary" />
              <span className="text-sm">The Future of Event Management</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Transform Your Events into{' '}
                <span className="text-gradient">Digital Experiences</span>
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl">
                The most comprehensive event management platform in Switzerland. Plan, organize, and execute
                world-class events with cutting-edge technology.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                variant="default"
                asChild
              >
                <Link href="/get-started">Get Started</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
              >
                <Link href="/demo">Request Demo</Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-primary/10">
              <div className="glass-card p-4">
                <div className="text-3xl font-bold text-gradient">500+</div>
                <div className="text-sm text-muted-foreground mt-1">Events Managed</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-3xl font-bold text-gradient">50k+</div>
                <div className="text-sm text-muted-foreground mt-1">Active Users</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-3xl font-bold text-gradient">99.9%</div>
                <div className="text-sm text-muted-foreground mt-1">Uptime</div>
              </div>
            </div>
          </div>

          <div className="relative aspect-square lg:aspect-auto lg:h-[600px]">
            <div className="absolute inset-0 glass rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2940&auto=format&fit=crop"
                alt="Digital Event Management"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/80 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}