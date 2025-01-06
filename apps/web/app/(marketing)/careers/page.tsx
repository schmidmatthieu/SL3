import { Button } from '@/components/core/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/core/ui/card';

const positions = [
  {
    title: 'Senior Frontend Developer',
    location: 'Zürich, Switzerland',
    type: 'Full-time',
  },
  {
    title: 'Product Manager',
    location: 'Geneva, Switzerland',
    type: 'Full-time',
  },
  {
    title: 'UX Designer',
    location: 'Remote, Switzerland',
    type: 'Full-time',
  },
];

export default function CareersPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Careers at SL3</h1>
      <p className="text-muted-foreground mb-8">
        Join our team and help shape the future of event management
      </p>

      <div className="space-y-4">
        {positions.map(position => (
          <Card key={position.title}>
            <CardHeader>
              <CardTitle>{position.title}</CardTitle>
              <CardDescription>
                {position.location} • {position.type}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button>Apply Now</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
