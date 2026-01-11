import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import rivetLogo from "@/assets/rivet-logo.png";

const NotFound = () => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    setMounted(true);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-secondary animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full bg-primary/10 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main content */}
      <div className={`relative z-10 text-center ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
        {/* Rivet Logo with orbit animation */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="relative">
            {/* Orbiting circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary animate-orbit" style={{ animationDuration: '8s' }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-border animate-orbit" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
            </div>
            
            {/* Logo container with glow */}
            <div className="w-32 h-32 rounded-full bg-card border-2 border-border flex items-center justify-center animate-pulse-glow">
              <img 
                src={rivetLogo} 
                alt="Rivet Logo" 
                className="w-20 h-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl font-bold text-primary mb-4 animate-shake" style={{ animationDelay: '0.3s' }}>
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Page Not Found
        </h2>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like this workflow doesn't exist. The page you're looking for might have been moved or deleted.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return Home
          </Link>
          <Link 
            to="/personal" 
            className="inline-flex items-center justify-center px-6 py-3 bg-card border border-border text-foreground font-medium rounded-lg hover:bg-secondary transition-colors"
          >
            View Workflows
          </Link>
        </div>

        {/* Decorative path indicator */}
        <div className="mt-12 p-4 bg-card rounded-lg border border-border inline-block">
          <code className="text-sm text-muted-foreground">
            <span className="text-primary">~</span>{location.pathname}
          </code>
        </div>
      </div>
    </div>
  );
};

export default NotFound;