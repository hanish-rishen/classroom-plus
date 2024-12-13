import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]",
          className
        )}
      />
    </div>
  );
}