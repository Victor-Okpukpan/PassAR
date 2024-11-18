/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wallet } from 'lucide-react';

declare global {
  interface Window {
    arweaveWallet: {
      connect: (permissions: string[]) => Promise<void>;
      disconnect: () => Promise<void>;
      getActiveAddress: () => Promise<string>;
    };
  }
}

export function WalletConnect({variant, style}: any) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkConnection = async () => {
    try {
      const addr = await window.arweaveWallet.getActiveAddress();
      setAddress(addr);
    } catch (error) {
      setAddress(null);
      console.log(error);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
      const addr = await window.arweaveWallet.getActiveAddress();
      setAddress(addr);
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to ArConnect",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please install ArConnect or try again",
        variant: "destructive",
      });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    setIsLoading(true);
    try {
      await window.arweaveWallet.disconnect();
      setAddress(null);
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from ArConnect",
      });
    } catch (error) {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-5)}`;
  };

  return (
    <div>
      {!address ? (
        <Button 
          onClick={connectWallet} 
          variant={variant} 
          disabled={isLoading}
          className={`${style} border`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>
      ) : (
        <Button 
          onClick={disconnectWallet} 
          variant="outline" 
          disabled={isLoading}
          className="min-w-[140px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Disconnecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              {truncateAddress(address)}
            </>
          )}
        </Button>
      )}
    </div>
  );
}