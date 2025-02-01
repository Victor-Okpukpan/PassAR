/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { message, result, createDataItemSigner } from "@permaweb/aoconnect";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import Arweave from "arweave";
import { useRouter } from "next/navigation";
// import { FaucetButton } from "@/components/faucet-button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DatePickerC } from "@/components/date-picker";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  price?: string;
  image?: string;
  googleMapLink?: string;
  virtualLink?: string;
}

export default function CreateEventPage() {
  const WAR_TOKEN_PROCESS = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10";
  // const DUMDUM_TOKEN_PROCESS = "jtGHIv6MRIwUSlxVUTDwX7X0gYEGKQynIqvkelIOdL4";

  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [eventTime, setEventTime] = useState<string>("");
  console.log(eventTime);
  const [isFree, setIsFree] = useState(true);
  const [isLiveEvent, setIsLiveEvent] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageHash, setImageHash] = useState<string | null>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [virtualLink, setVirtualLink] = useState("");
  const [price, setPrice] = useState("");
  const [token, setToken] = useState("$wAR");
  const [process, setProcess] = useState(WAR_TOKEN_PROCESS);
  const [errors, setErrors] = useState<FormErrors>({});
  const { toast } = useToast();

  const AO_PROCESS = "yr6ytHmqw_WSOnDZSNjyin6D0SSt2LvlKEB4dYqOabg";

  useEffect(() => {
    if (token === "$wAR") {
      setProcess(WAR_TOKEN_PROCESS);
    } 
    
    // else if (token === "$DUMDUM") {
    //   setProcess(DUMDUM_TOKEN_PROCESS);
    // }
  }, [token]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) newErrors.title = "Event title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!date) newErrors.date = "Event date and time are required";
    if (!eventTime) newErrors.time = "Event time is required";

    if (!virtualLink && !location.trim()) newErrors.location = "Location is required";

    if (!isFree) {
      const priceNum = Number(price);
      if (!price || isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = "Price must be a valid number greater than 0";
      }
    }

    if (!imageHash) newErrors.image = "Event image is required";

    if (isLiveEvent && googleMapLink && !googleMapLink.trim()) {
      newErrors.googleMapLink = "Google Map link is required for live events";
    }

    if (!isLiveEvent && !virtualLink.trim()) {
      newErrors.virtualLink = "Virtual link is required for virtual events";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadToArweave = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer();
      const transaction = await arweave.createTransaction({ data: buffer });
      transaction.addTag("Content-Type", file.type);
      transaction.addTag("App-Name", "PassAR");

      await arweave.transactions.sign(transaction);
      await arweave.transactions.post(transaction);
      console.log(`https://arweave.net/${transaction.id}`);
      return transaction.id;
    } catch (error: any) {
      throw new Error(error.message || "Failed to upload image to Arweave");
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);

        try {
          setIsUploading(true);
          const hash = await uploadToArweave(file);
          setImageHash(`https://arweave.net/${hash}`);
          setImagePreview(`https://arweave.net/${hash}`);
          toast({
            title: "Image uploaded successfully",
            description: `Transaction ID: ${hash}`,
          });
        } catch (error: any) {
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      }
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 5242880, // 5MB
    multiple: false,
  });

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageHash(null);
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const eventData = {
        title,
        description,
        date: date!.toISOString().slice(0, 10),
        time: `${eventTime}z`,
        location,
        googleMapLink,
        virtualLink,
        isFree,
        price: isFree ? "0" : String(price),
        process: isFree ? "" : process,
        imageHash,
      };

      console.log("e:", eventData);

      const messageId = await message({
        process: AO_PROCESS,
        tags: [
          { name: "Action", value: "AddNewEventT" },
          { name: "EventTitle", value: eventData.title },
          { name: "EventDescription", value: eventData.description },
          { name: "EventDate", value: eventData.date },
          { name: "EventTime", value: eventData.time },
          { name: "Location", value: eventData.location },
          { name: "TicketPrice", value: eventData.price },
          { name: "ImageUrl", value: eventData.imageHash as string },
          { name: "GoogleMapLink", value: eventData.googleMapLink },
          { name: "VirtualLink", value: eventData.virtualLink },
          { name: "PaymentTokenProcessID", value: eventData.process },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const _result = await result({
        message: messageId,
        process: AO_PROCESS,
      });

      console.log(_result);

      toast({
        title: "Event Created",
        description: `Message ID: ${messageId}`,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setDate(undefined);
      setEventTime("");
      setLocation("");
      setGoogleMapLink("");
      setVirtualLink("");
      setPrice("");
      setIsFree(true);
      setIsLiveEvent(true);
      removeImage();
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Failed to create event",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Create New Event</h1>

          {/* <div className="flex justify-end">
            <FaucetButton />
          </div> */}
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Event Image</Label>
            {!imagePreview ? (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-primary" : "border-muted",
                  errors.image ? "border-destructive" : "hover:border-primary"
                )}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Uploading to Arweave...
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop an image here, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG or GIF (max. 5MB)
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                {imageHash && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Image uploaded to Arweave
                  </p>
                )}
              </div>
            )}
            {errors.image && (
              <p className="text-sm text-destructive">{errors.image}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your event"
              className={cn(
                "min-h-[100px]",
                errors.description ? "border-destructive" : ""
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                    errors.date && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    if (!selectedDate) return;
                    
                    // Convert to UTC at 00:00:00
                    const utcDate = new Date(Date.UTC(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate()
                    ));
                  
                    setDate(utcDate); // Save as UTC
                  }}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventTime">Event Time</Label>
            <Input
              id="eventTime"
              type="time"
              value={(() => {
                if (!eventTime) return ""; // Handle empty state
              
                const today = new Date();
                const [hours, minutes] = eventTime.split(":").map(Number);
              
                // Create a UTC date object
                const utcDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes));
              
                // Convert to local time
                const localTime = utcDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
              
                return localTime;
              })()}
              onChange={(e) => {
                const localTime = e.target.value; // This is in local time format (HH:mm)
                const today = new Date(); // Get today's date
                const [hours, minutes] = localTime.split(":").map(Number);

                // Create a Date object with local time
                const localDate = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                  hours,
                  minutes
                );

                // Convert to UTC string
                const utcTime = localDate
                  .toISOString()
                  .split("T")[1]
                  .substring(0, 5); // Extract HH:mm in UTC

                setEventTime(utcTime);
              }}
              className={errors.time ? "border-destructive" : ""}
            />
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Live Event</Label>
              <div className="text-sm text-muted-foreground">
                Toggle if this is a live event
              </div>
            </div>
            <Switch checked={isLiveEvent} onCheckedChange={setIsLiveEvent} />
          </div>

          {isLiveEvent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Event location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={errors.location ? "border-destructive" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleMapLink">
                  Google Map Link (Optional)
                </Label>
                <Input
                  id="googleMapLink"
                  placeholder="Google Map link"
                  value={googleMapLink}
                  onChange={(e) => setGoogleMapLink(e.target.value)}
                  className={errors.googleMapLink ? "border-destructive" : ""}
                />
                {errors.googleMapLink && (
                  <p className="text-sm text-destructive">
                    {errors.googleMapLink}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="virtualLink">Virtual Link</Label>
              <Input
                id="virtualLink"
                placeholder="Virtual event link"
                value={virtualLink}
                onChange={(e) => setVirtualLink(e.target.value)}
                className={errors.virtualLink ? "border-destructive" : ""}
              />
              {errors.virtualLink && (
                <p className="text-sm text-destructive">{errors.virtualLink}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Free Event</Label>
              <div className="text-sm text-muted-foreground">
                Toggle if this is a free event
              </div>
            </div>
            <Switch checked={isFree} onCheckedChange={setIsFree} />
          </div>

          {!isFree && (
            <>
              <div className="space-y-2">
                <Label htmlFor="price">Ticket Price</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter ticket price"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={errors.price ? "border-destructive" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Select Token</Label>
                <select
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="$wAR" selected>
                    $wAR
                  </option>
                  {/* <option value="$DUMDUM">$DUMDUM</option> */}
                </select>
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Event...
              </>
            ) : (
              "Create Event"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
