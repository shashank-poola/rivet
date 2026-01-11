import { useState } from "react";
import { Search, ChevronRight, BookOpen, Code, Settings, Plug, GitBranch, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: { id: string; title: string; isNew?: boolean }[];
}

const docSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    items: [
      { id: "introduction", title: "Introduction" },
      { id: "quick-start", title: "Quick Start Guide" },
      { id: "first-workflow", title: "Create Your First Workflow" },
    ],
  },
  {
    id: "triggers",
    title: "Triggers",
    icon: GitBranch,
    items: [
      { id: "webhook", title: "Webhook Trigger" },
      { id: "schedule", title: "Schedule Trigger" },
      { id: "manual", title: "Manual Trigger" },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Plug,
    items: [
      { id: "telegram", title: "Telegram Bot" },
      { id: "gemini", title: "Google Gemini", isNew: true },
      { id: "grok", title: "Grok AI" },
      { id: "resend", title: "Resend Email" },
    ],
  },
  {
    id: "api",
    title: "API Reference",
    icon: Code,
    items: [
      { id: "authentication", title: "Authentication" },
      { id: "endpoints", title: "API Endpoints" },
      { id: "webhooks", title: "Webhook Events" },
    ],
  },
  {
    id: "configuration",
    title: "Configuration",
    icon: Settings,
    items: [
      { id: "environment", title: "Environment Variables" },
      { id: "credentials", title: "Managing Credentials" },
      { id: "advanced", title: "Advanced Settings" },
    ],
  },
];

const onThisPage = [
  { id: "overview", title: "Overview", active: true },
  { id: "key-capabilities", title: "Key capabilities" },
  { id: "how-it-works", title: "How Rivet Works" },
  { id: "installation", title: "Installation" },
  { id: "configuration", title: "Configuration" },
  { id: "running", title: "Running Workflows" },
];

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("introduction");
  const [expandedSections, setExpandedSections] = useState<string[]>(["getting-started", "integrations"]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Left Sidebar - Sticky */}
      <aside className="w-64 border-r border-border flex-shrink-0 h-full overflow-y-auto sticky top-0">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Ctrl K</span>
          </div>
        </div>

        <nav className="px-2 pb-4">
          {docSections.map((section) => (
            <div key={section.id} className="mb-2">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-foreground hover:bg-selected rounded-md transition-colors"
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.includes(section.id) ? "rotate-90" : ""
                  }`}
                />
                <section.icon className="h-4 w-4" />
                <span>{section.title}</span>
              </button>
              
              {expandedSections.includes(section.id) && (
                <div className="ml-9 mt-1 space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-md transition-colors ${
                        activeSection === item.id
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{item.title}</span>
                      {item.isNew && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded">
                          NEW
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="mb-2">
            <span className="text-primary text-sm font-medium">Getting Started</span>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">Introduction</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Build powerful automation workflows with Rivet. Connect your favorite apps and services
            to automate tasks, process data, and create seamless integrations.
          </p>

          <h2 id="overview" className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
          
          <p className="text-muted-foreground mb-6">
            Rivet is a modern workflow automation platform that enables you to connect AI assistants
            and applications through a visual interface. Build workflows without code, or extend with
            custom logic when needed.
          </p>

          <p className="text-muted-foreground mb-6">
            Rivet provides AI assistants like Gemini, Grok, and other integrations with structured
            access to your workflow infrastructure. Create, manage, and execute workflows seamlessly.
          </p>

          <h2 id="key-capabilities" className="text-2xl font-semibold text-foreground mb-4">Key capabilities</h2>
          
          <ul className="list-disc list-inside space-y-3 text-muted-foreground mb-8">
            <li>
              <strong className="text-foreground">Visual Workflow Builder:</strong> Create and manage
              workflows using a drag-and-drop interface.
            </li>
            <li>
              <strong className="text-foreground">AI Integrations:</strong> Connect to Gemini, Grok,
              and other AI services for intelligent automation.
            </li>
            <li>
              <strong className="text-foreground">Trigger System:</strong> Start workflows with webhooks,
              schedules, or manual triggers.
            </li>
            <li>
              <strong className="text-foreground">Credential Management:</strong> Securely store and
              manage API keys and authentication tokens.
            </li>
          </ul>

          <h2 id="how-it-works" className="text-2xl font-semibold text-foreground mb-4">How Rivet Works</h2>
          
          <p className="text-muted-foreground mb-6">
            Rivet uses a node-based architecture where each step in your workflow is represented as a
            node. Connect nodes together to define the flow of data and logic. Triggers start the
            workflow, and actions perform operations like sending messages, processing data, or
            calling APIs.
          </p>

          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-3">Quick Example</h3>
            <pre className="text-sm text-muted-foreground overflow-x-auto">
{`// A simple workflow that responds to a webhook
Trigger: Webhook (POST /api/workflow)
  → Action: Parse JSON Body
  → Action: Call Gemini AI
  → Action: Send Response`}
            </pre>
          </div>
        </div>
      </main>

      {/* Right Sidebar - On This Page - Sticky */}
      <aside className="w-56 border-l border-border flex-shrink-0 h-full overflow-y-auto sticky top-0 hidden lg:block">
        <div className="p-4">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            On this page
          </h3>
          <nav className="space-y-1">
            {onThisPage.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                  item.active
                    ? "text-primary border-l-2 border-primary pl-2.5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
};

export default Documentation;
