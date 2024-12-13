import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 transition-all duration-200 rounded-full border-2 border-primary px-4 py-1",
      className
    )}>
      <span className="text-lg font-bold tracking-tight">
        Classroom
      </span>
      <div className="relative flex items-center justify-center -mr-1">
        <div className="absolute inset-0 rounded-full border-2 border-primary opacity-40" />
        <div className="rounded-full border-2 border-primary p-[2px]">
          <PlusCircle className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  );
}