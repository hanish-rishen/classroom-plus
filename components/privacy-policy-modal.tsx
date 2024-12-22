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
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyModal({ isOpen, onAccept, onOpenChange }: PrivacyPolicyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="backdrop-blur-sm" />
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] max-w-[500px] p-4 sm:p-6 gap-3 sm:gap-4 bg-background rounded-lg sm:rounded-xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Please review how Classroom Plus handles your data
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] sm:h-[350px] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold mb-2">Data Usage & Storage</h3>
              <p className="text-muted-foreground leading-relaxed text-justify">
                Classroom Plus operates with real-time data fetching, meaning we don't store any of your Google Classroom data on our servers. A temporary session token is stored solely for authentication purposes, and your theme preferences are saved locally in your browser for a personalized experience.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Security Measures</h3>
              <p className="text-muted-foreground leading-relaxed text-justify">
                We prioritize your security by implementing Google OAuth 2.0 for authentication, ensuring all data transmission is encrypted via HTTPS. We never have access to your Google password, and access tokens automatically expire for added security. Your data remains protected throughout your session.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Your Control</h3>
              <p className="text-muted-foreground leading-relaxed text-justify">
                You maintain full control over your data access. You can sign out at any time to revoke access, and manage app permissions directly in your Google Account settings. All data access is temporary and session-based, ensuring no information persists after you sign out.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Third-Party Access</h3>
              <p className="text-muted-foreground leading-relaxed text-justify">
                Our application exclusively interacts with the Google Classroom API. We maintain a direct connection with Google's services and do not share any data with third parties. All external links open directly to Google Classroom, ensuring a secure and private experience.
              </p>
            </section>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-2">
          <Button onClick={onAccept} className="w-full">
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
