import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboards/ui/card";
import { Button } from "@/components/dashboards/ui/button";

const About = () => {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">About Dentalink</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Dentalink connects patients and providers with secure, modern teledentistry tools.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Our mission</CardTitle>
            <CardDescription>
              Make quality oral care accessible, coordinated, and effortless for everyone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We built Dentalink to remove barriers to dental care. From secure virtual
              consultations and streamlined scheduling to clear care plans, our platform empowers
              patients and helps providers deliver continuity of care.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What we offer</CardTitle>
            <CardDescription>Tools that simplify care for patients and teams.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
              <li>Virtual appointments with secure, compliant video and messaging</li>
              <li>Smart scheduling and automated reminders</li>
              <li>Unified records and care plans across visits</li>
              <li>Secure payments and transparent billing</li>
              <li>Seamless patient experience—any device, anywhere</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">99.9%</CardTitle>
            <CardDescription>Platform uptime</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Reliable access so care teams can focus on patients, not tools.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">HIPAA-ready</CardTitle>
            <CardDescription>Privacy and security</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Built with strong safeguards to protect patient data and trust.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">24/7</CardTitle>
            <CardDescription>Support</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Help when you need it—documentation, chat, and dedicated assistance.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex items-center justify-center gap-3">
        <Button asChild>
          <a href="/contact">Contact us</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/">Explore features</a>
        </Button>
      </div>
    </div>
  );
};

export default About;
