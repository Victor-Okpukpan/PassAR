'use client';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Ticket, Plus } from 'lucide-react';
import Link from 'next/link';

export function Navigation() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Ticket className="h-6 w-6" />
          <span className="font-bold text-xl">PassAR</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/events">
            <Button variant="ghost">Browse Events</Button>
          </Link>
          <Link href="/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}