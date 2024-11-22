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
import { FaucetButton } from "@/components/faucet-button";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  price?: string;
  image?: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [isFree, setIsFree] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) newErrors.title = "Event title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!date) newErrors.date = "Event date is required";
    if (!location.trim()) newErrors.location = "Location is required";

    if (!isFree) {
      const priceNum = Number(price);
      if (!price || isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = "Price must be a valid number greater than 0";
      }
    }

    if (!imageHash) newErrors.image = "Event image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadToArweave = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer();
      const transaction = await arweave.createTransaction({ data: buffer });
      transaction.addTag("Content-Type", file.type);
      transaction.addTag("App-Name", "PassAR");

      // In production, you would sign the transaction with the user's wallet
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
        date: date!.toISOString(),
        location,
        isFree,
        price: isFree ? "0" : String(price),
        imageHash,
      };

      const messageId = await message({
        process: process.env.NEXT_PUBLIC_AO_PROCESS!,
        tags: [
          { name: "Action", value: "AddNewEventT" },
          { name: "EventTitle", value: eventData.title },
          { name: "EventDescription", value: eventData.description },
          { name: "EventDate", value: eventData.date },
          { name: "Location", value: eventData.location },
          { name: "TicketPrice", value: eventData.price },
          { name: "ImageUrl", value: eventData.imageHash as string },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const _result = await result({
        message: messageId,
        process: process.env.NEXT_PUBLIC_AO_PROCESS!,
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
      setLocation("");
      setPrice("");
      setIsFree(false);
      removeImage();
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Failed to create event",
        description: error.message,
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

          <div className="flex justify-end">
            <FaucetButton />
          </div>
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
                  onSelect={setDate}
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
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Event location or virtual link"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={errors.location ? "border-destructive" : ""}
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location}</p>
            )}
          </div>

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
            <div className="space-y-2">
              <Label htmlFor="price">Ticket Price (USD)</Label>
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
