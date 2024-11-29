import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export function CTASection() {
  return (
    <section className="py-fluid-12">
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        
        <div className="glass p-fluid-8 relative">
          <div className="grid lg:grid-cols-2 gap-fluid-8 items-center">
            <div className="space-y-fluid-6">
              <h2 className="text-fluid-4xl font-bold tracking-tighter">
                Ready to Create Your{' '}
                <span className="text-gradient">Next Event?</span>
              </h2>
              <p className="text-fluid-lg text-muted-foreground">
                Join thousands of event organizers who trust SL3 to deliver exceptional experiences.
                Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-fluid-3">
                <Button
                  size="lg"
                  variant="default"
                  asChild
                >
                  <Link href="/get-started">Get Started Now</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>

            <div className="relative aspect-square lg:aspect-auto lg:h-[400px]">
              <div className="absolute inset-0 glass rounded-xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2940&auto=format&fit=crop"
                  alt="Event Management Platform"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-background/80 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}