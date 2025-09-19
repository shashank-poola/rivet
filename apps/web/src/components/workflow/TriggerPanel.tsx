import React from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Play, Webhook, Clock, FileText, GitBranch, MessageSquare, Mail } from 'lucide-react';

interface TriggerOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const triggers: TriggerOption[] = [
  {
    id: 'manual',
    title: 'Trigger manually',
    description: 'Runs the flow on clicking a button in n8n. Good for getting started quickly',
    icon: <Play className="h-5 w-5" />
  },
  {
    id: 'app-event',
    title: 'On app event',
    description: 'Runs the flow when something happens in an app like Telegram, Notion or Airtable',
    icon: <GitBranch className="h-5 w-5" />
  },
  {
    id: 'schedule',
    title: 'On a schedule',
    description: 'Runs the flow every day, hour, or custom interval',
    icon: <Clock className="h-5 w-5" />
  },
  {
    id: 'webhook',
    title: 'On webhook call',
    description: 'Runs the flow on receiving an HTTP request',
    icon: <Webhook className="h-5 w-5" />
  },
  {
    id: 'form',
    title: 'On form submission',
    description: 'Generate webforms in n8n and pass their responses to the workflow',
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 'workflow',
    title: 'When executed by another workflow',
    description: 'Runs the flow when called by the Execute Workflow node from a different workflow',
    icon: <GitBranch className="h-5 w-5" />
  },
  {
    id: 'email',
    title: 'On email',
    description: 'Runs the flow when an email is received',
    icon: <Mail className="h-5 w-5" />
  }
];

interface TriggerPanelProps {
  onSelectTrigger: (triggerId: string) => void;
}

const TriggerPanel: React.FC<TriggerPanelProps> = ({ onSelectTrigger }) => {
  return (
    <div className="w-96 h-full bg-surface border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          What triggers this workflow?
        </h3>
        <p className="text-sm text-muted-foreground">
          A trigger is a step that starts your workflow
        </p>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            className="pl-10 bg-background"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {triggers.map((trigger) => (
            <button
              key={trigger.id}
              onClick={() => onSelectTrigger(trigger.id)}
              className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-surface-hover transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
                  {trigger.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-1">
                    {trigger.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {trigger.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TriggerPanel;