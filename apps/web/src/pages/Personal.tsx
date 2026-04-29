import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Workflow, Key, PlayCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CredentialsDialog } from "@/components/CredentialsDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";

type TabType = "workflows" | "credentials" | "executions";

interface WorkflowItem {
  id: string;
  name: string;
  enabled: boolean;
  updated_at: string;
}

interface CredentialItem {
  id: string;
  name: string;
  application: string;
}

interface ExecutionItem {
  id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  workflow: { id: string; name: string };
}

const Personal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("workflows");
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [creating, setCreating] = useState(false);

  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [executions, setExecutions] = useState<ExecutionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "workflows" as TabType, label: "Workflows" },
    { id: "credentials" as TabType, label: "Credentials" },
    { id: "executions" as TabType, label: "Executions" },
  ];

  useEffect(() => {
    if (activeTab === "workflows") loadWorkflows();
    if (activeTab === "credentials") loadCredentials();
    if (activeTab === "executions") loadExecutions();
  }, [activeTab]);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const res: any = await api.getWorkflows();
      setWorkflows(res.workflows ?? []);
    } catch {
      toast.error("Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const res: any = await api.getCredentials();
      setCredentials(res.credentials ?? []);
    } catch {
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  };

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const res: any = await api.getExecutions();
      setExecutions(res.executions ?? []);
    } catch {
      toast.error("Failed to load executions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!workflowName.trim()) return;
    setCreating(true);
    try {
      const res: any = await api.createWorkflow({
        name: workflowName.trim(),
        enabled: false,
        nodes: [],
        edges: [],
        flow: { nodes: [], edges: [] },
      });
      setShowCreateDialog(false);
      setWorkflowName("");
      navigate(`/workflow-editor/${res.workflow.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create workflow");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await api.deleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      toast.success("Workflow deleted");
    } catch {
      toast.error("Failed to delete workflow");
    }
  };

  const handleDeleteCredential = async (id: string) => {
    try {
      await api.deleteCredential(id);
      setCredentials((prev) => prev.filter((c) => c.id !== id));
      toast.success("Credential deleted");
    } catch {
      toast.error("Failed to delete credential");
    }
  };

  const onCredentialSaved = () => {
    if (activeTab === "credentials") loadCredentials();
  };

  const renderContent = () => {
    if (loading) {
      return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
    }

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
            {workflows.length === 0 ? (
              <div className="border border-border rounded-lg p-8 bg-card text-center">
                <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No workflows yet</h3>
                <p className="text-sm text-muted-foreground">Create your first workflow to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {workflows.map((wf) => (
                  <div
                    key={wf.id}
                    className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-card hover:bg-secondary/30 transition-colors"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(`/workflow-editor/${wf.id}`)}
                    >
                      <p className="font-medium text-foreground">{wf.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {wf.enabled ? "Enabled" : "Disabled"} · Updated{" "}
                        {new Date(wf.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteWorkflow(wf.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
            {credentials.length === 0 ? (
              <div className="border border-border rounded-lg p-8 bg-card text-center">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No credentials configured</h3>
                <p className="text-sm text-muted-foreground">Add credentials to connect to external services.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {credentials.map((cred) => (
                  <div
                    key={cred.id}
                    className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-card"
                  >
                    <div>
                      <p className="font-medium text-foreground">{cred.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{cred.application}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCredential(cred.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "executions":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Executions</h2>
            {executions.length === 0 ? (
              <div className="border border-border rounded-lg p-8 bg-card text-center">
                <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No executions yet</h3>
                <p className="text-sm text-muted-foreground">Run a workflow to see execution history.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {executions.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-card"
                  >
                    <div>
                      <p className="font-medium text-foreground">{ex.workflow.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ex.started_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        ex.status === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : ex.status === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {ex.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full bg-background">
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

      <div className="p-8">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </div>

      <CredentialsDialog
        open={showCredentialsDialog}
        onOpenChange={setShowCredentialsDialog}
        onSaved={onCredentialSaved}
      />

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
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateWorkflow} disabled={!workflowName.trim() || creating}>
              {creating ? "Creating..." : "Create Workflow"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Personal;
