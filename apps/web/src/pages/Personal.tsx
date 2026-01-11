import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Workflow, Key, PlayCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CredentialsDialog } from "@/components/CredentialsDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TabType = "workflows" | "credentials" | "executions";

const Personal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("workflows");
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState("");

  const tabs = [
    { id: "workflows" as TabType, label: "Workflows" },
    { id: "credentials" as TabType, label: "Credentials" },
    { id: "executions" as TabType, label: "Executions" },
  ];

  const handleCreateWorkflow = () => {
    if (workflowName.trim()) {
      navigate(`/workflow-editor/${Date.now()}`);
      setShowCreateDialog(false);
      setWorkflowName("");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "workflows":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Workflows owned by you</h2>
              <Button size="sm" className="gap-2" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4" />
                New Workflow
              </Button>
            </div>
            <div className="border border-border rounded-lg p-8 bg-card text-center">
              <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No workflows yet</h3>
              <p className="text-sm text-muted-foreground">Create your first workflow to get started.</p>
            </div>
          </div>
        );
      case "credentials":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Your Credentials</h2>
              <Button size="sm" className="gap-2" onClick={() => setShowCredentialsDialog(true)}>
                <Plus className="h-4 w-4" />
                Add Credential
              </Button>
            </div>
            <div className="border border-border rounded-lg p-8 bg-card text-center">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No credentials configured</h3>
              <p className="text-sm text-muted-foreground">Add credentials to connect to external services.</p>
            </div>
          </div>
        );
      case "executions":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Executions</h2>
            <div className="border border-border rounded-lg p-8 bg-card text-center">
              <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No executions yet</h3>
              <p className="text-sm text-muted-foreground">Run a workflow to see execution history.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full bg-background">
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>

      <CredentialsDialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog} />

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Workflow className="h-5 w-5" />
              Create New Workflow
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name" className="text-foreground">Workflow Name</Label>
              <Input
                id="workflow-name"
                placeholder="Enter workflow name..."
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateWorkflow()}
                className="bg-background border-border"
              />
              <p className="text-sm text-muted-foreground">Choose a descriptive name for your workflow</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={!workflowName.trim()}>
              Create Workflow
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Personal;
