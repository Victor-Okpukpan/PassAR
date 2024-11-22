/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import { Menu } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import Image from "next/image";

export function Navigation() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          {/* <Ticket className="h-6 w-6" />
          <span className="font-bold text-xl">PassAR</span> */}

          <div className="h-full overflow-hidden">
            <img
              src="https://arweave.net/bkTXbYcgA_QOltD8gD8qwLgQNR6DzL1Jz3fmSzpYec8"
              alt="PassAR"
              className="max-w-[100px] sm:max-w-[150px]"
            />
          </div>
        </Link>

        <nav className="flex items-center space-x-1 lg:space-x-2">
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/events">
              <Button variant="ghost">Browse Events</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Creator Dashboard</Button>
            </Link>
          </div>
          <ModeToggle />
          <WalletConnect style="min-w-[140px]" variant="blank" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/events">Browse Events</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Creator Dashboard</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
