import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import WorkflowTabs from '@/components/workflow/WorkflowTabs';
import EmptyWorkflowState from '@/components/workflow/EmptyWorkflowState';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('workflows');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [workflows, setWorkflows] = useState<string[]>([]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-surface">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Personal</h1>
            <p className="text-sm text-muted-foreground">Workflows and credentials owned by you</p>
          </div>
          <Button 
            onClick={() => {
              const newWorkflowId = uuidv4();
              navigate(`/workflow/${newWorkflowId}`);
            }}
            className="bg-primary hover:bg-primary-hover text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </header>

        {/* Tabs */}
        <WorkflowTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'workflows' && (
            workflows.length > 0 ? (
              <div className="p-6">
                <p className="text-muted-foreground">Your workflows will appear here</p>
              </div>
            ) : (
              <EmptyWorkflowState userName="shashank" onStartFromScratch={() => {
                const newWorkflowId = uuidv4();
                navigate(`/workflow/${newWorkflowId}`);
              }} />
            )
          )}
          {activeTab === 'credentials' && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No credentials configured yet</p>
            </div>
          )}
          {activeTab === 'executions' && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No executions to display</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;