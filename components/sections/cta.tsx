import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export function CTASection() {
  return (
    <section className="responsive-container py-24 sm:py-32">
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        
        <div className="glass p-8 md:p-12 lg:p-16 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Create Your{' '}
                <span className="text-gradient">Next Event?</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Join thousands of event organizers who trust SL3 to deliver exceptional experiences.
                Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
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