/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Users,
  QrCode,
  Clock,
  Ticket,
  Share2,
} from "lucide-react";
import {
  dryrun,
  createDataItemSigner,
  message,
  result,
} from "@permaweb/aoconnect";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { QrCodeDialog } from "@/components/ui/qr-code-dialog";
import QRCode from "qrcode";
import Link from "next/link";

export default function EventDetailsClient({
  params,
}: {
  params: { id: number };
}) {
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const { toast } = useToast();

  const AO_PROCESS = "yr6ytHmqw_WSOnDZSNjyin6D0SSt2LvlKEB4dYqOabg";
  const PASS_TOKEN_PROCESS = "APgPW8AVfANq2dzTLjuEI_8VT4i67ms47S9e1kPyjec";

  useEffect(() => {
    async function getEventDetails() {
      try {
        const result = await dryrun({
          process: AO_PROCESS,
          tags: [
            { name: "Action", value: "GetEvents" },
            // { name: "EventId", value: params.id.toString() },
          ],
        });

        const allEvents = result.Messages[0].Tags[4].value.map(
          (event: any) => ({
            ...event,
            active: event.active === "true",
          })
        );

        console.log(allEvents);

        const eventDetails = allEvents.find(
          (e: any) => e.id.toString() === params.id
        );

        if (eventDetails) {
          setEvent(eventDetails);
        } else {
          toast({
            title: "Error",
            description: "Event not found",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch event details. Please try again later.",
          variant: "destructive",
        });
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }

    async function checkWallet() {
      try {
        const addr = await window.arweaveWallet.getActiveAddress();
        setWalletAddress(addr);
      } catch (error) {
        setWalletAddress(null);
        console.log(error);
      }
    }

    getEventDetails();
    checkWallet();
  }, [params.id, toast]);

  const convertTo12Decimals = (value: string): string => {
    const numericValue = Number.parseFloat(value);
    const multipliedValue = numericValue * 10 ** 12;
    return multipliedValue.toFixed(0);
  };

  const handleGetTickets = async (
    id: number,
    ticketPrice: string,
    tokenProcess: string
  ) => {
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
            //TODO: get the token id for the event passed
            process: tokenProcess,
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
            description: `Make sure you have the required amount of tokens.`,
            variant: "destructive",
          });
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleShowQRCode = async (event: any) => {
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

  const handleShare = async () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "URL Copied",
      description: "The event URL has been copied to your clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full mb-8" />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-muted-foreground">Event not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const WAR_TOKEN_PROCESS = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10";
  // const DUMDUM_TOKEN_PROCESS = "jtGHIv6MRIwUSlxVUTDwX7X0gYEGKQynIqvkelIOdL4";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
          <div className="p-8 w-full">
            <div className="flex justify-between items-end">
              <div>
                {/* <h1 className="text-4xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                <p className="text-xl text-white opacity-75">
                  {event.description}
                </p> */}
              </div>
              <Button
                onClick={handleShare}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Event Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-muted-foreground">
                      {new Date(
                        `${new Date(event.date).toISOString().slice(0, 10)}T${
                          event.time
                        }`
                      ).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Location</p>
                    {event.location != "" ? (
                      event.googleMapLink == "" ? (
                        <p className="text-muted-foreground">
                          {event.location}
                        </p>
                      ) : (
                        <Link href={event.googleMapLink}>
                          <p className="text-muted-foreground">
                            {event.location}
                          </p>
                        </Link>
                      )
                    ) : (
                      <Link href={event.virtualLink}>{event.virtualLink}</Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Attendees</p>
                    <p className="text-muted-foreground">
                      {event.ticketPrice !== "0"
                        ? event.paidUsers.length
                        : event.noOfRegistrations}{" "}
                      registered
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Ticket className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Price</p>
                    <p className="text-muted-foreground">
                      {event.ticketPrice === "0"
                        ? "Free"
                        : `${event.ticketPrice} ${
                            event.paymentTokenProcessID === WAR_TOKEN_PROCESS
                              ? "$wAR"
                              : "$DUMDUM"
                          }`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">About the Event</h2>
              <p className="text-muted-foreground">{event.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Registration</h2>
              <div className="space-y-4">
                <p className="text-lg font-medium">
                  {isRegistered ? "You're registered!" : "Secure your spot now"}
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  disabled={!event.active || isRegistered}
                  onClick={() =>
                    handleGetTickets(
                      event.id,
                      event.ticketPrice,
                      event.paymentTokenProcessID
                    )
                  }
                >
                  {!event.active
                    ? "Completed"
                    : isRegistered
                    ? "Already registered"
                    : "Register Now"}
                </Button>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Event Organizer</h2>
              <div className="flex items-center">
                <div>
                  <p className="font-medium">{event.creator}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
