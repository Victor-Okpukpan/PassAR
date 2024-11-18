/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MapPin, Plus, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { createDataItemSigner, dryrun, message, result } from "@permaweb/aoconnect";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function getEvents() {
      try {
        const result = await dryrun({
          process: process.env.NEXT_PUBLIC_AO_PROCESS!,
          tags: [{ name: "Action", value: "GetUserEvents" }],
        });
        setEvents(result.Messages[0].Tags[4].value);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch events. Please try again later.",
          variant: "destructive",
        });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  
    getEvents();
  }, [toast]);

 
  const handleStatusUpdate = async (event: any) => {
    setIsUpdating(true);
    try {
      const messageId = await message({
        process: process.env.NEXT_PUBLIC_AO_PROCESS!,
        tags: [
          { name: "Action", value: "ModifyEventStatus" },
          { name: "EventId", value: event.id.toString() },
          { name: "Status", value: (!event.active).toString() },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const _result = await result({
        message: messageId,
        process: process.env.NEXT_PUBLIC_AO_PROCESS!,
      });

      console.log(_result);

      // Update local state
      setEvents(events.map(e => 
        e.id === event.id ? { ...e, active: !e.active } : e
      ));

      toast({
        title: "Success",
        description: `Event status has been ${!event.active ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event status. Please try again later.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsUpdating(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your events and track ticket sales
          </p>
        </div>
        <Link href="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48" />
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-sm mx-auto">
              <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start creating your first event and manage ticket sales right
                here.
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
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="relative h-48">
                <img
                  src={event.image}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {event.active ? "Active" : "Inactive"}
                  </span>
                </div>
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
                  {event.price === 0 ? "Free" : `$${event.price}`}
                </span>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsDialogOpen(true);
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Manage Event"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Event</DialogTitle>
            <DialogDescription>
              Update the status of your event. Active events are visible to attendees and can receive ticket purchases.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="event-status">Event Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="event-status"
                    checked={selectedEvent.active}
                    onCheckedChange={() => handleStatusUpdate(selectedEvent)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedEvent.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}