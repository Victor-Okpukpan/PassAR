'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Search, Users } from 'lucide-react';

// Mock data - In production, this would come from AO
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Web3 Developer Conference 2024',
    date: '2024-06-15',
    location: 'Virtual Event',
    price: 0,
    capacity: 500,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    title: 'Blockchain Gaming Summit',
    date: '2024-07-20',
    location: 'New York, NY',
    price: 299,
    capacity: 200,
    image: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    title: 'DeFi Workshop 2024',
    date: '2024-08-10',
    location: 'London, UK',
    price: 149,
    capacity: 150,
    image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&q=80',
  },
];

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_EVENTS.map((event) => (
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
                  Capacity: {event.capacity}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="font-semibold">
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </span>
              <Button>Get Tickets</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}