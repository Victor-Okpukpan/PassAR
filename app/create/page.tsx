/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import Arweave from 'arweave';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

export default function CreateEventPage() {
  const [date, setDate] = useState<Date>();
  const [isFree, setIsFree] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  });

  const uploadToArweave = async () => {
    if (!imageFile) return;

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const buffer = Buffer.from(reader.result as ArrayBuffer);
        const transaction = await arweave.createTransaction({ data: buffer });
        transaction.addTag('Content-Type', imageFile.type);
        
        // In production, you would use your wallet to sign
        // For demo, we'll just get the transaction ID
        const hash = transaction.id;
        setImageHash(hash);
        
        toast({
          title: "Image prepared for upload",
          description: `Transaction ID: ${hash}`,
        });
      };
      reader.readAsArrayBuffer(imageFile);
    } catch (error: any) {
      toast({
        title: `Upload failed: ${error.message}`,
        description: "Failed to prepare image for Arweave upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageHash(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
        
        <form className="space-y-6">
          <div className="space-y-2">
            <Label>Event Image</Label>
            {!imagePreview ? (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-primary" : "border-muted",
                  "hover:border-primary"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop an image here, or click to select
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG or GIF (max. 5MB)
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                {!imageHash && (
                  <Button
                    className="mt-2"
                    onClick={uploadToArweave}
                    disabled={isUploading}
                  >
                    {isUploading ? "Preparing..." : "Upload to Arweave"}
                  </Button>
                )}
                {imageHash && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Image Hash: {imageHash}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" placeholder="Enter event title" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your event"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Event location or virtual link" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="Maximum number of attendees"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Free Event</Label>
              <div className="text-sm text-muted-foreground">
                Toggle if this is a free event
              </div>
            </div>
            <Switch
              checked={isFree}
              onCheckedChange={setIsFree}
            />
          </div>

          {!isFree && (
            <div className="space-y-2">
              <Label htmlFor="price">Ticket Price (USD)</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter ticket price"
                step="0.01"
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            Create Event
          </Button>
        </form>
      </div>
    </div>
  );
}