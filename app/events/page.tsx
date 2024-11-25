/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
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
import { Calendar, MapPin, QrCode, Search, Users } from "lucide-react";
import {
  createDataItemSigner,
  dryrun,
  message,
  result,
} from "@permaweb/aoconnect";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { QrCodeDialog } from "@/components/ui/qr-code-dialog";
import QRCode from "qrcode";
import { FaucetButton } from "@/components/faucet-button";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const { toast } = useToast();

  const AO_PROCESS = "ijdhVu_HrhR8SvsosfjQ3LoYfsEClg2mQ4g64D2t2MA";
  const PASS_TOKEN_PROCESS = "6zfJ9Lw6e3mIAnwLt5JlnglLMF1kEQnhSPjmLDGC5ag";

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    async function getEvents() {
      try {
        const result = await dryrun({
          process: AO_PROCESS,
          tags: [{ name: "Action", value: "GetEvents" }],
        });

        const allEvents = result.Messages[0].Tags[4].value.map(
          (event: any) => ({
            ...event,
            active: event.active === "true",
          })
        );

        setEvents(allEvents);
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

  const convertTo12Decimals = (value: string): string => {
    const numericValue = parseFloat(value);
    const multipliedValue = numericValue * 10 ** 12;
    return multipliedValue.toFixed(0);
  };

  const handleGetTickets = async (id: number, ticketPrice: string) => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to get tickets",
      });
      return;
    }

    try {
      if (ticketPrice === "0") {
        const messageId = await message({
          process: AO_PROCESS,
          tags: [
            { name: "Action", value: "RegisterForEvent" },
            { name: "EventId", value: id.toString() },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
        });

        toast({
          title: "Registered for Free!",
          description: `Message Id: ${messageId}`,
        });
      } else {
        try {
          const messageId = await message({
            process: PASS_TOKEN_PROCESS,
            tags: [
              { name: "Action", value: "Transfer" },
              { name: "Quantity", value: convertTo12Decimals(ticketPrice) },
              { name: "Recipient", value: AO_PROCESS },
              { name: "X-EventId", value: id.toString() },
            ],
            signer: createDataItemSigner(window.arweaveWallet),
          });

          const _result = await result({
            message: messageId,
            process: PASS_TOKEN_PROCESS,
          });

          console.log(_result.Messages[0].Tags[4].name);
          if (_result.Messages[0].Tags[4].name === "Error") {
            throw new Error(`${_result.Messages[0].Tags[4].value}`);
          }

          toast({
            title: "You have paid for this event!",
            description: `Message ID: ${messageId}`,
          });
        } catch (error) {
          toast({
            title: "Error paying for event",
            description: `Make sure you have some $PASS tokens.`,
            variant: "destructive",
          });
          console.log(error);
        }
      }

      async function getEvents() {
        try {
          const result = await dryrun({
            process: AO_PROCESS,
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
    } catch (error) {
      console.log(error);
    }
  };

  const handleShowQRCode = async (event: any) => {
    setSelectedEvent(event);
    try {
      const data = {
        eventId: event.id,
        eventTitle: event.title,
        walletAddress,
        registrationType: event.ticketPrice === "0" ? "free" : "paid",
        registrationDate: event.timestamp,
        location: event.location,
        date: event.date,
      };

      const qrCodeData = await QRCode.toDataURL(JSON.stringify(data));
      setQrCodeUrl(qrCodeData);
      setRegistrationData(data);
      setIsQrDialogOpen(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <div className="flex justify-end">
          <FaucetButton />
        </div>
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
      ) : filteredEvents.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-muted-foreground">No events found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isRegistered =
              event.ticketPrice !== "0"
                ? event.paidUsers &&
                  event.paidUsers.some(
                    (wallet: string) =>
                      wallet.toLowerCase() === walletAddress?.toLowerCase()
                  )
                : event.registeredUsers &&
                  event.registeredUsers.some(
                    (wallet: string) =>
                      wallet.toLowerCase() === walletAddress?.toLowerCase()
                  );

            return (
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
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      {event.ticketPrice !== "0"
                        ? event.paidUsers.length
                        : event.noOfRegistrations}{" "}
                      registered
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="flex justify-between items-center w-full">
                    <span className="font-semibold">
                      {event.ticketPrice === "0"
                        ? "Free"
                        : `${event.ticketPrice} $PASS`}
                    </span>
                    <Button
                      disabled={!event.active || isRegistered}
                      className="disabled:opacity-85"
                      onClick={() =>
                        handleGetTickets(event.id, event.ticketPrice)
                      }
                    >
                      {!event.active
                        ? "Event Inactive"
                        : isRegistered
                        ? "Already registered"
                        : "Register"}
                    </Button>
                  </div>
                  {isRegistered && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleShowQRCode(event)}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Show QR Code
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {registrationData && (
        <QrCodeDialog
          isOpen={isQrDialogOpen}
          onOpenChange={setIsQrDialogOpen}
          qrCodeUrl={qrCodeUrl}
          registrationData={registrationData}
        />
      )}
    </div>
  );
}
