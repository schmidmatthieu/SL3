import { Button } from '@/components/core/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/core/ui/card';

const plans = [
  {
    name: 'Basic',
    price: 'CHF 99',
    description: 'Perfect for small events',
    features: ['Up to 3 events/month', 'Basic analytics', 'Email support'],
  },
  {
    name: 'Professional',
    price: 'CHF 299',
    description: 'For growing organizations',
    features: ['Unlimited events', 'Advanced analytics', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: ['Custom solutions', 'Dedicated support', 'SLA guarantee'],
  },
];

export default function PricingPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Pricing Plans</h1>
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {plans.map(plan => (
          <Card key={plan.name}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">{plan.price}</div>
              <ul className="space-y-2">
                {plan.features.map(feature => (
                  <li key={feature} className="text-sm text-muted-foreground">
                    • {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Get Started</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
