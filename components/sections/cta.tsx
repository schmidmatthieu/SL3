import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="container py-24 sm:py-32">
      <div className="bg-muted/50 rounded-3xl px-6 py-12 md:px-12 md:py-24 text-center">
        <div className="mx-auto max-w-2xl space-y-8">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to Create Your Next Event?
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground text-lg">
            Join thousands of event organizers who trust SL3 to deliver exceptional experiences.
            Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/get-started">Get Started Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}