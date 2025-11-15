import { useNavigate } from "react-router-dom";
import { User, FileText, BookOpen } from "lucide-react";

const Overview = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Overview</h1>
          <p className="text-muted-foreground">Your automation workspace</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate("/personal")}
            className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <User className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Personal</h3>
            <p className="text-muted-foreground">Your personal workflows</p>
          </div>

          <div 
            onClick={() => navigate("/templates")}
            className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <FileText className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Templates</h3>
            <p className="text-muted-foreground">Pre-built workflow templates</p>
          </div>

          <div 
            onClick={() => navigate("/documentation")}
            className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <BookOpen className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Documentation</h3>
            <p className="text-muted-foreground">Learn how to use Rivet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
