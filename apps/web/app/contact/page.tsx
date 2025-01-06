import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>Get in touch with our team for any inquiries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="First Name" />
            <Input placeholder="Last Name" />
          </div>
          <Input type="email" placeholder="Email" />
          <Input placeholder="Subject" />
          <Textarea placeholder="Your message" className="min-h-[150px]" />
        </CardContent>
        <CardFooter>
          <Button className="w-full">Send Message</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
