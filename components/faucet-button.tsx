import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Droplets } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createDataItemSigner, message, result } from "@permaweb/aoconnect";

export function FaucetButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const PASS_FAUCET_PROCESS = "H6t64aNqjYskenV57N7xjyL0hoAVu05CsWztuWxLyuQ";

  const claimFromFaucet = async () => {
    setIsLoading(true);
    try {
      const messageId = await message({
        process: PASS_FAUCET_PROCESS,
        tags: [{ name: "Action", value: "ClaimToken" }],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const _result = await result({
        message: messageId,
        process: PASS_FAUCET_PROCESS,
      });

      console.log(_result);

      toast({
        title: "Tokens Claimed Successfully",
        description: "Some $PASS tokens have been added to your wallet",
      });
    } catch (error) {
      toast({
        title: "Failed to claim tokens",
        description: "Please try again later",
        variant: "destructive",
      });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={claimFromFaucet}
      disabled={isLoading}
      variant="outline"
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Claiming...
        </>
      ) : (
        <>
          <Droplets className="mr-2 h-4 w-4" />
          Claim Tokens
        </>
      )}
    </Button>
  );
}
