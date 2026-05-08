import React from 'react';
import { Instagram, Twitter, Youtube, Facebook, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-foreground">KeyMech</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Premium mechanical keyboards and accessories for enthusiasts. Elevate your typing experience today.
                </p>
                <div className="flex gap-4 pt-2">
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Instagram className="h-5 w-5" /></a>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="h-5 w-5" /></a>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Youtube className="h-5 w-5" /></a>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Facebook className="h-5 w-5" /></a>
                </div>
            </div>

            <div>
                <h4 className="text-foreground font-bold mb-6">Shop</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><a href="#" className="hover:text-primary transition-colors">Keyboards</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Switches</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Keycaps</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Accessories</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Group Buys</a></li>
                </ul>
            </div>

            <div>
                <h4 className="text-foreground font-bold mb-6">Support</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Order Status</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Returns & Warranty</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Build Guides</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                </ul>
            </div>

            <div>
                <h4 className="text-foreground font-bold mb-6">Newsletter</h4>
                <p className="text-muted-foreground text-sm mb-4">Subscribe to get updates on new drops and GBs.</p>
                <div className="flex gap-2">
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1"
                    />
                    <Button size="icon" className="shrink-0">
                        <Mail className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>

        <Separator className="my-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2026 KeyMech Inc. All rights reserved.</p>
            <div className="flex gap-6">
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;