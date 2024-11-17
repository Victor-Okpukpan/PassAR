/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Plus, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Mock data - In production, this would be filtered by creator's address
const MOCK_CREATOR_EVENTS = [
  {
    id: '1',
    title: 'Web3 Developer Conference 2024',
    date: '2024-06-15',
    location: 'Virtual Event',
    price: 0,
    capacity: 500,
    ticketsSold: 234,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
  },
];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your events and track ticket sales</p>
        </div>
        <Link href="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {MOCK_CREATOR_EVENTS.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-sm mx-auto">
              <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start creating your first event and manage ticket sales right here.
              </p>
              <Link href="/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_CREATOR_EVENTS.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="relative h-48">
                <img
                  src={event.image}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    {event.ticketsSold} / {event.capacity} tickets sold
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="font-semibold">
                  {event.price === 0 ? 'Free' : `$${event.price}`}
                </span>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsLoading(true);
                    toast({
                      title: "Coming Soon",
                      description: "Event management features are under development",
                    });
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Manage Event'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}