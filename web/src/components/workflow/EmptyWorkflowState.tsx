import React from 'react';
import { FileText, Bot } from 'lucide-react';
import WorkflowCard from './WorkflowCard';

interface EmptyWorkflowStateProps {
  userName?: string;
  onStartFromScratch?: () => void;
}

const EmptyWorkflowState: React.FC<EmptyWorkflowStateProps> = ({ userName = 'there', onStartFromScratch }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          <span className="inline-block mr-2">👋</span>
          Welcome {userName}!
        </h2>
        <p className="text-muted-foreground">Create your first workflow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <WorkflowCard
          icon={FileText}
          title="Start from scratch"
          description="Build a custom workflow tailored to your needs"
          onClick={onStartFromScratch}
        />
        <WorkflowCard
          icon={Bot}
          title="Test a simple AI Agent example"
          description="Explore AI-powered automation capabilities"
        />
      </div>
    </div>
  );
};

export default EmptyWorkflowState;