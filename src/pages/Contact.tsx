import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      toast({
        title: "Missing information",
        description: "Please fill in your name, email, and message.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      (e.currentTarget as HTMLFormElement).reset();
      toast({
        title: "Message sent",
        description: "Thanks for reaching out! We'll get back to you soon.",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Contact Us</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          We would love to hear from you. Send us a message and we’ll respond shortly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>Fill out the form and we will be in touch.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" placeholder="Jane Doe" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="jane@example.com" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="How can we help?" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="Write your message here..." rows={6} required />
              </div>
              <div className="flex items-center justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send message"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Contact information</CardTitle>
            <CardDescription>Reach us using the details below.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-sm">
              <div>
                <p className="mb-1 font-medium">Address</p>
                <p className="text-muted-foreground">123 Smile Street, Suite 200<br/>Nairobi, Kenya</p>
              </div>
              <div>
                <p className="mb-1 font-medium">Phone</p>
                <p className="text-muted-foreground">+254 700 000000</p>
              </div>
              <div>
                <p className="mb-1 font-medium">Email</p>
                <p className="text-muted-foreground">support@smileaccesshub.com</p>
              </div>
              <div>
                <p className="mb-1 font-medium">Hours</p>
                <p className="text-muted-foreground">Mon–Fri: 8:00 AM – 6:00 PM<br/>Sat: 9:00 AM – 2:00 PM</p>
              </div>

              <div className="pt-2">
                <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Map placeholder. Replace with an embedded map if needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
