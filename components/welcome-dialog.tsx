import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string | null;
}

export function WelcomeDialog({ isOpen, onClose, userName }: WelcomeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-sm" />
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] max-w-[425px] p-4 sm:p-6 gap-3 sm:gap-4 bg-background rounded-lg sm:rounded-xl border">
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome to Classroom Plus👋</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Hi {userName || 'there'}, we're excited to help you enhance your learning experience.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Here's what you can do:</p>
            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>Track assignments and deadlines efficiently</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>Access all your class materials in one place</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>Stay updated with real-time notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>Personalize your experience with themes</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button 
            onClick={onClose} 
            variant="default"
            className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
