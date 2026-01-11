import { Button } from "@/components/ui/button";
import rivetLogo from "@/assets/rivet-logo.png";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 bg-background"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <img src={rivetLogo} alt="Rivet" className="h-8 w-auto" />
          </Link>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              asChild
              className="text-foreground border-destructive hover:bg-[#FAFAF9] hover:text-foreground"
            >
              <Link to="/signin">Sign in</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Automate your workflows with ease
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Build powerful automation workflows without writing code
          </p>
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
