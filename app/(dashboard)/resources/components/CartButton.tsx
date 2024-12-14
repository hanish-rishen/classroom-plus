'use client';

import { ShoppingCart, AlertTriangle, ArrowUpRight, FileIcon, FileText, FileSpreadsheet, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CartButton() {
  const { items, removeFromCart, clearCart } = useCart();

  const getFileIcon = (title: string) => {
    const fileName = title.toLowerCase();
    if (fileName.endsWith('.pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) return <Presentation className="h-4 w-4 text-orange-500" />;
    return <FileIcon className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative transition-transform duration-200 ease-in-out"
        >
          <ShoppingCart className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="fixed top-4 bottom-4 right-4 w-[calc(100vw-32px)] sm:w-[95vw] sm:max-w-md rounded-lg border shadow-lg">
        <div className="flex flex-col h-full p-4">
          <div className="p-6 space-y-2.5">
            <SheetHeader className="space-y-2.5">
              <SheetTitle className="text-center">Resource Cart ({items.length})</SheetTitle>
              <p className="text-sm text-center text-muted-foreground">
                Add resources to access them quickly in Google Drive
              </p>
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-4 py-2 rounded-full">
                <AlertTriangle className="h-4 w-4" />
                <p>Cart contents will be lost if you refresh the page</p>
              </div>
            </SheetHeader>
          </div>

          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      {getFileIcon(item.title)}
                      <a 
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium line-clamp-1 underline decoration-1 hover:decoration-2 group flex items-center gap-1"
                      >
                        {item.title}
                        <ArrowUpRight className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.courseName}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="shrink-0 h-8 px-3"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-6 mt-auto border-t">
            <Button
              variant="outline"
              className="w-full"
              disabled={items.length === 0}
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}