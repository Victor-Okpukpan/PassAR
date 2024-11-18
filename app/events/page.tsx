/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MapPin, Search, Users, Wallet } from "lucide-react";
import { dryrun } from "@permaweb/aoconnect";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function getEvents() {
      try {
        const result = await dryrun({
          process: process.env.NEXT_PUBLIC_AO_PROCESS!,
          tags: [{ name: "Action", value: "GetEvents" }],
        });
        setEvents(result.Messages[0].Tags[4].value);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch events. Please try again later.",
          variant: "destructive",
        });
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    getEvents();

    // Check wallet connection
    async function checkWallet() {
      try {
        const addr = await window.arweaveWallet.getActiveAddress();
        setWalletAddress(addr);
      } catch (error) {
        setWalletAddress(null);
        console.log(error);
      }
    }
    checkWallet();
  }, [toast]);

  const handleGetTickets = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to get tickets",
        action: (
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await window.arweaveWallet.connect([
                  "ACCESS_ADDRESS",
                  "SIGN_TRANSACTION",
                ]);
                const addr = await window.arweaveWallet.getActiveAddress();
                setWalletAddress(addr);
                toast({
                  title: "Wallet Connected",
                  description: "You can now get tickets for events",
                });
              } catch (error) {
                toast({
                  title: "Connection Failed",
                  description: "Please install ArConnect or try again",
                  variant: "destructive",
                });
                console.log(error);
              }
            }}
          >
            Connect Wallet
          </Button>
        ),
      });
      return;
    }

    // Handle ticket purchase logic here
    toast({
      title: "Coming Soon",
      description: "Ticket purchasing will be available soon!",
    });
  };

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
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-muted-foreground">No events found</p>
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
              </div>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(event.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    {event.noOfRegistrations} registered
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="font-semibold">
                  {event.ticketPrice === "0" ? "Free" : `$${event.ticketPrice}`}
                </span>
                <Button onClick={() => handleGetTickets()}>
                  {!walletAddress && <Wallet className="mr-2 h-4 w-4" />}
                  Get Tickets
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
