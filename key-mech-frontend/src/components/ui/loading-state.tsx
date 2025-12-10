import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label?: string;
  helperText?: string;
  className?: string;
}

function LoadingState({ label = "Loading…", helperText, className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground",
        className
      )}
    >
      <Spinner className="size-6 text-primary" />
      <p className="text-sm font-medium text-foreground">{label}</p>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}

export { LoadingState };

