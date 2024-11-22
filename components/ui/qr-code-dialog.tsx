/* eslint-disable @next/next/no-img-element */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Ticket } from "lucide-react";
import { format } from "date-fns";

interface QrCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeUrl: string;
  registrationData: {
    eventId: number;
    eventTitle: string;
    walletAddress: string;
    registrationType: string;
    registrationDate: string;
    location?: string;
    date?: string;
  };
}

export function QrCodeDialog({
  isOpen,
  onOpenChange,
  qrCodeUrl,
  registrationData,
}: QrCodeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[330px] sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-center">Event Registration Pass</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="bg-white p-3 rounded-xl shadow-lg">
            <img
              src={qrCodeUrl}
              alt="Registration QR Code"
              className="w-64 h-64"
            />
          </div>
          
          <div className="w-full space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-primary">
                {registrationData.eventTitle}
              </h3>
              <Badge
                variant={registrationData.registrationType === "free" ? "secondary" : "default"}
                className="mt-2"
              >
                <Ticket className="w-3 h-3 mr-1" />
                {registrationData.registrationType.toUpperCase()} TICKET
              </Badge>
            </div>

            <Separator />

            <div className="text-xs text-center text-muted-foreground">
              <p>Registered on {format(new Date(registrationData.registrationDate), "PPP 'at' p")}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}