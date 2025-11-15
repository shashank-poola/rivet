import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Templates = () => {
  const templates = [
    {
      title: "Slack to Email Notification",
      description: "Automatically send email notifications when messages are posted in specific Slack channels",
      category: "Communication",
    },
    {
      title: "Data Sync: Airtable to Google Sheets",
      description: "Keep your Google Sheets in sync with Airtable records in real-time",
      category: "Data Management",
    },
    {
      title: "Customer Onboarding Workflow",
      description: "Automate the entire customer onboarding process from signup to first login",
      category: "Customer Success",
    },
    {
      title: "AI Content Generator",
      description: "Generate blog posts and social media content using AI",
      category: "AI & ML",
    },
    {
      title: "Invoice Processing Automation",
      description: "Automatically process and categorize invoices from email attachments",
      category: "Finance",
    },
    {
      title: "Lead Scoring System",
      description: "Score and qualify leads based on their behavior and characteristics",
      category: "Sales",
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Templates
          </h1>
          <p className="text-muted-foreground mb-6">
            Get started quickly with pre-built workflow templates
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search templates..." 
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all"
            >
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {template.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {template.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>
              <Button variant="outline" className="w-full">
                Use Template
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;
