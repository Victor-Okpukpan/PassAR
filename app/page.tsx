"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Ticket, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 relative">
        <div className="absolute inset-0 bg-[url('/hero.webp')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative container mx-auto px-4 py-32">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-6">
              Decentralized Event Management on AO.
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Create, manage, and discover events on the
              permaweb.
            </p>
            <div className="flex gap-4">
              <Link href="/events">
                <Button size="lg" variant="default" className="flex items-center hover:opacity-90">
                  Browse Events
                </Button>
              </Link>

              <Link href="/create">
                <Button size="lg" variant="outline" className="hover:opacity-90">
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Why Choose PassAR?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Decentralized & Permanent
              </h3>
              <p className="text-muted-foreground">
                All event data are stored on Arweave,
                ensuring transparency and immutability.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verifiable QR Generated Tickets</h3>
              <p className="text-muted-foreground">
                Each ticket is uniquely generated from your verified registration details on AO.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Easy Event Management
              </h3>
              <p className="text-muted-foreground">
                Create and manage events with powerful tools for organizers and
                a seamless experience for attendees.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
