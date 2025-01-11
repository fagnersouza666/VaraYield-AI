import { ModeToggle } from '@/components/mode-toggle';
import { Navigation } from '@/components/navigation';
import { cn } from '@/lib/utils';
import { Wallet, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-4 md:gap-6">
            <a className="flex items-center space-x-2" href="/">
              <Wallet className="h-6 w-6 md:h-8 md:w-8" />
              <span className="font-bold text-lg md:text-xl">Nexus LSD</span>
            </a>
            <div className="hidden lg:block">
              <Navigation />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="outline" className="hidden md:flex">
              Connect Wallet
            </Button>
            <ModeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[400px] px-4 md:px-6">
                <div className="flex flex-col space-y-6 py-6">
                  <Button variant="outline" className="w-full md:hidden">
                    Connect Wallet
                  </Button>
                  <Navigation orientation="vertical" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="container min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}