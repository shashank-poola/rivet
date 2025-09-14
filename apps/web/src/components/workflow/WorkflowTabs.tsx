import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface WorkflowTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const WorkflowTabs: React.FC<WorkflowTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: Tab[] = [
    { id: 'workflows', label: 'Workflows', count: 0 },
    { id: 'credentials', label: 'Credentials', count: 0 },
    { id: 'executions', label: 'Executions', count: 0 },
  ];

  return (
    <div className="flex items-center gap-6 px-6 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative py-3 text-sm font-medium transition-colors font-secondary",
            activeTab === tab.id
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                {tab.count}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
};

export default WorkflowTabs;