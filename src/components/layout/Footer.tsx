
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center">
              <span className="text-2xl font-serif font-bold bg-gradient-to-r from-lavender to-emerald bg-clip-text text-transparent">
                Thought Spiral
              </span>
              <span className="ml-1 font-serif text-muted-foreground">{" "}café</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              A cozy corner of the internet for meaningful conversations and intellectual exploration.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-medium text-foreground">Site Links</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/discover" className="text-sm text-muted-foreground hover:text-primary">
                    Discover
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-sm text-muted-foreground hover:text-primary">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Resources</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link to="/guidelines" className="text-sm text-muted-foreground hover:text-primary">
                    Community Guidelines
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-foreground">Join the Conversation</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Subscribe to our newsletter for weekly thought-provoking quotes and discussions.
            </p>
            <form className="mt-4 flex space-x-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                required
              />
              <button 
                type="submit"
                className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-8 border-t border-border pt-8 flex flex-col sm:flex-row justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Thought Spiral Café. All rights reserved.
          </p>
          <div className="mt-4 sm:mt-0 flex space-x-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">
              Twitter
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">
              Instagram
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
