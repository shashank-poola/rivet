import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share, Save, Settings, MoreHorizontal } from 'lucide-react';
import WorkflowEditor from '@/components/workflow/WorkflowEditor';

const Workflow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-surface">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-surface-hover"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Personal</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">My workflow</span>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              + Add tag
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
            <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
          
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">
            Save
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center h-12 px-4 border-b border-border bg-surface">
        <div className="flex gap-6">
          <button className="text-sm font-medium text-foreground border-b-2 border-primary pb-3">
            Editor
          </button>
          <button className="text-sm text-muted-foreground pb-3 hover:text-foreground transition-colors">
            Executions
          </button>
        </div>
      </div>

      {/* Workflow Editor */}
      <div className="flex-1 overflow-hidden">
        <WorkflowEditor workflowId={id} />
      </div>
    </div>
  );
};

export default Workflow;