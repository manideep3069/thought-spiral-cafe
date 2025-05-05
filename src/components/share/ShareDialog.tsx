
import React from 'react';
import { Share2, Copy, Instagram, Link2, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShareDialogProps {
  title: string;
  url: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ title, url }) => {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  // Function to shorten URL for display
  const getShortenedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      // Show only domain and truncated path
      const domain = urlObj.hostname;
      const path = urlObj.pathname;
      const shortenedPath = path.length > 15 ? path.substring(0, 15) + '...' : path;
      return domain + shortenedPath;
    } catch (e) {
      // If URL parsing fails, just truncate the original
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  };

  const shareToSocial = (platform: string) => {
    let shareUrl = '';
    switch (platform) {
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct share URL, so we'll just copy the link
        navigator.clipboard.writeText(url);
        toast.success('Link copied! Share it on Instagram');
        return;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-accent">
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Share this thought</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Link preview and copy button */}
          <div className="flex items-center space-x-2 rounded-lg border bg-muted/30 p-3">
            <div className="p-1.5 bg-primary/10 rounded-full">
              <Link2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="line-clamp-1 flex-1 text-xs text-muted-foreground">
              {getShortenedUrl(url)}
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleCopyLink}
              className="h-7 px-2 text-xs hover:bg-primary/20"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </div>
          
          {/* Social sharing buttons grid - now with proper containment */}
          <div className="grid grid-cols-3 gap-2 w-full">
            {/* X (Twitter) */}
            <Button
              variant="outline"
              className={cn(
                "flex flex-col items-center justify-center h-16 text-xs hover:bg-black/5 hover:border-black/30",
                "transition-all py-1 px-1"
              )}
              onClick={() => shareToSocial('x')}
            >
              <svg className="h-4 w-4 mb-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-xs">X</span>
            </Button>
            
            {/* Instagram */}
            <Button
              variant="outline"
              className={cn(
                "flex flex-col items-center justify-center h-16 text-xs hover:bg-gradient-to-tr hover:from-purple-100 hover:to-amber-100 hover:border-pink-300",
                "transition-all py-1 px-1"
              )}
              onClick={() => shareToSocial('instagram')}
            >
              <Instagram className="h-4 w-4 mb-1" />
              <span className="text-xs">Instagram</span>
            </Button>
            
            {/* WhatsApp */}
            <Button
              variant="outline"
              className={cn(
                "flex flex-col items-center justify-center h-16 text-xs hover:bg-emerald-50 hover:border-emerald-300",
                "transition-all py-1 px-1"
              )}
              onClick={() => shareToSocial('whatsapp')}
            >
              <MessageCircle className="h-4 w-4 mb-1" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
