"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Ticket, Plus, AlignRight } from "lucide-react";
import Link from "next/link";

export function Navigation() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Ticket className="h-6 w-6" />
          <span className="font-bold text-xl">PassAR</span>
        </Link>
        <nav className="flex items-center space-x-1">
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/events">
              <Button variant="ghost">Browse Events</Button>
            </Link>
            <Link href="/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <ModeToggle />
            <Sheet>
              <SheetTrigger className="w-max flex items-center" asChild>
                <Button size="sm" variant="ghost">
                  <AlignRight className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation bar</SheetTitle>
                  <SheetDescription className="sr-only">Menu</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col items-center space-y-4 mt-8">
                  <Link href="/events" className="w-full flex justify-start">
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="w-full flex justify-start"
                      >
                        Browse Events
                      </Button>
                    </SheetClose>
                  </Link>
                  <Link href="/create" className="w-full">
                    <SheetClose asChild>
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                      </Button>
                    </SheetClose>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden md:block">
            <ModeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
