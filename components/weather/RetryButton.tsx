import * as React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RetryButtonProps {
  onRetry: () => void;
  loading?: boolean;
}

export function RetryButton({ onRetry, loading }: RetryButtonProps) {
  return (
    <Button
      type="button"
      onClick={onRetry}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      {loading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
          Chargement…
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
          Réessayer
        </>
      )}
    </Button>
  );
}
